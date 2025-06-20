import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderItem, PaymentDetail, Product, Employee, PaymentStatus } from '../database/entities';
import { ProductsService } from '../products/products.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';

export interface PaginatedOrderResponse {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(PaymentDetail)
    private paymentDetailRepository: Repository<PaymentDetail>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, employeeId: string): Promise<OrderResponseDto> {
    const { orderItems, paymentDetails, taxRate, discountAmount = 0, ...orderData } = createOrderDto;
    const startTime = Date.now();
    
    console.log(`🛒 Starting order creation for employee: ${employeeId}`);
    console.log(`📋 Order items count: ${orderItems.length}`);
    console.log(`💳 Payment methods: ${paymentDetails.map(p => p.paymentMethod).join(', ')}`);

    return this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      try {
        let subtotal = 0;
        const orderItemsToCreate: Partial<OrderItem>[] = [];
        const stockUpdates: { productId: string; oldStock: number; newStock: number }[] = [];

        console.log(`🔍 Validating ${orderItems.length} products and stock levels`);
        
        for (const item of orderItems) {
          const product = await transactionalEntityManager.findOne(Product, {
            where: { id: item.productId, isActive: true },
          });

          if (!product) {
            console.error(`❌ Product not found: ${item.productId}`);
            throw new NotFoundException(`Product with ID ${item.productId} not found`);
          }

          if (product.stockQuantity < item.quantity) {
            console.error(`❌ Insufficient stock for ${product.name}: Available ${product.stockQuantity}, Requested ${item.quantity}`);
            throw new BadRequestException(
              `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
            );
          }

          const unitPrice = product.price;
          const totalPrice = unitPrice * item.quantity;
          subtotal += totalPrice;

          console.log(`✅ Product validated: ${product.name} (${item.quantity}x$${unitPrice} = $${totalPrice})`);

          orderItemsToCreate.push({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            notes: item.notes,
          });

          stockUpdates.push({
            productId: item.productId,
            oldStock: product.stockQuantity,
            newStock: product.stockQuantity - item.quantity
          });

          product.stockQuantity -= item.quantity;
          await transactionalEntityManager.save(Product, product);
        }

        console.log(`💰 Order totals - Subtotal: $${subtotal}, Tax Rate: ${taxRate}%`);

        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount - discountAmount;

        const totalPaymentAmount = paymentDetails.reduce((sum, payment) => sum + payment.amount, 0);
        
        if (Math.abs(totalPaymentAmount - totalAmount) > 0.01) {
          console.error(`❌ Payment mismatch: Total $${totalAmount}, Payment $${totalPaymentAmount}`);
          throw new BadRequestException('Payment amount does not match order total');
        }

        console.log(`💵 Payment validation passed: Total $${totalAmount}`);

        const order = transactionalEntityManager.create(Order, {
          employeeId,
          subtotal,
          taxAmount,
          taxRate,
          discountAmount,
          totalAmount,
          ...orderData,
        });

        const savedOrder = await transactionalEntityManager.save(Order, order);
        console.log(`📝 Order created with ID: ${savedOrder.id}`);

        // Create order items
        for (const orderItemData of orderItemsToCreate) {
          const orderItem = transactionalEntityManager.create(OrderItem, {
            orderId: savedOrder.id,
            ...orderItemData,
          });
          await transactionalEntityManager.save(OrderItem, orderItem);
        }
        console.log(`📦 Created ${orderItemsToCreate.length} order items`);

        // Create payment details
        for (const paymentData of paymentDetails) {
          const paymentDetail = transactionalEntityManager.create(PaymentDetail, {
            orderId: savedOrder.id,
            ...paymentData,
          });
          await transactionalEntityManager.save(PaymentDetail, paymentDetail);
        }
        console.log(`💳 Created ${paymentDetails.length} payment records`);

        // Log stock updates
        stockUpdates.forEach(update => {
          console.log(`📊 Stock updated for product ${update.productId}: ${update.oldStock} → ${update.newStock}`);
        });

        const processingTime = Date.now() - startTime;
        console.log(`✅ Order creation completed in ${processingTime}ms`);
        
        return this.findOne(savedOrder.id);
        
      } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error(`❌ Order creation failed after ${processingTime}ms:`, error.message);
        
        // Re-throw the error to trigger transaction rollback
        throw error;
      }
    }).catch(error => {
      console.error(`🔄 Transaction rolled back for employee ${employeeId}:`, error.message);
      throw error;
    });
  }

  async findAll(query: OrderQueryDto): Promise<PaginatedOrderResponse> {
    const {
      employeeId,
      paymentMethod,
      paymentStatus,
      fromDate,
      toDate,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.employee', 'employee')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'product')
      .leftJoinAndSelect('order.paymentDetails', 'paymentDetails');

    if (employeeId) {
      queryBuilder.andWhere('order.employeeId = :employeeId', { employeeId });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (fromDate && toDate) {
      queryBuilder.andWhere('DATE(order.createdAt) BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    } else if (fromDate) {
      queryBuilder.andWhere('DATE(order.createdAt) >= :fromDate', { fromDate });
    } else if (toDate) {
      queryBuilder.andWhere('DATE(order.createdAt) <= :toDate', { toDate });
    }

    if (search) {
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :search OR order.customerEmail LIKE :search)',
        { search: `%${search}%` }
      );
    }

    const validSortFields = ['createdAt', 'totalAmount', 'orderNumber'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`order.${sortField}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders: orders.map(OrderResponseDto.fromOrder),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['employee', 'orderItems', 'orderItems.product', 'paymentDetails'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return OrderResponseDto.fromOrder(order);
  }

  async getCurrentShiftOrders(employeeId: string): Promise<OrderResponseDto[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const orders = await this.orderRepository.find({
      where: {
        employeeId,
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: ['orderItems', 'orderItems.product', 'paymentDetails'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(OrderResponseDto.fromOrder);
  }

  async voidOrder(id: string, employeeId: string, isManager: boolean): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'paymentDetails'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only void completed orders');
    }

    if (!isManager && order.employeeId !== employeeId) {
      throw new ForbiddenException('Can only void your own orders unless you are a manager');
    }

    return this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      for (const orderItem of order.orderItems) {
        await this.productsService.restoreStock(orderItem.productId, orderItem.quantity);
      }

      order.paymentStatus = PaymentStatus.VOIDED;
      await transactionalEntityManager.save(Order, order);

      return this.findOne(id);
    });
  }

  async refundOrder(id: string): Promise<OrderResponseDto> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['orderItems', 'paymentDetails'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed orders');
    }

    return this.orderRepository.manager.transaction(async (transactionalEntityManager) => {
      for (const orderItem of order.orderItems) {
        await this.productsService.restoreStock(orderItem.productId, orderItem.quantity);
      }

      order.paymentStatus = PaymentStatus.REFUNDED;
      await transactionalEntityManager.save(Order, order);

      return this.findOne(id);
    });
  }

  async getNextOrderNumber(): Promise<{ orderNumber: string }> {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return { orderNumber: `ORD-${timestamp}-${random}` };
  }

  async getTodaysOrders(employeeId?: string): Promise<OrderResponseDto[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

    const whereCondition: any = {
      createdAt: Between(startOfDay, endOfDay),
      paymentStatus: PaymentStatus.COMPLETED,
    };

    if (employeeId) {
      whereCondition.employeeId = employeeId;
    }

    const orders = await this.orderRepository.find({
      where: whereCondition,
      relations: ['employee', 'orderItems', 'orderItems.product'],
      order: { createdAt: 'DESC' },
    });

    return orders.map(OrderResponseDto.fromOrder);
  }
}
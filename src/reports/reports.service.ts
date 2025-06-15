import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order, OrderItem, Product, Employee, PaymentStatus } from '../database/entities';
import {
  DailySalesReportDto,
  SalesSummaryReportDto,
  TopProductDto,
  EmployeePerformanceDto,
  InventoryStatusDto,
} from './dto/sales-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async getDailySalesReport(date: string): Promise<DailySalesReportDto> {
    const startDate = new Date(`${date}T00:00:00.000Z`);
    const endDate = new Date(`${date}T23:59:59.999Z`);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        paymentStatus: PaymentStatus.COMPLETED,
      },
      relations: ['orderItems', 'paymentDetails'],
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.discountAmount, 0);
    const netSales = totalRevenue + totalTax - totalDiscounts;
    const averageOrderValue = totalOrders > 0 ? netSales / totalOrders : 0;
    const totalItemsSold = orders.reduce((sum, order) => sum + order.itemCount, 0);

    const paymentMethodBreakdown = orders.reduce((breakdown, order) => {
      const method = order.paymentMethod;
      if (!breakdown[method]) {
        breakdown[method] = { count: 0, amount: 0 };
      }
      breakdown[method].count++;
      breakdown[method].amount += order.totalAmount;
      return breakdown;
    }, {} as Record<string, { count: number; amount: number }>);

    return {
      date,
      totalOrders,
      totalRevenue,
      totalTax,
      totalDiscounts,
      netSales,
      averageOrderValue,
      totalItemsSold,
      paymentMethodBreakdown,
    };
  }

  async getSalesSummaryReport(startDate: string, endDate: string): Promise<SalesSummaryReportDto> {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T23:59:59.999Z`);

    const orders = await this.orderRepository.find({
      where: {
        createdAt: Between(start, end),
        paymentStatus: PaymentStatus.COMPLETED,
      },
      relations: ['orderItems'],
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + order.discountAmount, 0);
    const netSales = totalRevenue + totalTax - totalDiscounts;
    const averageOrderValue = totalOrders > 0 ? netSales / totalOrders : 0;

    const dailyBreakdown: DailySalesReportDto[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      const dateString = current.toISOString().split('T')[0];
      const dailyReport = await this.getDailySalesReport(dateString);
      dailyBreakdown.push(dailyReport);
      current.setDate(current.getDate() + 1);
    }

    return {
      startDate,
      endDate,
      totalOrders,
      totalRevenue,
      totalTax,
      totalDiscounts,
      netSales,
      averageOrderValue,
      dailyBreakdown,
    };
  }

  async getTopProducts(period: 'daily' | 'weekly' | 'monthly', limit = 10): Promise<TopProductDto[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const result = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('product.category', 'category')
      .select([
        'product.id as productId',
        'product.name as productName',
        'category.name as categoryName',
        'SUM(orderItem.quantity) as quantitySold',
        'SUM(orderItem.totalPrice) as totalRevenue',
        'AVG(orderItem.unitPrice) as averagePrice',
      ])
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.paymentStatus = :status', { status: PaymentStatus.COMPLETED })
      .groupBy('product.id, product.name, category.name')
      .orderBy('quantitySold', 'DESC')
      .limit(limit)
      .getRawMany();

    return result.map(item => ({
      productId: item.productId,
      productName: item.productName,
      categoryName: item.categoryName,
      quantitySold: parseInt(item.quantitySold),
      totalRevenue: parseFloat(item.totalRevenue),
      averagePrice: parseFloat(item.averagePrice),
    }));
  }

  async getEmployeePerformance(
    employeeId?: string,
    period: 'daily' | 'weekly' | 'monthly' = 'daily'
  ): Promise<EmployeePerformanceDto[]> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.employee', 'employee')
      .leftJoin('order.orderItems', 'orderItems')
      .select([
        'employee.id as employeeId',
        'CONCAT(employee.firstName, \' \', employee.lastName) as employeeName',
        'COUNT(order.id) as totalOrders',
        'SUM(order.totalAmount) as totalSales',
        'AVG(order.totalAmount) as averageOrderValue',
        'SUM(orderItems.quantity) as totalItemsSold',
      ])
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.paymentStatus = :status', { status: PaymentStatus.COMPLETED });

    if (employeeId) {
      queryBuilder.andWhere('employee.id = :employeeId', { employeeId });
    }

    const result = await queryBuilder
      .groupBy('employee.id, employee.firstName, employee.lastName')
      .orderBy('totalSales', 'DESC')
      .getRawMany();

    return result.map(item => ({
      employeeId: item.employeeId,
      employeeName: item.employeeName,
      totalOrders: parseInt(item.totalOrders),
      totalSales: parseFloat(item.totalSales),
      averageOrderValue: parseFloat(item.averageOrderValue),
      totalItemsSold: parseInt(item.totalItemsSold) || 0,
    }));
  }

  async getInventoryStatus(): Promise<InventoryStatusDto[]> {
    const products = await this.productRepository.find({
      where: { isActive: true },
      relations: ['category'],
      order: { name: 'ASC' },
    });

    return products.map(product => {
      let stockStatus: 'good' | 'low' | 'out';
      
      if (product.stockQuantity === 0) {
        stockStatus = 'out';
      } else if (product.stockQuantity <= product.minStockLevel) {
        stockStatus = 'low';
      } else {
        stockStatus = 'good';
      }

      return {
        productId: product.id,
        productName: product.name,
        categoryName: product.category?.name || 'Uncategorized',
        currentStock: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        stockStatus,
        stockValue: product.stockQuantity * product.costPrice,
      };
    });
  }

  async getLowStockAlert(): Promise<InventoryStatusDto[]> {
    const inventoryStatus = await this.getInventoryStatus();
    return inventoryStatus.filter(item => item.stockStatus === 'low' || item.stockStatus === 'out');
  }
}
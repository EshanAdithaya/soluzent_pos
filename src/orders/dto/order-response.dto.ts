import { ApiProperty } from '@nestjs/swagger';
import { Order, OrderItem, PaymentDetail, PaymentMethod, PaymentStatus } from '../../database/entities';
import { EmployeeResponseDto } from '../../employees/dto/employee-response.dto';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Quantity ordered',
    example: 2,
  })
  quantity: number;

  @ApiProperty({
    description: 'Unit price at time of order',
    example: 2.50,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Total price for this item',
    example: 5.00,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Special instructions',
    example: 'Extra ice',
  })
  notes: string;

  @ApiProperty({
    description: 'Product information',
    type: ProductResponseDto,
    required: false,
  })
  product?: ProductResponseDto;

  static fromOrderItem(orderItem: OrderItem): OrderItemResponseDto {
    return {
      id: orderItem.id,
      productId: orderItem.productId,
      quantity: orderItem.quantity,
      unitPrice: orderItem.unitPrice,
      totalPrice: orderItem.totalPrice,
      notes: orderItem.notes,
      product: orderItem.product ? ProductResponseDto.fromProduct(orderItem.product) : undefined,
    };
  }
}

export class PaymentDetailResponseDto {
  @ApiProperty({
    description: 'Payment detail ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Payment method',
    enum: ['cash', 'card'],
    example: 'cash',
  })
  paymentMethod: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 25.50,
  })
  amount: number;

  @ApiProperty({
    description: 'Last 4 digits of card',
    example: '1234',
  })
  cardLast4: string;

  @ApiProperty({
    description: 'Card type',
    example: 'Visa',
  })
  cardType: string;

  @ApiProperty({
    description: 'Cash received',
    example: 30.00,
  })
  cashReceived: number;

  @ApiProperty({
    description: 'Change given',
    example: 4.50,
  })
  changeGiven: number;

  @ApiProperty({
    description: 'Payment timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  static fromPaymentDetail(paymentDetail: PaymentDetail): PaymentDetailResponseDto {
    return {
      id: paymentDetail.id,
      paymentMethod: paymentDetail.paymentMethod,
      amount: paymentDetail.amount,
      cardLast4: paymentDetail.cardLast4,
      cardType: paymentDetail.cardType,
      cashReceived: paymentDetail.cashReceived,
      changeGiven: paymentDetail.changeGiven,
      createdAt: paymentDetail.createdAt,
    };
  }
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Order number',
    example: 'ORD-1642248600000-001',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Employee ID who created the order',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  employeeId: string;

  @ApiProperty({
    description: 'Order subtotal before tax and discounts',
    example: 23.50,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Tax amount',
    example: 2.00,
  })
  taxAmount: number;

  @ApiProperty({
    description: 'Tax rate percentage',
    example: 8.5,
  })
  taxRate: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 0.00,
  })
  discountAmount: number;

  @ApiProperty({
    description: 'Total amount paid',
    example: 25.50,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    description: 'Customer email',
    example: 'customer@example.com',
  })
  customerEmail: string;

  @ApiProperty({
    description: 'Order notes',
    example: 'Customer requested extra napkins',
  })
  notes: string;

  @ApiProperty({
    description: 'Number of items in order',
    example: 3,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Order creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Order last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Employee who created the order',
    type: EmployeeResponseDto,
    required: false,
  })
  employee?: EmployeeResponseDto;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDto],
    required: false,
  })
  orderItems?: OrderItemResponseDto[];

  @ApiProperty({
    description: 'Payment details',
    type: [PaymentDetailResponseDto],
    required: false,
  })
  paymentDetails?: PaymentDetailResponseDto[];

  static fromOrder(order: Order): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      employeeId: order.employeeId,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      taxRate: order.taxRate,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      customerEmail: order.customerEmail,
      notes: order.notes,
      itemCount: order.itemCount,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      employee: order.employee ? EmployeeResponseDto.fromEmployee(order.employee) : undefined,
      orderItems: order.orderItems?.map(OrderItemResponseDto.fromOrderItem),
      paymentDetails: order.paymentDetails?.map(PaymentDetailResponseDto.fromPaymentDetail),
    };
  }
}
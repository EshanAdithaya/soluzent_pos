import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { Employee } from './employee.entity';
import { OrderItem } from './order-item.entity';
import { PaymentDetail } from './payment-detail.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  SPLIT = 'split',
}

export enum PaymentStatus {
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_number', unique: true })
  orderNumber: string;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 10, scale: 2 })
  taxAmount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 5, scale: 2 })
  taxRate: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.COMPLETED,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'customer_email', nullable: true })
  customerEmail: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.orders)
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, {
    cascade: true,
  })
  orderItems: OrderItem[];

  @OneToMany(() => PaymentDetail, (paymentDetail) => paymentDetail.order, {
    cascade: true,
  })
  paymentDetails: PaymentDetail[];

  @BeforeInsert()
  generateOrderNumber() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }

  get itemCount(): number {
    return this.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }
}
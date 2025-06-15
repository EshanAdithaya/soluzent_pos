import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';

export enum PaymentDetailMethod {
  CASH = 'cash',
  CARD = 'card',
}

@Entity('payment_details')
export class PaymentDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  orderId: string;

  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: PaymentDetailMethod,
  })
  paymentMethod: PaymentDetailMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'card_last4', nullable: true })
  cardLast4: string;

  @Column({ name: 'card_type', nullable: true })
  cardType: string;

  @Column({
    name: 'cash_received',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cashReceived: number;

  @Column({
    name: 'change_given',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  changeGiven: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Order, (order) => order.paymentDetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
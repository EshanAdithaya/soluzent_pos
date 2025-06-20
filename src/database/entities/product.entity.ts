import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { OrderItem } from './order-item.entity';

@Entity('products')
@Index(['barcode'])
@Index(['categoryId'])
@Index(['stockQuantity', 'minStockLevel'])
@Index(['isActive'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'cost_price', type: 'decimal', precision: 10, scale: 2 })
  costPrice: number;

  @Column({ unique: true, nullable: true })
  barcode: string;

  @Column({ name: 'stock_quantity', default: 0 })
  @Index()
  stockQuantity: number;

  @Column({ name: 'min_stock_level', default: 5 })
  minStockLevel: number;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  get isLowStock(): boolean {
    return this.stockQuantity <= this.minStockLevel;
  }

  get profitMargin(): number {
    if (this.price === 0) {
      return 0;
    }
    return ((this.price - this.costPrice) / this.price) * 100;
  }
}
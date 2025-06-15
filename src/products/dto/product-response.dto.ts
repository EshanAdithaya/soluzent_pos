import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../database/entities';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Coca Cola 330ml',
  })
  name: string;

  @ApiProperty({
    description: 'Product description',
    example: 'Refreshing cola soft drink',
  })
  description: string;

  @ApiProperty({
    description: 'Product selling price',
    example: 2.50,
  })
  price: number;

  @ApiProperty({
    description: 'Product cost price',
    example: 1.20,
  })
  costPrice: number;

  @ApiProperty({
    description: 'Product barcode',
    example: '1234567890123',
  })
  barcode: string;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 85,
  })
  stockQuantity: number;

  @ApiProperty({
    description: 'Minimum stock level for alerts',
    example: 10,
  })
  minStockLevel: number;

  @ApiProperty({
    description: 'Product image URL',
    example: 'https://example.com/product-image.jpg',
  })
  imageUrl: string;

  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Product active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether product is low on stock',
    example: false,
  })
  isLowStock: boolean;

  @ApiProperty({
    description: 'Profit margin percentage',
    example: 52.0,
  })
  profitMargin: number;

  @ApiProperty({
    description: 'Product category information',
    type: CategoryResponseDto,
    required: false,
  })
  category?: CategoryResponseDto;

  @ApiProperty({
    description: 'Product creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Product last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  static fromProduct(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      barcode: product.barcode,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel,
      imageUrl: product.imageUrl,
      categoryId: product.categoryId,
      isActive: product.isActive,
      isLowStock: product.isLowStock,
      profitMargin: product.profitMargin,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name,
        displayOrder: product.category.displayOrder,
        color: product.category.color,
        isActive: product.category.isActive,
        createdAt: product.category.createdAt,
        updatedAt: product.category.updatedAt,
      } : undefined,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
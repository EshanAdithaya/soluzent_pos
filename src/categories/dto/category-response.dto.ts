import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../database/entities';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Beverages',
  })
  name: string;

  @ApiProperty({
    description: 'Display order for sorting',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Category color in hex format',
    example: '#3B82F6',
  })
  color: string;

  @ApiProperty({
    description: 'Category active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Number of products in this category',
    example: 15,
  })
  productCount?: number;

  @ApiProperty({
    description: 'Category creation date',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;

  static fromCategory(category: Category): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      displayOrder: category.displayOrder,
      color: category.color,
      isActive: category.isActive,
      productCount: category.products?.length,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
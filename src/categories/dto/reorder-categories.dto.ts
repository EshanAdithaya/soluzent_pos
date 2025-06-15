import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CategoryOrderDto {
  @ApiProperty({
    description: 'Category ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'New display order',
    example: 1,
  })
  @IsNumber()
  displayOrder: number;
}

export class ReorderCategoriesDto {
  @ApiProperty({
    description: 'Array of category IDs with their new display orders',
    type: [CategoryOrderDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryOrderDto)
  categories: CategoryOrderDto[];
}
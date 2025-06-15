import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsEnum } from 'class-validator';

export enum StockAdjustmentType {
  ADD = 'add',
  SUBTRACT = 'subtract',
  SET = 'set',
}

export class AdjustStockDto {
  @ApiProperty({
    description: 'Stock adjustment type',
    enum: StockAdjustmentType,
    example: StockAdjustmentType.ADD,
  })
  @IsEnum(StockAdjustmentType)
  type: StockAdjustmentType;

  @ApiProperty({
    description: 'Quantity to adjust',
    example: 50,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Reason for stock adjustment',
    example: 'Received new shipment',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
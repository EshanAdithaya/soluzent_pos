import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsEmail,
  ValidateNested,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PaymentMethod } from '../../database/entities';
import { CreateOrderItemDto } from './create-order-item.dto';
import { CreatePaymentDetailDto } from './create-payment-detail.dto';

export class CreateOrderDto {
  @ApiProperty({
    description: 'Order items',
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];

  @ApiProperty({
    description: 'Tax rate percentage',
    example: 8.5,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  taxRate: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 5.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  discountAmount?: number;

  @ApiProperty({
    description: 'Payment method',
    enum: PaymentMethod,
    example: PaymentMethod.CASH,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Payment details',
    type: [CreatePaymentDetailDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentDetailDto)
  paymentDetails: CreatePaymentDetailDto[];

  @ApiProperty({
    description: 'Customer email for receipt',
    example: 'customer@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({
    description: 'Order notes',
    example: 'Customer requested extra napkins',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
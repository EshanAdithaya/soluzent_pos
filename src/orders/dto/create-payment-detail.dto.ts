import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaymentDetailMethod } from '../../database/entities';

export class CreatePaymentDetailDto {
  @ApiProperty({
    description: 'Payment method',
    enum: PaymentDetailMethod,
    example: PaymentDetailMethod.CASH,
  })
  @IsEnum(PaymentDetailMethod)
  paymentMethod: PaymentDetailMethod;

  @ApiProperty({
    description: 'Payment amount',
    example: 25.50,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @ApiProperty({
    description: 'Last 4 digits of card (for card payments)',
    example: '1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardLast4?: string;

  @ApiProperty({
    description: 'Card type (Visa, MasterCard, etc.)',
    example: 'Visa',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardType?: string;

  @ApiProperty({
    description: 'Cash received amount (for cash payments)',
    example: 30.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  cashReceived?: number;

  @ApiProperty({
    description: 'Change given to customer (for cash payments)',
    example: 4.50,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  changeGiven?: number;
}
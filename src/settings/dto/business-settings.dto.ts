import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEmail, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class BusinessSettingsDto {
  @ApiProperty({
    description: 'Business name',
    example: 'My Coffee Shop',
  })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({
    description: 'Business address',
    example: '123 Main Street, City, State 12345',
  })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({
    description: 'Business phone number',
    example: '(555) 123-4567',
  })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({
    description: 'Business email',
    example: 'info@mycoffeeshop.com',
  })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiProperty({
    description: 'Default tax rate percentage',
    example: 8.25,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  defaultTaxRate?: number;

  @ApiProperty({
    description: 'Business currency code',
    example: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Business timezone',
    example: 'America/New_York',
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Receipt footer text',
    example: 'Thank you for your business!',
  })
  @IsOptional()
  @IsString()
  receiptFooter?: string;
}
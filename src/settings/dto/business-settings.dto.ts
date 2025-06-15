import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEmail, Min, Max, IsBoolean, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export enum PrinterType {
  THERMAL = 'thermal',
  INKJET = 'inkjet',
  LASER = 'laser',
}

export enum ReceiptSize {
  SMALL = '58mm',
  MEDIUM = '80mm',
  LARGE = '112mm',
}

export enum CurrencyFormat {
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  CAD = 'CAD',
  AUD = 'AUD',
}

export class ReceiptSettingsDto {
  @ApiProperty({ description: 'Show business logo on receipt', example: true })
  @IsOptional()
  @IsBoolean()
  showLogo?: boolean;

  @ApiProperty({ description: 'Receipt header text', example: 'Welcome to our store!' })
  @IsOptional()
  @IsString()
  headerText?: string;

  @ApiProperty({ description: 'Receipt footer text', example: 'Thank you for your business!' })
  @IsOptional()
  @IsString()
  footerText?: string;

  @ApiProperty({ description: 'Show order number on receipt', example: true })
  @IsOptional()
  @IsBoolean()
  showOrderNumber?: boolean;

  @ApiProperty({ description: 'Show cashier name on receipt', example: true })
  @IsOptional()
  @IsBoolean()
  showCashierName?: boolean;

  @ApiProperty({ description: 'Show customer info on receipt', example: false })
  @IsOptional()
  @IsBoolean()
  showCustomerInfo?: boolean;

  @ApiProperty({ description: 'Print duplicate receipt', example: false })
  @IsOptional()
  @IsBoolean()
  printDuplicate?: boolean;

  @ApiProperty({ description: 'Printer type', enum: PrinterType, example: PrinterType.THERMAL })
  @IsOptional()
  @IsEnum(PrinterType)
  printerType?: PrinterType;

  @ApiProperty({ description: 'Receipt paper size', enum: ReceiptSize, example: ReceiptSize.MEDIUM })
  @IsOptional()
  @IsEnum(ReceiptSize)
  receiptSize?: ReceiptSize;
}

export class PaymentSettingsDto {
  @ApiProperty({ description: 'Accept cash payments', example: true })
  @IsOptional()
  @IsBoolean()
  acceptCash?: boolean;

  @ApiProperty({ description: 'Accept card payments', example: true })
  @IsOptional()
  @IsBoolean()
  acceptCard?: boolean;

  @ApiProperty({ description: 'Accept contactless payments', example: true })
  @IsOptional()
  @IsBoolean()
  acceptContactless?: boolean;

  @ApiProperty({ description: 'Accept mobile payments', example: true })
  @IsOptional()
  @IsBoolean()
  acceptMobile?: boolean;

  @ApiProperty({ description: 'Require manager approval for voids', example: true })
  @IsOptional()
  @IsBoolean()
  requireManagerApprovalForVoids?: boolean;

  @ApiProperty({ description: 'Require manager approval for refunds', example: true })
  @IsOptional()
  @IsBoolean()
  requireManagerApprovalForRefunds?: boolean;

  @ApiProperty({ description: 'Maximum cash drawer amount', example: 500.00 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  maxCashDrawerAmount?: number;

  @ApiProperty({ description: 'Tip percentage options', example: [15, 18, 20, 25] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tipPercentageOptions?: number[];
}

export class InventorySettingsDto {
  @ApiProperty({ description: 'Enable low stock alerts', example: true })
  @IsOptional()
  @IsBoolean()
  enableLowStockAlerts?: boolean;

  @ApiProperty({ description: 'Default minimum stock level', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultMinStockLevel?: number;

  @ApiProperty({ description: 'Auto-order when stock is low', example: false })
  @IsOptional()
  @IsBoolean()
  autoOrderWhenLow?: boolean;

  @ApiProperty({ description: 'Track product expiry dates', example: true })
  @IsOptional()
  @IsBoolean()
  trackExpiryDates?: boolean;

  @ApiProperty({ description: 'Enable barcode scanning', example: true })
  @IsOptional()
  @IsBoolean()
  enableBarcodeScanning?: boolean;

  @ApiProperty({ description: 'Require product categories', example: true })
  @IsOptional()
  @IsBoolean()
  requireProductCategories?: boolean;
}

export class SecuritySettingsDto {
  @ApiProperty({ description: 'Session timeout in minutes', example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(480)
  sessionTimeoutMinutes?: number;

  @ApiProperty({ description: 'Require strong passwords', example: true })
  @IsOptional()
  @IsBoolean()
  requireStrongPasswords?: boolean;

  @ApiProperty({ description: 'Enable audit logging', example: true })
  @IsOptional()
  @IsBoolean()
  enableAuditLogging?: boolean;

  @ApiProperty({ description: 'Lock register after failed attempts', example: true })
  @IsOptional()
  @IsBoolean()
  lockAfterFailedAttempts?: boolean;

  @ApiProperty({ description: 'Number of failed attempts before lock', example: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  failedAttemptsLimit?: number;

  @ApiProperty({ description: 'Backup data automatically', example: true })
  @IsOptional()
  @IsBoolean()
  autoBackup?: boolean;
}

export class OperationalSettingsDto {
  @ApiProperty({ description: 'Default shift start time (24h format)', example: '08:00' })
  @IsOptional()
  @IsString()
  defaultShiftStartTime?: string;

  @ApiProperty({ description: 'Default shift end time (24h format)', example: '20:00' })
  @IsOptional()
  @IsString()
  defaultShiftEndTime?: string;

  @ApiProperty({ description: 'Enable break reminders', example: true })
  @IsOptional()
  @IsBoolean()
  enableBreakReminders?: boolean;

  @ApiProperty({ description: 'Break reminder interval in hours', example: 4 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  breakReminderInterval?: number;

  @ApiProperty({ description: 'Enable customer display', example: false })
  @IsOptional()
  @IsBoolean()
  enableCustomerDisplay?: boolean;

  @ApiProperty({ description: 'Round totals to nearest cent', example: true })
  @IsOptional()
  @IsBoolean()
  roundTotals?: boolean;

  @ApiProperty({ description: 'Enable loyalty program', example: false })
  @IsOptional()
  @IsBoolean()
  enableLoyaltyProgram?: boolean;
}

export class BusinessSettingsDto {
  // Basic Business Information
  @ApiProperty({ description: 'Business name', example: 'My Coffee Shop' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiProperty({ description: 'Business address', example: '123 Main Street, City, State 12345' })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @ApiProperty({ description: 'Business phone number', example: '(555) 123-4567' })
  @IsOptional()
  @IsString()
  businessPhone?: string;

  @ApiProperty({ description: 'Business email', example: 'info@mycoffeeshop.com' })
  @IsOptional()
  @IsEmail()
  businessEmail?: string;

  @ApiProperty({ description: 'Business website', example: 'https://mycoffeeshop.com' })
  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @ApiProperty({ description: 'Business registration number', example: 'REG123456789' })
  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @ApiProperty({ description: 'Tax identification number', example: 'TAX987654321' })
  @IsOptional()
  @IsString()
  taxId?: string;

  // Financial Settings
  @ApiProperty({ description: 'Default tax rate percentage', example: 8.25 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  defaultTaxRate?: number;

  @ApiProperty({ description: 'Currency format', enum: CurrencyFormat, example: CurrencyFormat.USD })
  @IsOptional()
  @IsEnum(CurrencyFormat)
  currency?: CurrencyFormat;

  @ApiProperty({ description: 'Business timezone', example: 'America/New_York' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'Enable multiple tax rates', example: false })
  @IsOptional()
  @IsBoolean()
  enableMultipleTaxRates?: boolean;

  @ApiProperty({ description: 'Secondary tax rate', example: 2.5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  secondaryTaxRate?: number;

  // Receipt Settings
  @ApiProperty({ description: 'Receipt configuration', type: ReceiptSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ReceiptSettingsDto)
  receiptSettings?: ReceiptSettingsDto;

  // Payment Settings
  @ApiProperty({ description: 'Payment configuration', type: PaymentSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  paymentSettings?: PaymentSettingsDto;

  // Inventory Settings
  @ApiProperty({ description: 'Inventory configuration', type: InventorySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => InventorySettingsDto)
  inventorySettings?: InventorySettingsDto;

  // Security Settings
  @ApiProperty({ description: 'Security configuration', type: SecuritySettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => SecuritySettingsDto)
  securitySettings?: SecuritySettingsDto;

  // Operational Settings
  @ApiProperty({ description: 'Operational configuration', type: OperationalSettingsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperationalSettingsDto)
  operationalSettings?: OperationalSettingsDto;
}
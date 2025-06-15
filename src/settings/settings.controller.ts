import { Controller, Get, Put, Post, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { 
  BusinessSettingsDto, 
  ReceiptSettingsDto, 
  PaymentSettingsDto, 
  InventorySettingsDto, 
  SecuritySettingsDto, 
  OperationalSettingsDto,
  CurrencyFormat
} from './dto/business-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmployeeRole, Employee } from '../database/entities';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EmployeeRole.MANAGER)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Business Settings
  @Get()
  @ApiOperation({
    summary: 'Get comprehensive business settings',
    description: 'Retrieve all business configuration including receipts, payments, inventory, security, and operational settings (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings retrieved successfully',
    type: BusinessSettingsDto,
  })
  async getBusinessSettings(@CurrentUser() user: Employee): Promise<BusinessSettingsDto> {
    console.log(`⚙️  Settings accessed by manager: ${user.username}`);
    return this.settingsService.getBusinessSettings();
  }

  @Put()
  @ApiOperation({
    summary: 'Update business settings',
    description: 'Update comprehensive business configuration (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings updated successfully',
    type: BusinessSettingsDto,
  })
  async updateBusinessSettings(
    @Body() settings: BusinessSettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<BusinessSettingsDto> {
    console.log(`⚙️  Settings updated by manager: ${user.username}`);
    return this.settingsService.updateBusinessSettings(settings);
  }

  // Receipt Settings
  @Get('receipts')
  @ApiOperation({
    summary: 'Get receipt and printing settings',
    description: 'Retrieve receipt configuration including printer settings, header/footer text, and receipt format options',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt settings retrieved successfully',
    type: ReceiptSettingsDto,
  })
  async getReceiptSettings(): Promise<ReceiptSettingsDto> {
    return this.settingsService.getReceiptSettings();
  }

  @Put('receipts')
  @ApiOperation({
    summary: 'Update receipt settings',
    description: 'Configure receipt printing, header/footer text, printer type, and receipt format',
  })
  @ApiResponse({
    status: 200,
    description: 'Receipt settings updated successfully',
    type: ReceiptSettingsDto,
  })
  async updateReceiptSettings(
    @Body() settings: ReceiptSettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<ReceiptSettingsDto> {
    console.log(`🧾 Receipt settings updated by: ${user.username}`);
    return this.settingsService.updateReceiptSettings(settings);
  }

  // Payment Settings
  @Get('payments')
  @ApiOperation({
    summary: 'Get payment configuration',
    description: 'Retrieve payment method settings, cash drawer limits, tip options, and approval requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment settings retrieved successfully',
    type: PaymentSettingsDto,
  })
  async getPaymentSettings(): Promise<PaymentSettingsDto> {
    return this.settingsService.getPaymentSettings();
  }

  @Put('payments')
  @ApiOperation({
    summary: 'Update payment settings',
    description: 'Configure accepted payment methods, cash drawer limits, tip percentages, and manager approval requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment settings updated successfully',
    type: PaymentSettingsDto,
  })
  async updatePaymentSettings(
    @Body() settings: PaymentSettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<PaymentSettingsDto> {
    console.log(`💳 Payment settings updated by: ${user.username}`);
    return this.settingsService.updatePaymentSettings(settings);
  }

  // Inventory Settings
  @Get('inventory')
  @ApiOperation({
    summary: 'Get inventory management settings',
    description: 'Retrieve inventory configuration including low stock alerts, barcode scanning, and category requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory settings retrieved successfully',
    type: InventorySettingsDto,
  })
  async getInventorySettings(): Promise<InventorySettingsDto> {
    return this.settingsService.getInventorySettings();
  }

  @Put('inventory')
  @ApiOperation({
    summary: 'Update inventory settings',
    description: 'Configure low stock alerts, minimum stock levels, barcode scanning, expiry tracking, and category requirements',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory settings updated successfully',
    type: InventorySettingsDto,
  })
  async updateInventorySettings(
    @Body() settings: InventorySettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<InventorySettingsDto> {
    console.log(`📦 Inventory settings updated by: ${user.username}`);
    return this.settingsService.updateInventorySettings(settings);
  }

  // Security Settings
  @Get('security')
  @ApiOperation({
    summary: 'Get security configuration',
    description: 'Retrieve security settings including session timeouts, password requirements, audit logging, and backup settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Security settings retrieved successfully',
    type: SecuritySettingsDto,
  })
  async getSecuritySettings(): Promise<SecuritySettingsDto> {
    return this.settingsService.getSecuritySettings();
  }

  @Put('security')
  @ApiOperation({
    summary: 'Update security settings',
    description: 'Configure session timeouts, password policies, failed login limits, audit logging, and automatic backup',
  })
  @ApiResponse({
    status: 200,
    description: 'Security settings updated successfully',
    type: SecuritySettingsDto,
  })
  async updateSecuritySettings(
    @Body() settings: SecuritySettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<SecuritySettingsDto> {
    console.log(`🔒 Security settings updated by: ${user.username}`);
    return this.settingsService.updateSecuritySettings(settings);
  }

  // Operational Settings
  @Get('operations')
  @ApiOperation({
    summary: 'Get operational configuration',
    description: 'Retrieve operational settings including shift times, break reminders, customer display, and loyalty program',
  })
  @ApiResponse({
    status: 200,
    description: 'Operational settings retrieved successfully',
    type: OperationalSettingsDto,
  })
  async getOperationalSettings(): Promise<OperationalSettingsDto> {
    return this.settingsService.getOperationalSettings();
  }

  @Put('operations')
  @ApiOperation({
    summary: 'Update operational settings',
    description: 'Configure shift times, break reminders, customer display, total rounding, and loyalty program settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Operational settings updated successfully',
    type: OperationalSettingsDto,
  })
  async updateOperationalSettings(
    @Body() settings: OperationalSettingsDto,
    @CurrentUser() user: Employee,
  ): Promise<OperationalSettingsDto> {
    console.log(`⏰ Operational settings updated by: ${user.username}`);
    return this.settingsService.updateOperationalSettings(settings);
  }

  // Tax Settings
  @Get('tax-rates')
  @ApiOperation({
    summary: 'Get tax configuration',
    description: 'Retrieve current tax rates, currency, and multiple tax rate settings (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        defaultTaxRate: { type: 'number', example: 8.25 },
        currency: { type: 'string', example: 'USD' },
        enableMultipleTaxRates: { type: 'boolean', example: false },
        secondaryTaxRate: { type: 'number', example: 2.5 },
      },
    },
  })
  async getTaxRates(): Promise<{ 
    defaultTaxRate: number; 
    currency: CurrencyFormat; 
    enableMultipleTaxRates: boolean;
    secondaryTaxRate?: number;
  }> {
    return this.settingsService.getTaxRates();
  }

  @Put('tax-rates')
  @ApiOperation({
    summary: 'Update tax rates',
    description: 'Update primary and secondary tax rates (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax rates updated successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        taxRate: { type: 'number', example: 8.25 },
        secondaryTaxRate: { type: 'number', example: 2.5 },
      },
    },
  })
  async updateTaxRates(
    @Body() body: { taxRate: number; secondaryTaxRate?: number },
    @CurrentUser() user: Employee,
  ): Promise<{ 
    defaultTaxRate: number; 
    currency: CurrencyFormat;
    enableMultipleTaxRates: boolean;
    secondaryTaxRate?: number;
  }> {
    console.log(`💰 Tax rates updated by: ${user.username}`);
    return this.settingsService.updateTaxRates(body.taxRate, body.secondaryTaxRate);
  }

  // System Management
  @Get('system-info')
  @ApiOperation({
    summary: 'Get system information',
    description: 'Retrieve system version, health status, and basic statistics',
  })
  @ApiResponse({
    status: 200,
    description: 'System information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        version: { type: 'string', example: '1.0.0' },
        lastUpdated: { type: 'string', example: '2024-01-01T12:00:00Z' },
        totalProducts: { type: 'number', example: 150 },
        totalEmployees: { type: 'number', example: 8 },
        systemHealth: { type: 'string', example: 'healthy' },
      },
    },
  })
  async getSystemInfo(): Promise<{
    version: string;
    lastUpdated: string;
    totalProducts: number;
    totalEmployees: number;
    systemHealth: string;
  }> {
    return this.settingsService.getSystemInfo();
  }

  @Post('reset-defaults')
  @ApiOperation({
    summary: 'Reset settings to defaults',
    description: 'Reset all settings to factory defaults (Manager only - use with caution)',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings reset to defaults successfully',
    type: BusinessSettingsDto,
  })
  async resetToDefaults(@CurrentUser() user: Employee): Promise<BusinessSettingsDto> {
    console.log(`🔄 Settings reset to defaults by manager: ${user.username}`);
    return this.settingsService.resetToDefaults();
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export settings configuration',
    description: 'Export all settings as JSON for backup or migration purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings exported successfully',
    schema: {
      type: 'string',
      example: '{"businessName": "My Store", ...}',
    },
  })
  async exportSettings(@CurrentUser() user: Employee): Promise<{ data: string }> {
    console.log(`📤 Settings exported by manager: ${user.username}`);
    const data = await this.settingsService.exportSettings();
    return { data };
  }

  @Post('import')
  @ApiOperation({
    summary: 'Import settings configuration',
    description: 'Import settings from JSON configuration (Manager only - use with caution)',
  })
  @ApiResponse({
    status: 200,
    description: 'Settings imported successfully',
    type: BusinessSettingsDto,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        settingsJson: { 
          type: 'string', 
          example: '{"businessName": "Imported Store", "defaultTaxRate": 9.5}',
          description: 'JSON string containing settings configuration'
        },
      },
    },
  })
  async importSettings(
    @Body() body: { settingsJson: string },
    @CurrentUser() user: Employee,
  ): Promise<BusinessSettingsDto> {
    console.log(`📥 Settings import attempted by manager: ${user.username}`);
    return this.settingsService.importSettings(body.settingsJson);
  }
}
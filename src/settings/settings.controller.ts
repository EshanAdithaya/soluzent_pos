import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { BusinessSettingsDto } from './dto/business-settings.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmployeeRole } from '../database/entities';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EmployeeRole.MANAGER)
@ApiBearerAuth('JWT-auth')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get business settings',
    description: 'Retrieve current business configuration (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings retrieved successfully',
    type: BusinessSettingsDto,
  })
  async getBusinessSettings(): Promise<BusinessSettingsDto> {
    return this.settingsService.getBusinessSettings();
  }

  @Put()
  @ApiOperation({
    summary: 'Update business settings',
    description: 'Update business configuration (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Business settings updated successfully',
    type: BusinessSettingsDto,
  })
  async updateBusinessSettings(
    @Body() settings: BusinessSettingsDto,
  ): Promise<BusinessSettingsDto> {
    return this.settingsService.updateBusinessSettings(settings);
  }

  @Get('tax-rates')
  @ApiOperation({
    summary: 'Get tax configuration',
    description: 'Retrieve current tax rates and currency (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax configuration retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        defaultTaxRate: { type: 'number', example: 8.25 },
        currency: { type: 'string', example: 'USD' },
      },
    },
  })
  async getTaxRates(): Promise<{ defaultTaxRate: number; currency: string }> {
    return this.settingsService.getTaxRates();
  }

  @Put('tax-rates')
  @ApiOperation({
    summary: 'Update tax rates',
    description: 'Update default tax rate (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tax rates updated successfully',
    schema: {
      type: 'object',
      properties: {
        defaultTaxRate: { type: 'number', example: 8.25 },
        currency: { type: 'string', example: 'USD' },
      },
    },
  })
  async updateTaxRates(
    @Body() body: { taxRate: number },
  ): Promise<{ defaultTaxRate: number; currency: string }> {
    return this.settingsService.updateTaxRates(body.taxRate);
  }
}
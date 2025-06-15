import { Injectable } from '@nestjs/common';
import { BusinessSettingsDto } from './dto/business-settings.dto';

@Injectable()
export class SettingsService {
  private businessSettings: BusinessSettingsDto = {
    businessName: 'POS System',
    businessAddress: '123 Business Street, City, State 12345',
    businessPhone: '(555) 123-4567',
    businessEmail: 'info@possystem.com',
    defaultTaxRate: 8.25,
    currency: 'USD',
    timezone: 'America/New_York',
    receiptFooter: 'Thank you for your business!',
  };

  async getBusinessSettings(): Promise<BusinessSettingsDto> {
    return this.businessSettings;
  }

  async updateBusinessSettings(settings: BusinessSettingsDto): Promise<BusinessSettingsDto> {
    this.businessSettings = { ...this.businessSettings, ...settings };
    return this.businessSettings;
  }

  async getTaxRates(): Promise<{ defaultTaxRate: number; currency: string }> {
    return {
      defaultTaxRate: this.businessSettings.defaultTaxRate,
      currency: this.businessSettings.currency,
    };
  }

  async updateTaxRates(taxRate: number): Promise<{ defaultTaxRate: number; currency: string }> {
    this.businessSettings.defaultTaxRate = taxRate;
    return this.getTaxRates();
  }
}
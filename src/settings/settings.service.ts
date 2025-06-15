import { Injectable } from '@nestjs/common';
import { 
  BusinessSettingsDto, 
  ReceiptSettingsDto, 
  PaymentSettingsDto, 
  InventorySettingsDto, 
  SecuritySettingsDto, 
  OperationalSettingsDto,
  CurrencyFormat,
  PrinterType,
  ReceiptSize
} from './dto/business-settings.dto';

@Injectable()
export class SettingsService {
  private businessSettings: BusinessSettingsDto = {
    // Basic Business Information
    businessName: 'POS System',
    businessAddress: '123 Business Street, City, State 12345',
    businessPhone: '(555) 123-4567',
    businessEmail: 'info@possystem.com',
    businessWebsite: 'https://possystem.com',
    businessRegistrationNumber: 'REG123456789',
    taxId: 'TAX987654321',
    
    // Financial Settings
    defaultTaxRate: 8.25,
    currency: CurrencyFormat.USD,
    timezone: 'America/New_York',
    enableMultipleTaxRates: false,
    secondaryTaxRate: 0,
    
    // Receipt Settings
    receiptSettings: {
      showLogo: true,
      headerText: 'Welcome to our store!',
      footerText: 'Thank you for your business!',
      showOrderNumber: true,
      showCashierName: true,
      showCustomerInfo: false,
      printDuplicate: false,
      printerType: PrinterType.THERMAL,
      receiptSize: ReceiptSize.MEDIUM,
    },
    
    // Payment Settings
    paymentSettings: {
      acceptCash: true,
      acceptCard: true,
      acceptContactless: true,
      acceptMobile: true,
      requireManagerApprovalForVoids: true,
      requireManagerApprovalForRefunds: true,
      maxCashDrawerAmount: 500.00,
      tipPercentageOptions: [15, 18, 20, 25],
    },
    
    // Inventory Settings
    inventorySettings: {
      enableLowStockAlerts: true,
      defaultMinStockLevel: 10,
      autoOrderWhenLow: false,
      trackExpiryDates: true,
      enableBarcodeScanning: true,
      requireProductCategories: true,
    },
    
    // Security Settings
    securitySettings: {
      sessionTimeoutMinutes: 60,
      requireStrongPasswords: true,
      enableAuditLogging: true,
      lockAfterFailedAttempts: true,
      failedAttemptsLimit: 3,
      autoBackup: true,
    },
    
    // Operational Settings
    operationalSettings: {
      defaultShiftStartTime: '08:00',
      defaultShiftEndTime: '20:00',
      enableBreakReminders: true,
      breakReminderInterval: 4,
      enableCustomerDisplay: false,
      roundTotals: true,
      enableLoyaltyProgram: false,
    },
  };

  async getBusinessSettings(): Promise<BusinessSettingsDto> {
    console.log(`⚙️  Loading business settings for: ${this.businessSettings.businessName}`);
    return this.businessSettings;
  }

  async updateBusinessSettings(settings: BusinessSettingsDto): Promise<BusinessSettingsDto> {
    const previousSettings = { ...this.businessSettings };
    this.businessSettings = { ...this.businessSettings, ...settings };
    
    console.log(`⚙️  Business settings updated`);
    console.log(`📊 Changes applied to: ${Object.keys(settings).join(', ')}`);
    
    return this.businessSettings;
  }

  async getReceiptSettings(): Promise<ReceiptSettingsDto> {
    console.log(`🧾 Loading receipt settings`);
    return this.businessSettings.receiptSettings || {};
  }

  async updateReceiptSettings(settings: ReceiptSettingsDto): Promise<ReceiptSettingsDto> {
    this.businessSettings.receiptSettings = { 
      ...this.businessSettings.receiptSettings, 
      ...settings 
    };
    
    console.log(`🧾 Receipt settings updated: ${Object.keys(settings).join(', ')}`);
    return this.businessSettings.receiptSettings;
  }

  async getPaymentSettings(): Promise<PaymentSettingsDto> {
    console.log(`💳 Loading payment settings`);
    return this.businessSettings.paymentSettings || {};
  }

  async updatePaymentSettings(settings: PaymentSettingsDto): Promise<PaymentSettingsDto> {
    this.businessSettings.paymentSettings = { 
      ...this.businessSettings.paymentSettings, 
      ...settings 
    };
    
    console.log(`💳 Payment settings updated: ${Object.keys(settings).join(', ')}`);
    return this.businessSettings.paymentSettings;
  }

  async getInventorySettings(): Promise<InventorySettingsDto> {
    console.log(`📦 Loading inventory settings`);
    return this.businessSettings.inventorySettings || {};
  }

  async updateInventorySettings(settings: InventorySettingsDto): Promise<InventorySettingsDto> {
    this.businessSettings.inventorySettings = { 
      ...this.businessSettings.inventorySettings, 
      ...settings 
    };
    
    console.log(`📦 Inventory settings updated: ${Object.keys(settings).join(', ')}`);
    return this.businessSettings.inventorySettings;
  }

  async getSecuritySettings(): Promise<SecuritySettingsDto> {
    console.log(`🔒 Loading security settings`);
    return this.businessSettings.securitySettings || {};
  }

  async updateSecuritySettings(settings: SecuritySettingsDto): Promise<SecuritySettingsDto> {
    this.businessSettings.securitySettings = { 
      ...this.businessSettings.securitySettings, 
      ...settings 
    };
    
    console.log(`🔒 Security settings updated: ${Object.keys(settings).join(', ')}`);
    return this.businessSettings.securitySettings;
  }

  async getOperationalSettings(): Promise<OperationalSettingsDto> {
    console.log(`⏰ Loading operational settings`);
    return this.businessSettings.operationalSettings || {};
  }

  async updateOperationalSettings(settings: OperationalSettingsDto): Promise<OperationalSettingsDto> {
    this.businessSettings.operationalSettings = { 
      ...this.businessSettings.operationalSettings, 
      ...settings 
    };
    
    console.log(`⏰ Operational settings updated: ${Object.keys(settings).join(', ')}`);
    return this.businessSettings.operationalSettings;
  }

  async getTaxRates(): Promise<{ 
    defaultTaxRate: number; 
    currency: CurrencyFormat; 
    enableMultipleTaxRates: boolean;
    secondaryTaxRate?: number;
  }> {
    return {
      defaultTaxRate: this.businessSettings.defaultTaxRate,
      currency: this.businessSettings.currency,
      enableMultipleTaxRates: this.businessSettings.enableMultipleTaxRates,
      secondaryTaxRate: this.businessSettings.secondaryTaxRate,
    };
  }

  async updateTaxRates(taxRate: number, secondaryTaxRate?: number): Promise<{ 
    defaultTaxRate: number; 
    currency: CurrencyFormat;
    enableMultipleTaxRates: boolean;
    secondaryTaxRate?: number;
  }> {
    this.businessSettings.defaultTaxRate = taxRate;
    if (secondaryTaxRate !== undefined) {
      this.businessSettings.secondaryTaxRate = secondaryTaxRate;
      this.businessSettings.enableMultipleTaxRates = true;
    }
    
    console.log(`💰 Tax rates updated - Primary: ${taxRate}%, Secondary: ${secondaryTaxRate || 0}%`);
    return this.getTaxRates();
  }

  async resetToDefaults(): Promise<BusinessSettingsDto> {
    console.log(`🔄 Resetting all settings to default values`);
    
    const defaultSettings = new SettingsService();
    this.businessSettings = defaultSettings.businessSettings;
    
    console.log(`✅ Settings reset completed`);
    return this.businessSettings;
  }

  async exportSettings(): Promise<string> {
    console.log(`📤 Exporting settings configuration`);
    return JSON.stringify(this.businessSettings, null, 2);
  }

  async importSettings(settingsJson: string): Promise<BusinessSettingsDto> {
    try {
      const importedSettings = JSON.parse(settingsJson);
      this.businessSettings = { ...this.businessSettings, ...importedSettings };
      
      console.log(`📥 Settings imported successfully`);
      return this.businessSettings;
    } catch (error) {
      console.error(`❌ Failed to import settings:`, error.message);
      throw new Error('Invalid settings format');
    }
  }

  async getSystemInfo(): Promise<{
    version: string;
    lastUpdated: string;
    totalProducts: number;
    totalEmployees: number;
    systemHealth: string;
  }> {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalProducts: 0, // Would be fetched from database in real implementation
      totalEmployees: 0, // Would be fetched from database in real implementation
      systemHealth: 'healthy',
    };
  }
}
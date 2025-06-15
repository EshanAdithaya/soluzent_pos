import { ApiProperty } from '@nestjs/swagger';

export class DailySalesReportDto {
  @ApiProperty({
    description: 'Report date',
    example: '2024-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Total number of orders',
    example: 125,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue before tax and discounts',
    example: 2450.75,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total tax amount collected',
    example: 208.31,
  })
  totalTax: number;

  @ApiProperty({
    description: 'Total discounts given',
    example: 125.50,
  })
  totalDiscounts: number;

  @ApiProperty({
    description: 'Net sales after discounts',
    example: 2533.56,
  })
  netSales: number;

  @ApiProperty({
    description: 'Average order value',
    example: 20.27,
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Total items sold',
    example: 245,
  })
  totalItemsSold: number;

  @ApiProperty({
    description: 'Payment method breakdown',
    example: {
      cash: { count: 75, amount: 1520.25 },
      card: { count: 45, amount: 890.50 },
      split: { count: 5, amount: 122.81 }
    },
  })
  paymentMethodBreakdown: Record<string, { count: number; amount: number }>;
}

export class SalesSummaryReportDto {
  @ApiProperty({
    description: 'Start date of report period',
    example: '2024-01-01',
  })
  startDate: string;

  @ApiProperty({
    description: 'End date of report period',
    example: '2024-01-31',
  })
  endDate: string;

  @ApiProperty({
    description: 'Total number of orders',
    example: 3250,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total revenue',
    example: 65750.25,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Total tax collected',
    example: 5588.77,
  })
  totalTax: number;

  @ApiProperty({
    description: 'Total discounts given',
    example: 3287.50,
  })
  totalDiscounts: number;

  @ApiProperty({
    description: 'Net sales',
    example: 68051.52,
  })
  netSales: number;

  @ApiProperty({
    description: 'Average order value',
    example: 20.93,
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Daily breakdown',
    type: [DailySalesReportDto],
  })
  dailyBreakdown: DailySalesReportDto[];
}

export class TopProductDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Coca Cola 330ml',
  })
  productName: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Beverages',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Quantity sold',
    example: 125,
  })
  quantitySold: number;

  @ApiProperty({
    description: 'Total revenue from this product',
    example: 312.50,
  })
  totalRevenue: number;

  @ApiProperty({
    description: 'Average selling price',
    example: 2.50,
  })
  averagePrice: number;
}

export class EmployeePerformanceDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  employeeId: string;

  @ApiProperty({
    description: 'Employee name',
    example: 'John Doe',
  })
  employeeName: string;

  @ApiProperty({
    description: 'Total orders processed',
    example: 245,
  })
  totalOrders: number;

  @ApiProperty({
    description: 'Total sales amount',
    example: 4850.75,
  })
  totalSales: number;

  @ApiProperty({
    description: 'Average order value',
    example: 19.80,
  })
  averageOrderValue: number;

  @ApiProperty({
    description: 'Total items sold',
    example: 520,
  })
  totalItemsSold: number;
}

export class InventoryStatusDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Coca Cola 330ml',
  })
  productName: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Beverages',
  })
  categoryName: string;

  @ApiProperty({
    description: 'Current stock quantity',
    example: 25,
  })
  currentStock: number;

  @ApiProperty({
    description: 'Minimum stock level',
    example: 10,
  })
  minStockLevel: number;

  @ApiProperty({
    description: 'Stock status',
    example: 'low',
    enum: ['good', 'low', 'out'],
  })
  stockStatus: 'good' | 'low' | 'out';

  @ApiProperty({
    description: 'Cost value of current stock',
    example: 30.00,
  })
  stockValue: number;
}
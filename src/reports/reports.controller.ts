import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  DailySalesReportDto,
  SalesSummaryReportDto,
  TopProductDto,
  EmployeePerformanceDto,
  InventoryStatusDto,
} from './dto/sales-report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmployeeRole } from '../database/entities';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EmployeeRole.MANAGER)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-sales')
  @ApiOperation({
    summary: 'Get daily sales report',
    description: 'Retrieve sales report for a specific date (Manager only)',
  })
  @ApiQuery({
    name: 'date',
    description: 'Report date in YYYY-MM-DD format',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily sales report retrieved successfully',
    type: DailySalesReportDto,
  })
  async getDailySalesReport(@Query('date') date: string): Promise<DailySalesReportDto> {
    return this.reportsService.getDailySalesReport(date);
  }

  @Get('sales-summary')
  @ApiOperation({
    summary: 'Get sales summary report',
    description: 'Retrieve sales summary for a date range (Manager only)',
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date in YYYY-MM-DD format',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date in YYYY-MM-DD format',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales summary report retrieved successfully',
    type: SalesSummaryReportDto,
  })
  async getSalesSummaryReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<SalesSummaryReportDto> {
    return this.reportsService.getSalesSummaryReport(startDate, endDate);
  }

  @Get('top-products')
  @ApiOperation({
    summary: 'Get top selling products',
    description: 'Retrieve top selling products for specified period (Manager only)',
  })
  @ApiQuery({
    name: 'period',
    description: 'Report period',
    enum: ['daily', 'weekly', 'monthly'],
    example: 'daily',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of top products to return',
    example: 10,
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Top products report retrieved successfully',
    type: [TopProductDto],
  })
  async getTopProducts(
    @Query('period') period: 'daily' | 'weekly' | 'monthly',
    @Query('limit') limit?: number,
  ): Promise<TopProductDto[]> {
    return this.reportsService.getTopProducts(period, limit ? parseInt(limit.toString()) : 10);
  }

  @Get('employee-performance')
  @ApiOperation({
    summary: 'Get employee performance report',
    description: 'Retrieve employee sales performance (Manager only)',
  })
  @ApiQuery({
    name: 'employeeId',
    description: 'Specific employee ID (optional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @ApiQuery({
    name: 'period',
    description: 'Report period',
    enum: ['daily', 'weekly', 'monthly'],
    example: 'daily',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Employee performance report retrieved successfully',
    type: [EmployeePerformanceDto],
  })
  async getEmployeePerformance(
    @Query('employeeId') employeeId?: string,
    @Query('period') period: 'daily' | 'weekly' | 'monthly' = 'daily',
  ): Promise<EmployeePerformanceDto[]> {
    return this.reportsService.getEmployeePerformance(employeeId, period);
  }

  @Get('inventory-status')
  @ApiOperation({
    summary: 'Get inventory status report',
    description: 'Retrieve current inventory status for all products (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory status report retrieved successfully',
    type: [InventoryStatusDto],
  })
  async getInventoryStatus(): Promise<InventoryStatusDto[]> {
    return this.reportsService.getInventoryStatus();
  }

  @Get('low-stock-alert')
  @ApiOperation({
    summary: 'Get low stock alert',
    description: 'Retrieve products that are low on stock or out of stock (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock alert retrieved successfully',
    type: [InventoryStatusDto],
  })
  async getLowStockAlert(): Promise<InventoryStatusDto[]> {
    return this.reportsService.getLowStockAlert();
  }
}
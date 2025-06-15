import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrdersService, PaginatedOrderResponse } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Employee, EmployeeRole } from '../database/entities';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create new order',
    description: 'Process a new order with payment and update inventory',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid order data or insufficient stock',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: Employee,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all orders',
    description: 'Retrieve orders with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: { $ref: '#/components/schemas/OrderResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 8 },
      },
    },
  })
  async findAll(@Query() query: OrderQueryDto): Promise<PaginatedOrderResponse> {
    return this.ordersService.findAll(query);
  }

  @Get('current-shift')
  @ApiOperation({
    summary: 'Get current shift orders',
    description: 'Retrieve orders for current employee today',
  })
  @ApiResponse({
    status: 200,
    description: 'Current shift orders retrieved successfully',
    type: [OrderResponseDto],
  })
  async getCurrentShiftOrders(@CurrentUser() user: Employee): Promise<OrderResponseDto[]> {
    return this.ordersService.getCurrentShiftOrders(user.id);
  }

  @Get('todays-orders')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Get today\'s orders',
    description: 'Retrieve all orders for today (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Today\'s orders retrieved successfully',
    type: [OrderResponseDto],
  })
  async getTodaysOrders(): Promise<OrderResponseDto[]> {
    return this.ordersService.getTodaysOrders();
  }

  @Get('next-number')
  @ApiOperation({
    summary: 'Get next order number',
    description: 'Generate next available order number for new orders',
  })
  @ApiResponse({
    status: 200,
    description: 'Next order number generated successfully',
    schema: {
      type: 'object',
      properties: {
        orderNumber: {
          type: 'string',
          example: 'ORD-1642248600000-001',
        },
      },
    },
  })
  async getNextOrderNumber(): Promise<{ orderNumber: string }> {
    return this.ordersService.getNextOrderNumber();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Retrieve a specific order by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/void')
  @ApiOperation({
    summary: 'Void order',
    description: 'Void an order and restore inventory (Manager override for other employees)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order voided successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Can only void completed orders',
  })
  @ApiResponse({
    status: 403,
    description: 'Can only void your own orders unless you are a manager',
  })
  async voidOrder(
    @Param('id') id: string,
    @CurrentUser() user: Employee,
  ): Promise<OrderResponseDto> {
    const isManager = user.role === EmployeeRole.MANAGER;
    return this.ordersService.voidOrder(id, user.id, isManager);
  }

  @Patch(':id/refund')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Refund order',
    description: 'Process order refund and restore inventory (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Order UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Order refunded successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Can only refund completed orders',
  })
  async refundOrder(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.refundOrder(id);
  }
}
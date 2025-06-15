import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
  ApiQuery,
} from '@nestjs/swagger';
import { ProductsService, PaginatedProductResponse } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmployeeRole } from '../database/entities';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Create new product',
    description: 'Create a new product with inventory information (Manager only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found or inactive',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with this barcode already exists',
  })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description: 'Retrieve products with filtering, pagination, and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'array',
          items: { $ref: '#/components/schemas/ProductResponseDto' },
        },
        total: { type: 'number', example: 150 },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 20 },
        totalPages: { type: 'number', example: 8 },
      },
    },
  })
  async findAll(@Query() query: ProductQueryDto): Promise<PaginatedProductResponse> {
    return this.productsService.findAll(query);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products',
    description: 'Search products by name or barcode',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'coca',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [ProductResponseDto],
  })
  async searchProducts(@Query('q') searchTerm: string): Promise<ProductResponseDto[]> {
    return this.productsService.searchProducts(searchTerm);
  }

  @Get('low-stock')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Get low stock products',
    description: 'Retrieve products that are below minimum stock level (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Low stock products retrieved successfully',
    type: [ProductResponseDto],
  })
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get('barcode/:barcode')
  @ApiOperation({
    summary: 'Get product by barcode',
    description: 'Retrieve product information by barcode for POS scanning',
  })
  @ApiParam({
    name: 'barcode',
    description: 'Product barcode',
    example: '1234567890123',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findByBarcode(@Param('barcode') barcode: string): Promise<ProductResponseDto> {
    return this.productsService.findByBarcode(barcode);
  }

  @Get('category/:categoryId')
  @ApiOperation({
    summary: 'Get products by category',
    description: 'Retrieve all active products in a specific category',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [ProductResponseDto],
  })
  async getProductsByCategory(@Param('categoryId') categoryId: string): Promise<ProductResponseDto[]> {
    return this.productsService.getProductsByCategory(categoryId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get product by ID',
    description: 'Retrieve a specific product by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Update product',
    description: 'Update product information (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Product with this barcode already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete product',
    description: 'Deactivate product (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Product deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(id);
  }

  @Patch(':id/stock')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Adjust product stock',
    description: 'Manually adjust product stock quantity (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Product UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Stock quantity cannot be negative',
  })
  async adjustStock(
    @Param('id') id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.adjustStock(id, adjustStockDto);
  }
}
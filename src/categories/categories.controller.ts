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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmployeeRole } from '../database/entities';

@ApiTags('Categories')
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Create new category',
    description: 'Create a new product category (Manager only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions - Manager role required',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all categories',
    description: 'Retrieve all categories with optional filtering',
  })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive categories (Manager only)',
  })
  @ApiQuery({
    name: 'withProducts',
    required: false,
    type: Boolean,
    description: 'Include product count for each category',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(
    @Query('includeInactive') includeInactive?: boolean,
    @Query('withProducts') withProducts?: boolean,
  ): Promise<CategoryResponseDto[]> {
    if (withProducts) {
      return this.categoriesService.getCategoriesWithProducts();
    }

    return this.categoriesService.findAll(includeInactive);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get category by ID',
    description: 'Retrieve a specific category by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Update category',
    description: 'Update category information (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Category name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @Roles(EmployeeRole.MANAGER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete category',
    description: 'Deactivate category (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Category deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete category with active products',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.categoriesService.remove(id);
  }

  @Patch(':id/toggle-status')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Toggle category status',
    description: 'Activate or deactivate category (Manager only)',
  })
  @ApiParam({
    name: 'id',
    description: 'Category UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Category status toggled successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot deactivate category with active products',
  })
  async toggleStatus(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.toggleStatus(id);
  }

  @Patch('reorder')
  @Roles(EmployeeRole.MANAGER)
  @ApiOperation({
    summary: 'Reorder categories',
    description: 'Update display order of multiple categories (Manager only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Categories reordered successfully',
    type: [CategoryResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'One or more categories not found',
  })
  async reorderCategories(
    @Body() reorderCategoriesDto: ReorderCategoriesDto,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.reorderCategories(reorderCategoriesDto);
  }
}
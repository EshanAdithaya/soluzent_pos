import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../database/entities';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';
import { CategoryResponseDto } from './dto/category-response.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const { name, displayOrder, ...categoryData } = createCategoryDto;

    const existingCategory = await this.categoryRepository.findOne({
      where: { name },
    });

    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    let finalDisplayOrder = displayOrder;
    if (!finalDisplayOrder) {
      const maxOrder = await this.categoryRepository
        .createQueryBuilder('category')
        .select('MAX(category.displayOrder)', 'max')
        .getRawOne();
      finalDisplayOrder = (maxOrder?.max || 0) + 1;
    }

    const category = this.categoryRepository.create({
      name,
      displayOrder: finalDisplayOrder,
      ...categoryData,
    });

    const savedCategory = await this.categoryRepository.save(category);
    return CategoryResponseDto.fromCategory(savedCategory);
  }

  async findAll(includeInactive = false): Promise<CategoryResponseDto[]> {
    const startTime = Date.now();
    console.log(`📂 Loading categories with products (includeInactive: ${includeInactive})`);
    
    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'products', 'products.isActive = :productActive')
      .orderBy('category.displayOrder', 'ASC')
      .addOrderBy('category.name', 'ASC')
      .setParameter('productActive', true);

    if (!includeInactive) {
      queryBuilder.where('category.isActive = :isActive', { isActive: true });
    }

    const categories = await queryBuilder.getMany();
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Loaded ${categories.length} categories with optimized product loading in ${processingTime}ms`);
    return categories.map(CategoryResponseDto.fromCategory);
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return CategoryResponseDto.fromCategory(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingCategory = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingCategory) {
        throw new ConflictException('Category name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    const updatedCategory = await this.categoryRepository.save(category);

    return CategoryResponseDto.fromCategory(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const activeProducts = category.products?.filter(product => product.isActive) || [];
    
    if (activeProducts.length > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${activeProducts.length} active products. Please reassign or deactivate products first.`
      );
    }

    category.isActive = false;
    await this.categoryRepository.save(category);
  }

  async reorderCategories(reorderDto: ReorderCategoriesDto): Promise<CategoryResponseDto[]> {
    const { categories } = reorderDto;

    const categoryIds = categories.map(cat => cat.id);
    const existingCategories = await this.categoryRepository.findByIds(categoryIds);

    if (existingCategories.length !== categoryIds.length) {
      throw new BadRequestException('One or more categories not found');
    }

    await this.categoryRepository.manager.transaction(async transactionalEntityManager => {
      for (const categoryOrder of categories) {
        await transactionalEntityManager.update(
          Category,
          { id: categoryOrder.id },
          { displayOrder: categoryOrder.displayOrder }
        );
      }
    });

    return this.findAll();
  }

  async getActiveCategories(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });

    return categories.map(CategoryResponseDto.fromCategory);
  }

  async getCategoriesWithProducts(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryRepository.find({
      where: { isActive: true },
      relations: ['products'],
      order: { displayOrder: 'ASC' },
    });

    return categories.map(CategoryResponseDto.fromCategory);
  }

  async toggleStatus(id: string): Promise<CategoryResponseDto> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.isActive) {
      const activeProducts = category.products?.filter(product => product.isActive) || [];
      
      if (activeProducts.length > 0) {
        throw new BadRequestException(
          `Cannot deactivate category with ${activeProducts.length} active products`
        );
      }
    }

    category.isActive = !category.isActive;
    const updatedCategory = await this.categoryRepository.save(category);

    return CategoryResponseDto.fromCategory(updatedCategory);
  }
}
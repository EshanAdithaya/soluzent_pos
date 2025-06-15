import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Product, Category } from '../database/entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AdjustStockDto, StockAdjustmentType } from './dto/adjust-stock.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { ProductQueryDto } from './dto/product-query.dto';

export interface PaginatedProductResponse {
  products: ProductResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const { categoryId, barcode, ...productData } = createProductDto;

    const category = await this.categoryRepository.findOne({
      where: { id: categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found or inactive');
    }

    if (barcode) {
      const existingProduct = await this.productRepository.findOne({
        where: { barcode },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    const product = this.productRepository.create({
      categoryId,
      barcode,
      ...productData,
    });

    const savedProduct = await this.productRepository.save(product);
    return this.findOne(savedProduct.id);
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedProductResponse> {
    const {
      search,
      categoryId,
      includeInactive = false,
      lowStockOnly = false,
      page = 1,
      limit = 20,
      sortBy = 'name',
      sortOrder = 'ASC',
    } = query;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (!includeInactive) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR product.barcode LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (lowStockOnly) {
      queryBuilder.andWhere('product.stockQuantity <= product.minStockLevel');
    }

    const validSortFields = ['name', 'price', 'stockQuantity', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      products: products.map(ProductResponseDto.fromProduct),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductResponseDto.fromProduct(product);
  }

  async findByBarcode(barcode: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { barcode, isActive: true },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return ProductResponseDto.fromProduct(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId, isActive: true },
      });

      if (!category) {
        throw new NotFoundException('Category not found or inactive');
      }
    }

    if (updateProductDto.barcode && updateProductDto.barcode !== product.barcode) {
      const existingProduct = await this.productRepository.findOne({
        where: { barcode: updateProductDto.barcode },
      });

      if (existingProduct) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    Object.assign(product, updateProductDto);
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.isActive = false;
    await this.productRepository.save(product);
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { type, quantity } = adjustStockDto;
    let newStock = product.stockQuantity;

    switch (type) {
      case StockAdjustmentType.ADD:
        newStock += quantity;
        break;
      case StockAdjustmentType.SUBTRACT:
        newStock -= quantity;
        break;
      case StockAdjustmentType.SET:
        newStock = quantity;
        break;
    }

    if (newStock < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    product.stockQuantity = newStock;
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.stockQuantity <= product.minStockLevel')
      .orderBy('product.stockQuantity', 'ASC')
      .getMany();

    return products.map(ProductResponseDto.fromProduct);
  }

  async searchProducts(searchTerm: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR product.barcode LIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .orderBy('product.name', 'ASC')
      .limit(20)
      .getMany();

    return products.map(ProductResponseDto.fromProduct);
  }

  async getProductsByCategory(categoryId: string): Promise<ProductResponseDto[]> {
    const products = await this.productRepository.find({
      where: { categoryId, isActive: true },
      relations: ['category'],
      order: { name: 'ASC' },
    });

    return products.map(ProductResponseDto.fromProduct);
  }

  async updateStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    product.stockQuantity -= quantity;
    await this.productRepository.save(product);
  }

  async restoreStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.stockQuantity += quantity;
    await this.productRepository.save(product);
  }
}
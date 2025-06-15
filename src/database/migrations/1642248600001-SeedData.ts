import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class SeedData1642248600001 implements MigrationInterface {
  name = 'SeedData1642248600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hashedPassword = await bcrypt.hash('admin123', 12);

    await queryRunner.query(`
      INSERT INTO "employees" ("id", "username", "email", "password", "first_name", "last_name", "role")
      VALUES (
        uuid_generate_v4(),
        'admin',
        'admin@possystem.com',
        '${hashedPassword}',
        'System',
        'Administrator',
        'manager'
      )
    `);

    const cashierPassword = await bcrypt.hash('cashier123', 12);
    
    await queryRunner.query(`
      INSERT INTO "employees" ("id", "username", "email", "password", "first_name", "last_name", "role")
      VALUES (
        uuid_generate_v4(),
        'cashier',
        'cashier@possystem.com',
        '${cashierPassword}',
        'Demo',
        'Cashier',
        'cashier'
      )
    `);

    await queryRunner.query(`
      INSERT INTO "categories" ("id", "name", "display_order", "color") VALUES
      (uuid_generate_v4(), 'Beverages', 1, '#3B82F6'),
      (uuid_generate_v4(), 'Food', 2, '#10B981'),
      (uuid_generate_v4(), 'Snacks', 3, '#F59E0B'),
      (uuid_generate_v4(), 'Desserts', 4, '#EF4444'),
      (uuid_generate_v4(), 'Other', 5, '#6B7280')
    `);

    const beverageCategoryId = await queryRunner.query(`
      SELECT id FROM "categories" WHERE name = 'Beverages' LIMIT 1
    `);

    const foodCategoryId = await queryRunner.query(`
      SELECT id FROM "categories" WHERE name = 'Food' LIMIT 1
    `);

    const snacksCategoryId = await queryRunner.query(`
      SELECT id FROM "categories" WHERE name = 'Snacks' LIMIT 1
    `);

    await queryRunner.query(`
      INSERT INTO "products" ("id", "name", "description", "price", "cost_price", "barcode", "stock_quantity", "min_stock_level", "category_id") VALUES
      (uuid_generate_v4(), 'Coca Cola 330ml', 'Classic Coca Cola in 330ml can', 2.50, 1.20, '0123456789012', 100, 10, '${beverageCategoryId[0].id}'),
      (uuid_generate_v4(), 'Pepsi 330ml', 'Pepsi Cola in 330ml can', 2.50, 1.20, '0123456789013', 100, 10, '${beverageCategoryId[0].id}'),
      (uuid_generate_v4(), 'Water Bottle 500ml', 'Pure drinking water', 1.50, 0.75, '0123456789014', 200, 20, '${beverageCategoryId[0].id}'),
      (uuid_generate_v4(), 'Coffee', 'Fresh brewed coffee', 3.00, 0.80, '0123456789015', 50, 5, '${beverageCategoryId[0].id}'),
      (uuid_generate_v4(), 'Sandwich - Ham & Cheese', 'Fresh ham and cheese sandwich', 6.50, 3.25, '0123456789016', 25, 5, '${foodCategoryId[0].id}'),
      (uuid_generate_v4(), 'Burger - Beef', 'Classic beef burger with fries', 12.99, 6.50, '0123456789017', 20, 3, '${foodCategoryId[0].id}'),
      (uuid_generate_v4(), 'Potato Chips', 'Crispy potato chips', 2.99, 1.50, '0123456789018', 75, 10, '${snacksCategoryId[0].id}'),
      (uuid_generate_v4(), 'Chocolate Bar', 'Milk chocolate bar', 1.99, 1.00, '0123456789019', 60, 8, '${snacksCategoryId[0].id}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "products"`);
    await queryRunner.query(`DELETE FROM "categories"`);
    await queryRunner.query(`DELETE FROM "employees"`);
  }
}
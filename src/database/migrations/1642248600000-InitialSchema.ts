import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1642248600000 implements MigrationInterface {
  name = 'InitialSchema1642248600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "employees_role_enum" AS ENUM('cashier', 'manager')
    `);
    
    await queryRunner.query(`
      CREATE TABLE "employees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "role" "employees_role_enum" NOT NULL DEFAULT 'cashier',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_employees_username" UNIQUE ("username"),
        CONSTRAINT "UQ_employees_email" UNIQUE ("email"),
        CONSTRAINT "PK_employees" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "display_order" integer NOT NULL DEFAULT 0,
        "color" character varying NOT NULL DEFAULT '#6B7280',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "cost_price" numeric(10,2) NOT NULL,
        "barcode" character varying,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "min_stock_level" integer NOT NULL DEFAULT 5,
        "image_url" character varying,
        "category_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode"),
        CONSTRAINT "PK_products" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "orders_payment_method_enum" AS ENUM('cash', 'card', 'split')
    `);

    await queryRunner.query(`
      CREATE TYPE "orders_payment_status_enum" AS ENUM('completed', 'refunded', 'voided')
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_number" character varying NOT NULL,
        "employee_id" uuid NOT NULL,
        "subtotal" numeric(10,2) NOT NULL,
        "tax_amount" numeric(10,2) NOT NULL,
        "tax_rate" numeric(5,2) NOT NULL,
        "discount_amount" numeric(10,2) NOT NULL DEFAULT 0,
        "total_amount" numeric(10,2) NOT NULL,
        "payment_method" "orders_payment_method_enum" NOT NULL,
        "payment_status" "orders_payment_status_enum" NOT NULL DEFAULT 'completed',
        "customer_email" character varying,
        "notes" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_orders_order_number" UNIQUE ("order_number"),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(10,2) NOT NULL,
        "total_price" numeric(10,2) NOT NULL,
        "notes" text,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_details_payment_method_enum" AS ENUM('cash', 'card')
    `);

    await queryRunner.query(`
      CREATE TABLE "payment_details" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "payment_method" "payment_details_payment_method_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "card_last4" character varying,
        "card_type" character varying,
        "cash_received" numeric(10,2),
        "change_given" numeric(10,2),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_details" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "products" ADD CONSTRAINT "FK_products_category" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" ADD CONSTRAINT "FK_orders_employee" 
      FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_order" 
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" ADD CONSTRAINT "FK_order_items_product" 
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_details" ADD CONSTRAINT "FK_payment_details_order" 
      FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_category" ON "products" ("category_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_barcode" ON "products" ("barcode")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_employee" ON "orders" ("employee_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_created_at" ON "orders" ("created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_order" ON "order_items" ("order_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_product" ON "order_items" ("product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_order_items_product"`);
    await queryRunner.query(`DROP INDEX "IDX_order_items_order"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_employee"`);
    await queryRunner.query(`DROP INDEX "IDX_products_barcode"`);
    await queryRunner.query(`DROP INDEX "IDX_products_category"`);
    
    await queryRunner.query(`ALTER TABLE "payment_details" DROP CONSTRAINT "FK_payment_details_order"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_product"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_order_items_order"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_employee"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_products_category"`);
    
    await queryRunner.query(`DROP TABLE "payment_details"`);
    await queryRunner.query(`DROP TYPE "payment_details_payment_method_enum"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TYPE "orders_payment_status_enum"`);
    await queryRunner.query(`DROP TYPE "orders_payment_method_enum"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "employees"`);
    await queryRunner.query(`DROP TYPE "employees_role_enum"`);
  }
}
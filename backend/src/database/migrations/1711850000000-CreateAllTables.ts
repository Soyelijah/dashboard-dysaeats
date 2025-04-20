import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAllTables1711850000000 implements MigrationInterface {
  name = 'CreateAllTables1711850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si las tablas ya existen antes de crearlas
    const checkTable = async (tableName: string): Promise<boolean> => {
      const result = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tableName}'
        );
      `);
      return result[0].exists;
    };

    // Crear extensión UUID si no existe
    await queryRunner.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // Crear tipos ENUM
    try {
      // UserRole
      await queryRunner.query(`
        CREATE TYPE "public"."user_role_enum" AS ENUM (
          'super_admin', 
          'admin', 
          'restaurant_admin', 
          'driver',
          'customer'
        )
      `);
    } catch (error) {
      console.log('user_role_enum already exists or error creating it', error);
    }

    try {
      // OrderStatus
      await queryRunner.query(`
        CREATE TYPE "public"."order_status_enum" AS ENUM (
          'pending', 
          'accepted', 
          'preparing', 
          'ready', 
          'picked_up',
          'delivered',
          'cancelled'
        )
      `);
    } catch (error) {
      console.log('order_status_enum already exists or error creating it', error);
    }

    try {
      // DeliveryStatus
      await queryRunner.query(`
        CREATE TYPE "public"."delivery_status_enum" AS ENUM (
          'not_assigned', 
          'assigned', 
          'picked_up', 
          'in_transit',
          'delivered',
          'failed'
        )
      `);
    } catch (error) {
      console.log('delivery_status_enum already exists or error creating it', error);
    }

    try {
      // PaymentStatus
      await queryRunner.query(`
        CREATE TYPE "public"."payment_status_enum" AS ENUM (
          'pending', 
          'processing', 
          'completed', 
          'failed',
          'refunded'
        )
      `);
    } catch (error) {
      console.log('payment_status_enum already exists or error creating it', error);
    }

    try {
      // PaymentMethod
      await queryRunner.query(`
        CREATE TYPE "public"."payment_method_enum" AS ENUM (
          'credit_card', 
          'debit_card', 
          'cash', 
          'paypal',
          'mercado_pago',
          'transfer'
        )
      `);
    } catch (error) {
      console.log('payment_method_enum already exists or error creating it', error);
    }

    try {
      // NotificationType
      await queryRunner.query(`
        CREATE TYPE "public"."notification_type_enum" AS ENUM (
          'order_created', 
          'order_status_changed', 
          'order_assigned', 
          'delivery_status_changed', 
          'payment_received', 
          'system_alert', 
          'promotion'
        )
      `);
    } catch (error) {
      console.log('notification_type_enum already exists or error creating it', error);
    }

    // Tabla de usuarios
    if (!(await checkTable('users'))) {
      await queryRunner.query(`
        CREATE TABLE "users" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "firstName" character varying(100) NOT NULL,
          "lastName" character varying(100) NOT NULL,
          "email" character varying NOT NULL,
          "rut" character varying,
          "password" character varying NOT NULL,
          "role" "public"."user_role_enum" NOT NULL DEFAULT 'restaurant_admin',
          "isEmailVerified" boolean NOT NULL DEFAULT false,
          "refreshToken" character varying,
          "isActive" boolean NOT NULL DEFAULT true,
          "phoneNumber" character varying,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
          CONSTRAINT "UQ_54f55ae808f5b1d87aaa59a5263" UNIQUE ("rut"),
          CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )
      `);
    }

    // Tabla de restaurantes
    if (!(await checkTable('restaurants'))) {
      await queryRunner.query(`
        CREATE TABLE "restaurants" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "address" character varying NOT NULL,
          "coordinates" jsonb,
          "logo" character varying,
          "coverImage" character varying,
          "openingTime" TIME,
          "closingTime" TIME,
          "isOpen" boolean NOT NULL DEFAULT true,
          "isActive" boolean NOT NULL DEFAULT true,
          "deliveryFee" numeric(10,2) DEFAULT 0,
          "minOrderAmount" numeric(10,2) DEFAULT 0,
          "adminId" uuid,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "REL_e0def33cf5cd571be40a4e7ab6" UNIQUE ("adminId"),
          CONSTRAINT "PK_e2133a72eb1cc8f588f7b503e68" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "restaurants" ADD CONSTRAINT "FK_e0def33cf5cd571be40a4e7ab62" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    }

    // Tabla de categorías de menú
    if (!(await checkTable('menu_categories'))) {
      await queryRunner.query(`
        CREATE TABLE "menu_categories" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "image" character varying,
          "position" integer NOT NULL DEFAULT 0,
          "isActive" boolean NOT NULL DEFAULT true,
          "restaurantId" uuid,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_8e33693df4a22a2c78ba5ad49cf" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "menu_categories" ADD CONSTRAINT "FK_e51522b3ff2f3e61234d63bed57" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // Tabla de elementos de menú
    if (!(await checkTable('menu_items'))) {
      await queryRunner.query(`
        CREATE TABLE "menu_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          "description" text,
          "price" numeric(10,2) NOT NULL,
          "image" character varying,
          "isAvailable" boolean NOT NULL DEFAULT true,
          "position" integer NOT NULL DEFAULT 0,
          "options" jsonb,
          "categoryId" uuid,
          "restaurantId" uuid,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_81ac518d6c693127f37ec32b9f0" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "menu_items" ADD CONSTRAINT "FK_3c9e683aec6a9506cd48d72cd2e" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "menu_items" ADD CONSTRAINT "FK_e20a5278baea344fe95ec70bab3" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // Tabla de órdenes
    if (!(await checkTable('orders'))) {
      await queryRunner.query(`
        CREATE TABLE "orders" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "orderNumber" character varying NOT NULL,
          "restaurantId" uuid,
          "customerId" uuid,
          "deliveryPersonId" uuid,
          "status" "public"."order_status_enum" NOT NULL DEFAULT 'pending',
          "deliveryStatus" "public"."delivery_status_enum" NOT NULL DEFAULT 'not_assigned',
          "paymentStatus" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
          "paymentMethod" "public"."payment_method_enum" NOT NULL DEFAULT 'credit_card',
          "subtotal" numeric(10,2) NOT NULL,
          "tax" numeric(10,2) NOT NULL DEFAULT 0,
          "deliveryFee" numeric(10,2) NOT NULL DEFAULT 0,
          "tip" numeric(10,2) NOT NULL DEFAULT 0,
          "total" numeric(10,2) NOT NULL,
          "customerNotes" text,
          "restaurantNotes" text,
          "cancellationReason" text,
          "delivery_address" character varying,
          "delivery_coordinates" jsonb,
          "estimatedDeliveryTime" TIMESTAMP,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "acceptedAt" TIMESTAMP,
          "preparedAt" TIMESTAMP,
          "readyAt" TIMESTAMP,
          "pickedUpAt" TIMESTAMP,
          "deliveredAt" TIMESTAMP,
          "cancelledAt" TIMESTAMP,
          CONSTRAINT "UQ_a0f1da187bb763ad93f68414dc3" UNIQUE ("orderNumber"),
          CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "orders" ADD CONSTRAINT "FK_2b7e7a8ce9c74aa6c4745e88c8a" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "orders" ADD CONSTRAINT "FK_19b0c6293443d1b464f604c3316" FOREIGN KEY ("deliveryPersonId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `);
    }

    // Tabla de elementos de orden
    if (!(await checkTable('order_items'))) {
      await queryRunner.query(`
        CREATE TABLE "order_items" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "menuItemId" uuid,
          "orderId" uuid NOT NULL,
          "name" character varying NOT NULL,
          "price" numeric(10,2) NOT NULL,
          "quantity" integer NOT NULL DEFAULT 1,
          "subtotal" numeric(10,2) NOT NULL,
          "options" jsonb,
          "notes" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_cffcd0d8d4bc4651815c1b5cc8a" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "order_items" ADD CONSTRAINT "FK_7edd06e1afea498fcfe5a892c83" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      `);

      await queryRunner.query(`
        ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // Tabla de pagos
    if (!(await checkTable('payments'))) {
      await queryRunner.query(`
        CREATE TABLE "payments" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "externalId" character varying,
          "orderId" uuid,
          "amount" numeric(10,2) NOT NULL,
          "paymentMethod" "public"."payment_method_enum" NOT NULL DEFAULT 'credit_card',
          "status" "public"."payment_status_enum" NOT NULL DEFAULT 'pending',
          "metadata" jsonb,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          "completedAt" TIMESTAMP,
          "cancelledAt" TIMESTAMP,
          CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "payments" ADD CONSTRAINT "FK_fbaf0d1e26f5ecefe1bd43b34f4" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // Tabla de notificaciones
    if (!(await checkTable('notifications'))) {
      await queryRunner.query(`
        CREATE TABLE "notifications" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "userId" uuid NOT NULL,
          "type" "public"."notification_type_enum" NOT NULL DEFAULT 'system_alert',
          "title" character varying NOT NULL,
          "content" text NOT NULL,
          "data" jsonb,
          "read" boolean NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    // Tabla de preferencias de notificaciones
    if (!(await checkTable('notification_preferences'))) {
      await queryRunner.query(`
        CREATE TABLE "notification_preferences" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "userId" uuid NOT NULL,
          "orderCreated" boolean NOT NULL DEFAULT true,
          "orderStatusChanged" boolean NOT NULL DEFAULT true,
          "orderAssigned" boolean NOT NULL DEFAULT true,
          "deliveryStatusChanged" boolean NOT NULL DEFAULT true,
          "paymentReceived" boolean NOT NULL DEFAULT true,
          "systemAlert" boolean NOT NULL DEFAULT true,
          "promotion" boolean NOT NULL DEFAULT true,
          "enablePushNotifications" boolean NOT NULL DEFAULT true,
          "enableEmailNotifications" boolean NOT NULL DEFAULT true,
          "enableInAppNotifications" boolean NOT NULL DEFAULT true,
          "pushSubscription" text,
          "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
          CONSTRAINT "UQ_0d14ea417264e23d89dcebd2086" UNIQUE ("userId"),
          CONSTRAINT "PK_3ca49bcb9e18ff4fcd8ebf25ede" PRIMARY KEY ("id")
        )
      `);

      await queryRunner.query(`
        ALTER TABLE "notification_preferences" ADD CONSTRAINT "FK_0d14ea417264e23d89dcebd2086" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      `);
    }

    console.log('Todas las tablas creadas o ya existentes');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar restricciones de clave foránea primero
    await queryRunner.query(`ALTER TABLE IF EXISTS "notification_preferences" DROP CONSTRAINT IF EXISTS "FK_0d14ea417264e23d89dcebd2086"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "notifications" DROP CONSTRAINT IF EXISTS "FK_692a909ee0fa9383e7859f9b406"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "payments" DROP CONSTRAINT IF EXISTS "FK_fbaf0d1e26f5ecefe1bd43b34f4"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "order_items" DROP CONSTRAINT IF EXISTS "FK_145532db85752b29c57d2b7b1f1"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "order_items" DROP CONSTRAINT IF EXISTS "FK_7edd06e1afea498fcfe5a892c83"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "orders" DROP CONSTRAINT IF EXISTS "FK_19b0c6293443d1b464f604c3316"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "orders" DROP CONSTRAINT IF EXISTS "FK_e5de51ca888d8b1f5ac25799dd1"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "orders" DROP CONSTRAINT IF EXISTS "FK_2b7e7a8ce9c74aa6c4745e88c8a"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "menu_items" DROP CONSTRAINT IF EXISTS "FK_e20a5278baea344fe95ec70bab3"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "menu_items" DROP CONSTRAINT IF EXISTS "FK_3c9e683aec6a9506cd48d72cd2e"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "menu_categories" DROP CONSTRAINT IF EXISTS "FK_e51522b3ff2f3e61234d63bed57"`);
    await queryRunner.query(`ALTER TABLE IF EXISTS "restaurants" DROP CONSTRAINT IF EXISTS "FK_e0def33cf5cd571be40a4e7ab62"`);

    // Eliminar tablas
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "menu_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "restaurants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Eliminar tipos ENUM
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."notification_type_enum"`); } catch (e) {}
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."payment_method_enum"`); } catch (e) {}
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."payment_status_enum"`); } catch (e) {}
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."delivery_status_enum"`); } catch (e) {}
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."order_status_enum"`); } catch (e) {}
    try { await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`); } catch (e) {}
  }
}
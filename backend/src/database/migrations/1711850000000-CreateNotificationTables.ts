import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTables1711850000000 implements MigrationInterface {
  name = 'CreateNotificationTables1711850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear el tipo de enum para notification_type
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

    // Crear la tabla de notificaciones
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" "public"."notification_type_enum" NOT NULL DEFAULT 'system_alert',
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "data" json,
        "read" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id")
      )
    `);

    // Crear la tabla de preferencias de notificaciones
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
        CONSTRAINT "PK_notification_preferences_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_preferences_userId" UNIQUE ("userId")
      )
    `);

    // Nota: Las claves foráneas se han eliminado porque la tabla users aún no existe
    // Cuando la tabla users se cree, se deberán agregar las claves foráneas en una migración posterior
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar las tablas
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "notification_preferences"`);
    
    // Eliminar el tipo enum
    await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
  }
}
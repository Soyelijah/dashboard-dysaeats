import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationTables1711850000000 implements MigrationInterface {
  name = 'CreateNotificationTables1711850000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Verificar si las tablas ya existen antes de crearlas
    const tablesExist = await this.checkTablesExist(queryRunner);
    if (tablesExist) {
      console.log('Las tablas de notificaciones ya existen. Omitiendo creación...');
      return;
    }

    try {
      // Crear el tipo de enum para notification_type si no existe
      const enumExists = await this.checkEnumExists(queryRunner);
      if (!enumExists) {
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
      }

      // Crear la tabla de notificaciones
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS "notifications" (
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
        CREATE TABLE IF NOT EXISTS "notification_preferences" (
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
    } catch (error) {
      console.error('Error al crear tablas de notificaciones:', error);
      // No propagamos el error para permitir que la aplicación siga funcionando
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      // Eliminar las tablas
      await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
      await queryRunner.query(`DROP TABLE IF EXISTS "notification_preferences"`);
      
      // Eliminar el tipo enum
      await queryRunner.query(`DROP TYPE IF EXISTS "public"."notification_type_enum"`);
    } catch (error) {
      console.error('Error al eliminar tablas de notificaciones:', error);
    }
  }

  private async checkTablesExist(queryRunner: QueryRunner): Promise<boolean> {
    try {
      const result = await queryRunner.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'notifications'
        );
      `);
      return result[0].exists;
    } catch (error) {
      console.error('Error al verificar existencia de tablas:', error);
      return false;
    }
  }

  private async checkEnumExists(queryRunner: QueryRunner): Promise<boolean> {
    try {
      const result = await queryRunner.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_type t 
          JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace 
          WHERE t.typname = 'notification_type_enum' 
          AND n.nspname = 'public'
        );
      `);
      return result[0].exists;
    } catch (error) {
      console.error('Error al verificar existencia de enum:', error);
      return false;
    }
  }
}
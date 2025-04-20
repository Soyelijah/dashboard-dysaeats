import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno
dotenv.config();

// Configuración de la base de datos
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'devlmer-dysaeats',
  password: process.env.DB_PASSWORD || '5369DysaEats..',
  database: process.env.DB_DATABASE || 'dysaeats',
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false, // Desactivado para evitar problemas con tablas existentes
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// Crear la instancia de DataSource para migraciones y CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
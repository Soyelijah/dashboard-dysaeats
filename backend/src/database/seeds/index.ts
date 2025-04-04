import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import dataSource from '../data-source';

/**
 * Función principal para ejecutar todos los seeds
 */
async function main() {
  const logger = new Logger('Seeds');
  let connection: DataSource | null = null;

  try {
    // Inicializar conexión a la base de datos
    logger.log('Iniciando conexión a la base de datos...');
    connection = await dataSource.initialize();
    logger.log('Conexión establecida correctamente.');

    // Ejecutar seeders
    logger.log('Iniciando proceso de seeds...');

    // Seeders de roles
    // await seedRoles(connection);
    
    // Seeders de usuarios de prueba
    // await seedUsers(connection);
    
    // Seeders de restaurantes de prueba
    // await seedRestaurants(connection);
    
    // Seeders de productos de prueba
    // await seedProducts(connection);

    logger.log('Proceso de seeds completado con éxito.');
  } catch (error) {
    logger.error(`Error durante el proceso de seeds: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    // Cerrar conexión
    if (connection) {
      logger.log('Cerrando conexión...');
      await connection.destroy();
      logger.log('Conexión cerrada correctamente.');
    }
  }
}

// Ejecutar función principal
main().catch(err => {
  console.error('Error no controlado:', err);
  process.exit(1);
});
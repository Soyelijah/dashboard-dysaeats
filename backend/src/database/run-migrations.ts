import dataSource from './data-source';

/**
 * Script para ejecutar migraciones de base de datos
 */
const runMigrations = async (): Promise<void> => {
  try {
    // Inicializar conexión de base de datos
    await dataSource.initialize();
    console.log('Conexión a base de datos inicializada correctamente');

    // Ejecutar migraciones pendientes
    const migrations = await dataSource.runMigrations({ transaction: 'all' });

    if (migrations.length > 0) {
      console.log(`Se han ejecutado ${migrations.length} migraciones:`);
      migrations.forEach((migration) => {
        console.log(` - ${migration.name}`);
      });
    } else {
      console.log('No hay migraciones pendientes para ejecutar');
    }

    // Cerrar conexión
    await dataSource.destroy();
    console.log('Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar migraciones:', error);
    process.exit(1);
  }
};

// Ejecutar script
runMigrations();
// Este archivo es un punto de entrada para ejecutar todos los seeds
import dataSource from '../data-source';

const runSeeds = async () => {
  try {
    // Inicializar conexión
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    
    console.log('Ejecutando seeds...');
    
    // Importar y ejecutar los scripts de seed
    await import('./init-seeds');
    
    // Otros seeds que se agreguen en el futuro
    // await import('./other-seed-file');
    
    console.log('Seeds ejecutados correctamente');
  } catch (error) {
    console.error('Error al ejecutar seeds:', error);
    process.exit(1);
  }
};

// Solo ejecutar si es llamado directamente
if (require.main === module) {
  runSeeds();
}

export default runSeeds;
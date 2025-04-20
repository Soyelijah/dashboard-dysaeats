import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { User } from '../../modules/auth/entities/user.entity';
import { UserRole } from '../../modules/auth/enums/user-role.enum';
import { Restaurant } from '../../modules/restaurants/entities/restaurant.entity';
import { MenuCategory } from '../../modules/restaurants/entities/menu-category.entity';
import { MenuItem } from '../../modules/restaurants/entities/menu-item.entity';

/**
 * Script para poblar la base de datos con datos iniciales
 */
const initSeeds = async () => {
  try {
    // Inicializar conexión
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
    }
    console.log('Conexión a base de datos inicializada correctamente');

    // Crear usuarios de prueba
    const adminUser = await createAdminUser();
    const restaurantAdmin = await createRestaurantAdmin();
    const driver = await createDriver();
    const customer = await createCustomer();

    // Crear restaurante de prueba
    const restaurant = await createRestaurant(restaurantAdmin);

    // Crear categorías de menú
    const categories = await createMenuCategories(restaurant);

    // Crear ítems de menú
    await createMenuItems(categories);

    console.log('Datos iniciales creados correctamente');
    console.log('Credenciales de prueba:');
    console.log('- Admin: admin@dysaeats.com / Test@123');
    console.log('- Restaurant: restaurant@dysaeats.com / Test@123');
    console.log('- Driver: driver@dysaeats.com / Test@123');
    console.log('- Customer: customer@dysaeats.com / Test@123');

    // Cerrar conexión
    await dataSource.destroy();
    console.log('Conexión a base de datos cerrada');
    process.exit(0);
  } catch (error) {
    console.error('Error al insertar datos iniciales:', error);
    process.exit(1);
  }
};

// Función para crear un usuario admin
const createAdminUser = async (): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  
  // Verificar si ya existe por email o RUT
  const existingUser = await userRepository.findOne({
    where: [
      { email: 'admin@dysaeats.com' },
      { rut: '11111111-1' }
    ]
  });
  
  if (existingUser) {
    console.log('El usuario admin ya existe');
    return existingUser;
  }
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Test@123', salt);
  
  // Crear usuario
  const admin = userRepository.create({
    firstName: 'Admin',
    lastName: 'DysaEats',
    email: 'admin@dysaeats.com',
    rut: '11111111-1',
    password: hashedPassword,
    role: UserRole.ADMIN,
    isEmailVerified: true,
    isActive: true,
    phoneNumber: '+56912345678',
  });
  
  await userRepository.save(admin);
  console.log('Usuario admin creado correctamente');
  return admin;
};

// Función para crear un usuario restaurante
const createRestaurantAdmin = async (): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  
  // Verificar si ya existe por email o RUT
  const existingUser = await userRepository.findOne({
    where: [
      { email: 'restaurant@dysaeats.com' },
      { rut: '18456789-7' }
    ]
  });
  
  if (existingUser) {
    console.log('El usuario restaurante ya existe');
    return existingUser;
  }
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Test@123', salt);
  
  // Crear usuario
  const restaurantAdmin = userRepository.create({
    firstName: 'Restaurant',
    lastName: 'Owner',
    email: 'restaurant@dysaeats.com',
    rut: '18456789-7',
    password: hashedPassword,
    role: UserRole.RESTAURANT_ADMIN,
    isEmailVerified: true,
    isActive: true,
    phoneNumber: '+56923456789',
  });
  
  await userRepository.save(restaurantAdmin);
  console.log('Usuario restaurante creado correctamente');
  return restaurantAdmin;
};

// Función para crear un usuario repartidor
const createDriver = async (): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  
  // Verificar si ya existe por email o RUT
  const existingUser = await userRepository.findOne({
    where: [
      { email: 'driver@dysaeats.com' },
      { rut: '13642980-9' }
    ]
  });
  
  if (existingUser) {
    console.log('El usuario repartidor ya existe');
    return existingUser;
  }
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Test@123', salt);
  
  // Crear usuario
  const driver = userRepository.create({
    firstName: 'Delivery',
    lastName: 'Driver',
    email: 'driver@dysaeats.com',
    rut: '13642980-9',
    password: hashedPassword,
    role: UserRole.DELIVERY_PERSON,
    isEmailVerified: true,
    isActive: true,
    phoneNumber: '+56934567890',
  });
  
  await userRepository.save(driver);
  console.log('Usuario repartidor creado correctamente');
  return driver;
};

// Función para crear un usuario cliente
const createCustomer = async (): Promise<User> => {
  const userRepository = dataSource.getRepository(User);
  
  // Verificar si ya existe por email o RUT
  const existingUser = await userRepository.findOne({
    where: [
      { email: 'customer@dysaeats.com' },
      { rut: '12345678-5' }
    ]
  });
  
  if (existingUser) {
    console.log('El usuario cliente ya existe');
    return existingUser;
  }
  
  // Encriptar contraseña
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('Test@123', salt);
  
  // Crear usuario
  const customer = userRepository.create({
    firstName: 'Cliente',
    lastName: 'Ejemplo',
    email: 'customer@dysaeats.com',
    rut: '12345678-5',
    password: hashedPassword,
    role: UserRole.CUSTOMER,
    isEmailVerified: true,
    isActive: true,
    phoneNumber: '+56945678901',
  });
  
  await userRepository.save(customer);
  console.log('Usuario cliente creado correctamente');
  return customer;
};

// Función para crear restaurante
const createRestaurant = async (admin: User): Promise<Restaurant> => {
  const restaurantRepository = dataSource.getRepository(Restaurant);
  const userRepository = dataSource.getRepository(User);
  
  // Verificar si ya existe
  const existingRestaurant = await restaurantRepository
    .createQueryBuilder('restaurant')
    .leftJoinAndSelect('restaurant.admin', 'admin')
    .where('restaurant.name = :name', { name: 'Restaurante Demo' })
    .getOne();
  
  if (existingRestaurant) {
    console.log('El restaurante demo ya existe');
    return existingRestaurant;
  }
  
  // Verificar si el admin ya tiene un restaurante asignado
  const adminWithRestaurant = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.restaurant', 'restaurant')
    .where('user.id = :userId', { userId: admin.id })
    .getOne();
  
  if (adminWithRestaurant && adminWithRestaurant.restaurant) {
    console.log('El administrador ya tiene un restaurante asignado');
    return adminWithRestaurant.restaurant;
  }
  
  // Crear restaurante
  const restaurant = restaurantRepository.create({
    name: 'Restaurante Demo',
    description: 'Restaurante de demostración para DysaEats',
    address: 'Av. Ejemplo 123, Santiago, Chile',
    logo: 'https://via.placeholder.com/150',
    isActive: true,
    admin: admin,
    openingHours: ['09:00-22:00', '09:00-22:00', '09:00-22:00', '09:00-22:00', '09:00-23:00', '10:00-23:00', '10:00-22:00'],
    phone: '+56912345678',
    email: 'restaurante@demo.com',
    website: 'https://restaurantedemo.com'
  });
  
  await restaurantRepository.save(restaurant);
  console.log('Restaurante demo creado correctamente');
  return restaurant;
};

// Función para crear categorías de menú
const createMenuCategories = async (restaurant: Restaurant): Promise<MenuCategory[]> => {
  const categoryRepository = dataSource.getRepository(MenuCategory);
  
  // Verificar si ya existen categorías asociadas al restaurante
  const existingCategories = await categoryRepository
    .createQueryBuilder('category')
    .innerJoin('category.restaurant', 'restaurant')
    .where('restaurant.id = :restaurantId', { restaurantId: restaurant.id })
    .getMany();
  if (existingCategories.length > 0) {
    console.log('Las categorías de menú ya existen');
    return existingCategories;
  }
  
  // Definir categorías
  const categories = [
    {
      name: 'Entradas',
      description: 'Aperitivos y entradas',
      position: 1,
      restaurant,
    },
    {
      name: 'Platos Principales',
      description: 'Platos principales y especialidades',
      position: 2,
      restaurant,
    },
    {
      name: 'Postres',
      description: 'Postres caseros',
      position: 3,
      restaurant,
    },
    {
      name: 'Bebidas',
      description: 'Bebidas y refrescos',
      position: 4,
      restaurant,
    },
  ];
  
  // Crear categorías
  const savedCategories = await categoryRepository.save(
    categories.map(cat => categoryRepository.create(cat))
  );
  
  console.log('Categorías de menú creadas correctamente');
  return savedCategories;
};

// Función para crear ítems de menú
const createMenuItems = async (categories: MenuCategory[]): Promise<void> => {
  const itemRepository = dataSource.getRepository(MenuItem);
  
  // Verificar si ya existen ítems asociados a la primera categoría
  const existingItems = await itemRepository
    .createQueryBuilder('item')
    .innerJoin('item.category', 'category')
    .where('category.id = :categoryId', { categoryId: categories[0].id })
    .getMany();
  if (existingItems.length > 0) {
    console.log('Los ítems de menú ya existen');
    return;
  }
  
  // Mapeo de categorías por nombre para facilitar la asignación
  const categoryMap = categories.reduce((map, category) => {
    map[category.name] = category;
    return map;
  }, {} as Record<string, MenuCategory>);
  
  // Definir ítems de menú
  const menuItems = [
    // Entradas
    {
      name: 'Empanadas de Queso',
      description: 'Empanadas caseras rellenas de queso',
      price: 2500,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Entradas'],
      restaurant: categoryMap['Entradas'].restaurant,
    },
    {
      name: 'Tabla de Quesos',
      description: 'Selección de quesos regionales con tostadas',
      price: 7500,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Entradas'],
      restaurant: categoryMap['Entradas'].restaurant,
    },
    
    // Platos principales
    {
      name: 'Lasaña Casera',
      description: 'Lasaña tradicional con carne y salsa bechamel',
      price: 8900,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Platos Principales'],
      restaurant: categoryMap['Platos Principales'].restaurant,
    },
    {
      name: 'Lomo Saltado',
      description: 'Plato típico peruano con carne, papas y arroz',
      price: 10500,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Platos Principales'],
      restaurant: categoryMap['Platos Principales'].restaurant,
    },
    
    // Postres
    {
      name: 'Cheesecake',
      description: 'Tarta de queso con mermelada de frutilla',
      price: 4500,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Postres'],
      restaurant: categoryMap['Postres'].restaurant,
    },
    {
      name: 'Tiramisu',
      description: 'Postre italiano con café y mascarpone',
      price: 4800,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Postres'],
      restaurant: categoryMap['Postres'].restaurant,
    },
    
    // Bebidas
    {
      name: 'Agua Mineral',
      description: 'Agua mineral con/sin gas 500ml',
      price: 1500,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Bebidas'],
      restaurant: categoryMap['Bebidas'].restaurant,
    },
    {
      name: 'Jugo Natural',
      description: 'Jugo natural de frutas de temporada',
      price: 2800,
      image: 'https://via.placeholder.com/300',
      available: true,
      category: categoryMap['Bebidas'],
      restaurant: categoryMap['Bebidas'].restaurant,
    },
  ];
  
  // Crear ítems
  await itemRepository.save(
    menuItems.map(item => itemRepository.create(item))
  );
  
  console.log('Ítems de menú creados correctamente');
};

// Ejecutar script
initSeeds();
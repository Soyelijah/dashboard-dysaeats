import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menu-item.entity';
import { MenuCategory } from '../restaurants/entities/menu-category.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { Payment } from '../payments/entities/payment.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSimpleService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  // USUARIOS
  async findAllUsers(options?: any): Promise<User[]> {
    return this.userRepository.find(options);
  }

  async findUserById(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      const salt = await bcrypt.genSalt();
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    if (userData.password) {
      const salt = await bcrypt.genSalt();
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    await this.userRepository.update(id, userData);
    return this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  // RESTAURANTES
  async findAllRestaurants(options?: any): Promise<Restaurant[]> {
    return this.restaurantRepository.find(options);
  }

  async findRestaurantById(id: string): Promise<Restaurant> {
    return this.restaurantRepository.findOne({
      where: { id },
      relations: ['admin'],
    });
  }

  async createRestaurant(restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const restaurant = this.restaurantRepository.create(restaurantData);
    return this.restaurantRepository.save(restaurant);
  }

  async updateRestaurant(id: string, restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    await this.restaurantRepository.update(id, restaurantData);
    return this.restaurantRepository.findOne({ where: { id } });
  }

  async deleteRestaurant(id: string): Promise<void> {
    await this.restaurantRepository.delete(id);
  }

  // CATEGORÍAS DE MENÚ
  async findAllMenuCategories(restaurantId?: string): Promise<MenuCategory[]> {
    const where: FindOptionsWhere<MenuCategory> = {};
    if (restaurantId) {
      where.restaurant = { id: restaurantId };
    }
    
    return this.menuCategoryRepository.find({
      where,
      relations: ['restaurant'],
      order: { displayOrder: 'ASC' },
    });
  }

  async findMenuCategoryById(id: string): Promise<MenuCategory> {
    return this.menuCategoryRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });
  }
  
  // Método auxiliar para ejecutar consultas SQL directas
  async executeQuery(query: string, parameters: any[] = []): Promise<any> {
    console.log('Service - Ejecutando consulta SQL:', query, parameters);
    try {
      const result = await this.menuCategoryRepository.query(query, parameters);
      console.log('Service - Resultado de la consulta:', result);
      return result;
    } catch (error) {
      console.error('Service - Error al ejecutar consulta:', error);
      throw error;
    }
  }
  
  // Método para forzar la recarga de datos después de una operación
  async reloadCategories(): Promise<void> {
    console.log('Service - Forzando recarga de categorías');
    // Esta es una operación ficticia que no hace nada en realidad,
    // pero sirve para indicar al controlador que los datos fueron actualizados
  }

  async createMenuCategory(categoryData: any): Promise<MenuCategory> {
    console.log('Service - Datos originales recibidos:', JSON.stringify(categoryData));
    
    // Verificar que tenemos el restaurantId
    if (!categoryData.restaurantId) {
      console.error('Service - Falta el ID del restaurante');
      throw new Error('Se requiere el ID del restaurante para crear una categoría');
    }
    
    try {
      console.log('Service - Creando categoría con SQL directo');
      
      // Usar SQL directo para evitar problemas con las relaciones
      const result = await this.menuCategoryRepository.query(
        `INSERT INTO menu_categories(name, description, display_order, restaurant_id) 
         VALUES($1, $2, $3, $4) 
         RETURNING id, name, description, display_order, created_at, updated_at, restaurant_id`, 
        [
          categoryData.name, 
          categoryData.description || null, 
          categoryData.displayOrder || 0, 
          categoryData.restaurantId
        ]
      );
      
      console.log('Service - Resultado de la inserción:', result);
      
      if (!result || result.length === 0) {
        throw new Error('No se pudo crear la categoría');
      }
      
      // Convertir el resultado a una entidad MenuCategory
      const category = new MenuCategory();
      category.id = result[0].id;
      category.name = result[0].name;
      category.description = result[0].description;
      category.displayOrder = result[0].display_order;
      category.restaurantId = result[0].restaurant_id;
      
      console.log('Service - Categoría creada:', category);
      
      return category;
    } catch (error) {
      console.error('Service - Error al crear categoría:', error);
      throw error;
    }
  }

  async updateMenuCategory(id: string, categoryData: any): Promise<MenuCategory> {
    console.log('Actualizando categoría con datos:', categoryData);
    
    // Si viene restaurantId, actualizar la relación
    if (categoryData.restaurantId) {
      try {
        const restaurant = await this.restaurantRepository.findOne({ 
          where: { id: categoryData.restaurantId } 
        });
        
        if (!restaurant) {
          throw new Error(`No se encontró el restaurante con ID ${categoryData.restaurantId}`);
        }
        
        // Eliminar restaurantId de los datos para evitar errores
        const { restaurantId, ...updateData } = categoryData;
        
        // Primero actualizamos los campos básicos
        if (Object.keys(updateData).length > 0) {
          await this.menuCategoryRepository.update(id, updateData);
        }
        
        // Luego actualizamos la relación
        await this.menuCategoryRepository.createQueryBuilder()
          .update(MenuCategory)
          .set({ restaurant: restaurant })
          .where("id = :id", { id: id })
          .execute();
        
        return this.menuCategoryRepository.findOne({
          where: { id },
          relations: ['restaurant']
        });
      } catch (error) {
        console.error(`Error al actualizar categoría ${id}:`, error);
        throw error;
      }
    } else {
      // Si no hay restaurantId, simplemente actualizamos los campos normales
      await this.menuCategoryRepository.update(id, categoryData);
      return this.menuCategoryRepository.findOne({ where: { id } });
    }
  }

  async deleteMenuCategory(id: string): Promise<void> {
    await this.menuCategoryRepository.delete(id);
  }

  // ITEMS DE MENÚ
  async findAllMenuItems(categoryId?: string, restaurantId?: string): Promise<MenuItem[]> {
    const where: FindOptionsWhere<MenuItem> = {};
    
    if (categoryId) {
      where.category = { id: categoryId };
    }
    
    if (restaurantId) {
      where.restaurant = { id: restaurantId };
    }
    
    return this.menuItemRepository.find({
      where,
      relations: ['category', 'restaurant'],
    });
  }

  async findMenuItemById(id: string): Promise<MenuItem> {
    return this.menuItemRepository.findOne({
      where: { id },
      relations: ['category', 'restaurant'],
    });
  }

  async createMenuItem(itemData: Partial<MenuItem>): Promise<MenuItem> {
    const item = this.menuItemRepository.create(itemData);
    return this.menuItemRepository.save(item);
  }

  async updateMenuItem(id: string, itemData: Partial<MenuItem>): Promise<MenuItem> {
    await this.menuItemRepository.update(id, itemData);
    return this.menuItemRepository.findOne({ where: { id } });
  }

  async deleteMenuItem(id: string): Promise<void> {
    await this.menuItemRepository.delete(id);
  }

  // PEDIDOS
  async findAllOrders(status?: string, restaurantId?: string): Promise<Order[]> {
    console.log('Buscando pedidos con filtros:', { status, restaurantId });
    
    const where: FindOptionsWhere<Order> = {};
    
    if (status) {
      // Convertir string a OrderStatus enum
      where.status = status as OrderStatus;
    }
    
    if (restaurantId) {
      where.restaurant = { id: restaurantId };
    }
    
    try {
      return this.orderRepository.find({
        where,
        relations: ['customer', 'restaurant', 'items', 'deliveryPerson'],
        order: { createdAt: 'DESC' }
      });
    } catch (error) {
      console.error('Error al buscar pedidos:', error);
      throw error;
    }
  }

  async findOrderById(id: string): Promise<Order> {
    return this.orderRepository.findOne({
      where: { id },
      relations: ['customer', 'restaurant', 'items', 'deliveryPerson']
    });
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return this.findOrderById(id);
  }

  async assignDeliveryPerson(id: string, deliveryPersonId: string): Promise<Order> {
    await this.orderRepository.update(id, { 
      deliveryPerson: { id: deliveryPersonId } 
    });
    return this.findOrderById(id);
  }

  // ESTADÍSTICAS Y DATOS DE RESUMEN
  async getDashboardStats(): Promise<any> {
    try {
      console.log('Obteniendo estadísticas del dashboard...');
      
      const usersCount = await this.userRepository.count();
      const restaurantsCount = await this.restaurantRepository.count();
      const ordersCount = await this.orderRepository.count();
      
      // Calcular ingresos totales
      const totalRevenue = await this.orderRepository
        .createQueryBuilder('orders')
        .select('SUM(orders.total)', 'total')
        .getRawOne()
        .then(result => result?.total || 0);

      console.log('Estadísticas reales obtenidas:', {
        usersCount,
        restaurantsCount,
        ordersCount,
        totalRevenue
      });

      return {
        usersCount,
        restaurantsCount,
        ordersCount,
        totalRevenue: parseFloat(totalRevenue as any) || 0
      };
    } catch (error) {
      console.error('Error general en getDashboardStats:', error);
      // Devolvemos valores por defecto en caso de error, para evitar errores en el frontend
      return {
        usersCount: 0,
        restaurantsCount: 0,
        ordersCount: 0,
        totalRevenue: 0
      };
    }
  }
}
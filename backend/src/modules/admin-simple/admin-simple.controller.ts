import { Controller, Get, Post, Body, UseGuards, Param, Delete, Patch, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { OrderStatus } from '../orders/enums/order-status.enum';
import { AdminSimpleService } from './admin-simple.service';
import { Public } from '../../shared/decorators/public.decorator';
import { UpdateOrderStatusDto, AssignDeliveryPersonDto } from './dto/update-order-status.dto';

@ApiTags('Admin')
@Controller('admin/api')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminSimpleController {
  constructor(
    private readonly adminService: AdminSimpleService
  ) {}

  // DASHBOARD
  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // USUARIOS
  @Get('users')
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  async getAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.findUserById(id);
  }

  @Post('users')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo usuario (solo admin)' })
  async createUser(@Body() userData: any) {
    return this.adminService.createUser(userData);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Actualizar un usuario existente' })
  async updateUser(@Param('id') id: string, @Body() userData: any) {
    return this.adminService.updateUser(id, userData);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // RESTAURANTES
  @Get('restaurants')
  @ApiOperation({ summary: 'Obtener todos los restaurantes' })
  async getAllRestaurants() {
    return this.adminService.findAllRestaurants({
      relations: ['admin'],
    });
  }

  @Get('restaurants/:id')
  @ApiOperation({ summary: 'Obtener restaurante por ID' })
  async getRestaurantById(@Param('id') id: string) {
    return this.adminService.findRestaurantById(id);
  }

  @Post('restaurants')
  @ApiOperation({ summary: 'Crear un nuevo restaurante' })
  async createRestaurant(@Body() restaurantData: any) {
    return this.adminService.createRestaurant(restaurantData);
  }

  @Patch('restaurants/:id')
  @ApiOperation({ summary: 'Actualizar un restaurante existente' })
  async updateRestaurant(@Param('id') id: string, @Body() restaurantData: any) {
    return this.adminService.updateRestaurant(id, restaurantData);
  }

  @Delete('restaurants/:id')
  @ApiOperation({ summary: 'Eliminar un restaurante' })
  async deleteRestaurant(@Param('id') id: string) {
    return this.adminService.deleteRestaurant(id);
  }

  // CATEGORÍAS DE MENÚ
  @Get('menu-categories')
  @ApiOperation({ summary: 'Obtener todas las categorías de menú' })
  async getAllMenuCategories(@Query('restaurantId') restaurantId?: string) {
    return this.adminService.findAllMenuCategories(restaurantId);
  }

  @Get('menu-categories/:id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  async getMenuCategoryById(@Param('id') id: string) {
    return this.adminService.findMenuCategoryById(id);
  }

  @Post('menu-categories')
  @ApiOperation({ summary: 'Crear una nueva categoría de menú' })
  async createMenuCategory(@Body() categoryData: any) {
    console.log('Controller - Datos recibidos para crear categoría:', JSON.stringify(categoryData));
    
    // Asegurarnos de que restaurantId está presente
    if (!categoryData.restaurantId) {
      throw new Error('Se requiere el ID del restaurante');
    }
    
    // Insertar directamente mediante SQL usando el servicio
    const result = await this.adminService.executeQuery(
      `INSERT INTO menu_categories(name, description, display_order, restaurant_id) 
       VALUES($1, $2, $3, $4) 
       RETURNING id`, 
      [
        categoryData.name, 
        categoryData.description || null, 
        categoryData.displayOrder || 0, 
        categoryData.restaurantId
      ]
    );
    
    // Recargar categorías para mostrar la nueva
    await this.adminService.reloadCategories();
    
    // Devolver el resultado
    return { success: true, categoryId: result[0]?.id };
  }

  @Patch('menu-categories/:id')
  @ApiOperation({ summary: 'Actualizar una categoría existente' })
  async updateMenuCategory(@Param('id') id: string, @Body() categoryData: any) {
    return this.adminService.updateMenuCategory(id, categoryData);
  }

  @Delete('menu-categories/:id')
  @ApiOperation({ summary: 'Eliminar una categoría' })
  async deleteMenuCategory(@Param('id') id: string) {
    return this.adminService.deleteMenuCategory(id);
  }

  // ITEMS DE MENÚ
  @Get('menu-items')
  @ApiOperation({ summary: 'Obtener todos los items de menú' })
  async getAllMenuItems(
    @Query('categoryId') categoryId?: string,
    @Query('restaurantId') restaurantId?: string
  ) {
    return this.adminService.findAllMenuItems(categoryId, restaurantId);
  }

  @Get('menu-items/:id')
  @ApiOperation({ summary: 'Obtener item por ID' })
  async getMenuItemById(@Param('id') id: string) {
    return this.adminService.findMenuItemById(id);
  }

  @Post('menu-items')
  @ApiOperation({ summary: 'Crear un nuevo item de menú' })
  async createMenuItem(@Body() itemData: any) {
    console.log('Controller - Datos recibidos para crear item de menú:', JSON.stringify(itemData));
    
    // Asegurarnos de que restaurantId está presente
    if (!itemData.restaurantId) {
      throw new Error('Se requiere el ID del restaurante');
    }
    
    // Asegurarnos de que categoryId está presente
    if (!itemData.categoryId) {
      throw new Error('Se requiere el ID de la categoría');
    }
    
    try {
      // Insertar directamente mediante SQL usando el servicio
      const result = await this.adminService.executeQuery(
        `INSERT INTO menu_items(name, description, price, available, image, restaurant_id, category_id) 
         VALUES($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`, 
        [
          itemData.name, 
          itemData.description || null, 
          itemData.price,
          itemData.isAvailable === false ? false : true,
          itemData.imageUrl || null,
          itemData.restaurantId,
          itemData.categoryId
        ]
      );
      
      console.log('Controller - Resultado de la inserción directa:', result);
      
      if (!result || result.length === 0) {
        throw new Error('No se pudo crear el elemento de menú');
      }
      
      // Devolver el resultado
      return { success: true, itemId: result[0]?.id };
    } catch (error) {
      console.error('Controller - Error al crear elemento de menú:', error);
      throw error;
    }
  }

  @Patch('menu-items/:id')
  @ApiOperation({ summary: 'Actualizar un item existente' })
  async updateMenuItem(@Param('id') id: string, @Body() itemData: any) {
    console.log('Controller - Datos recibidos para actualizar elemento de menú:', JSON.stringify(itemData));
    
    try {
      // Primero obtenemos los campos que debemos actualizar
      const fieldsToUpdate = {};
      
      // Campos de texto y numéricos
      if (itemData.name !== undefined) fieldsToUpdate['name'] = itemData.name;
      if (itemData.description !== undefined) fieldsToUpdate['description'] = itemData.description;
      if (itemData.price !== undefined) fieldsToUpdate['price'] = itemData.price;
      if (itemData.image !== undefined) fieldsToUpdate['image'] = itemData.image;
      if (itemData.imageUrl !== undefined) fieldsToUpdate['image'] = itemData.imageUrl;
      
      // Estado de disponibilidad
      if (itemData.available !== undefined) fieldsToUpdate['available'] = itemData.available;
      if (itemData.isAvailable !== undefined) fieldsToUpdate['available'] = itemData.isAvailable;
      
      // Relaciones
      if (itemData.category_id !== undefined) fieldsToUpdate['category_id'] = itemData.category_id;
      if (itemData.categoryId !== undefined) fieldsToUpdate['category_id'] = itemData.categoryId;
      if (itemData.restaurant_id !== undefined) fieldsToUpdate['restaurant_id'] = itemData.restaurant_id;
      if (itemData.restaurantId !== undefined) fieldsToUpdate['restaurant_id'] = itemData.restaurantId;
      
      console.log('Controller - Campos a actualizar:', fieldsToUpdate);
      
      // Actualizar directamente mediante SQL usando el servicio
      if (Object.keys(fieldsToUpdate).length > 0) {
        // Construir parte SET de la consulta SQL usando parámetros numerados PostgreSQL
        const setParts = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = Object.values(fieldsToUpdate);
        
        // Agregar ID al final de los valores
        const sql = `UPDATE menu_items SET ${setParts} WHERE id = $${values.length + 1}`;
        values.push(id);
        
        console.log('Controller - SQL Query:', sql);
        console.log('Controller - SQL Values:', values);
        
        await this.adminService.executeQuery(sql, values);
        
        // Asegurarse de que la UI se actualiza cargando el item actualizado
        const updatedItem = await this.adminService.findMenuItemById(id);
        console.log('Controller - Item actualizado:', updatedItem);
        
        return updatedItem || { success: true, message: 'Elemento de menú actualizado correctamente' };
      }
      
      return { success: true, message: 'No hay cambios para actualizar' };
    } catch (error) {
      console.error('Controller - Error al actualizar elemento de menú:', error);
      throw error;
    }
  }

  @Delete('menu-items/:id')
  @ApiOperation({ summary: 'Eliminar un item' })
  async deleteMenuItem(@Param('id') id: string) {
    return this.adminService.deleteMenuItem(id);
  }
  
  // PEDIDOS
  @Get('orders')
  @ApiOperation({ summary: 'Obtener todos los pedidos' })
  async getAllOrders(
    @Query('status') status?: string,
    @Query('restaurantId') restaurantId?: string
  ) {
    console.log('GET /admin/api/orders con filtros:', { status, restaurantId });
    return this.adminService.findAllOrders(status, restaurantId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  async getOrderById(@Param('id') id: string) {
    console.log(`GET /admin/api/orders/${id}`);
    return this.adminService.findOrderById(id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de un pedido' })
  async updateOrderStatus(
    @Param('id') id: string, 
    @Body() statusData: UpdateOrderStatusDto
  ) {
    console.log(`PATCH /admin/api/orders/${id}/status con data:`, statusData);
    return this.adminService.updateOrderStatus(id, statusData.status);
  }

  @Patch('orders/:id/assign')
  @ApiOperation({ summary: 'Asignar repartidor a un pedido' })
  async assignDeliveryPerson(
    @Param('id') id: string, 
    @Body() assignData: AssignDeliveryPersonDto
  ) {
    console.log(`PATCH /admin/api/orders/${id}/assign con data:`, assignData);
    return this.adminService.assignDeliveryPerson(id, assignData.deliveryPersonId);
  }

  // MÉTODO DE SALUD
  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Verificar estado del API Admin' })
  @UseGuards() // Anula cualquier guard a nivel de controlador
  async checkHealth() {
    return {
      status: 'ok',
      message: 'El API de administración está funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }
}
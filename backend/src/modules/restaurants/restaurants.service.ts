import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { UserRepository } from '../auth/repositories/user.repository';
import { User } from '../auth/entities/user.entity';
import { UserRole } from '../auth/enums/user-role.enum';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly userRepository: UserRepository,
  ) {}

  async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    const { adminId, ...restaurantData } = createRestaurantDto;

    // Verificar que el usuario existe
    const admin = await this.userRepository.findOneBy({ id: adminId });
    if (!admin) {
      throw new NotFoundException(`Usuario con ID "${adminId}" no encontrado`);
    }

    // Verificar que el usuario es un administrador de restaurante
    if (admin.role !== UserRole.RESTAURANT_ADMIN) {
      throw new ForbiddenException('El usuario debe tener rol de administrador de restaurante');
    }

    // Verificar que el usuario no tiene ya un restaurante asignado
    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { admin: { id: adminId } },
    });
    if (existingRestaurant) {
      throw new ForbiddenException('El usuario ya tiene un restaurante asignado');
    }

    // Crear el restaurante
    const restaurant = this.restaurantRepository.create({
      ...restaurantData,
      admin,
    });

    return this.restaurantRepository.save(restaurant);
  }

  async findAll(paginationDto: PaginationDto): Promise<{ data: Restaurant[], total: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC' } = paginationDto;
    
    const [data, total] = await this.restaurantRepository.findAndCount({
      relations: ['admin'],
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['admin'],
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurante con ID "${id}" no encontrado`);
    }

    return restaurant;
  }

  async update(id: string, updateRestaurantDto: UpdateRestaurantDto, user: User): Promise<Restaurant> {
    const restaurant = await this.findOne(id);

    // Verificar permisos: solo el administrador del restaurante o un superadmin puede actualizar
    if (user.role !== UserRole.SUPER_ADMIN && restaurant.admin.id !== user.id) {
      throw new ForbiddenException('No tienes permisos para actualizar este restaurante');
    }

    // Actualizar el restaurante
    const updatedRestaurant = Object.assign(restaurant, updateRestaurantDto);
    return this.restaurantRepository.save(updatedRestaurant);
  }

  async remove(id: string): Promise<void> {
    const restaurant = await this.findOne(id);
    await this.restaurantRepository.remove(restaurant);
  }

  async findByAdminId(adminId: string): Promise<Restaurant> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { admin: { id: adminId } },
      relations: ['admin'],
    });

    if (!restaurant) {
      throw new NotFoundException(`No se encontró un restaurante para el administrador con ID "${adminId}"`);
    }

    return restaurant;
  }
}
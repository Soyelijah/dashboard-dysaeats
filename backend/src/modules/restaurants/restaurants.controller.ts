import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { GetUser } from '../../shared/decorators/user.decorator';
import { User } from '../auth/entities/user.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { PaginationDto } from '../../shared/dto/pagination.dto';

@ApiTags('Restaurantes')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear un nuevo restaurante' })
  @ApiResponse({ status: 201, description: 'Restaurante creado exitosamente', type: Restaurant })
  create(@Body() createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
    return this.restaurantsService.create(createRestaurantDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los restaurantes' })
  @ApiResponse({ status: 200, description: 'Lista de restaurantes', type: [Restaurant] })
  findAll(@Query() paginationDto: PaginationDto): Promise<{ data: Restaurant[], total: number }> {
    return this.restaurantsService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un restaurante por ID' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado', type: Restaurant })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  findOne(@Param('id') id: string): Promise<Restaurant> {
    return this.restaurantsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.RESTAURANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar un restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante actualizado', type: Restaurant })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @GetUser() user: User,
  ): Promise<Restaurant> {
    return this.restaurantsService.update(id, updateRestaurantDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar un restaurante' })
  @ApiResponse({ status: 200, description: 'Restaurante eliminado' })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  remove(@Param('id') id: string): Promise<void> {
    return this.restaurantsService.remove(id);
  }

  @Get('admin/my-restaurant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.RESTAURANT_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el restaurante del administrador actual' })
  @ApiResponse({ status: 200, description: 'Restaurante encontrado', type: Restaurant })
  @ApiResponse({ status: 404, description: 'Restaurante no encontrado' })
  getMyRestaurant(@GetUser() user: User): Promise<Restaurant> {
    return this.restaurantsService.findByAdminId(user.id);
  }
}
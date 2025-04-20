import { Controller, Post, Body, Get, UseGuards, Req, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
<<<<<<< HEAD
// import { I18n, I18nContext } from 'nestjs-i18n';
=======
import { I18n, I18nContext } from 'nestjs-i18n';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GetUser } from '../../shared/decorators/user.decorator';
import { User } from './entities/user.entity';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from '../../shared/decorators/public.decorator';
<<<<<<< HEAD
// import { Language } from '../../shared/decorators/language.decorator';
import { RefreshTokenDto } from './dto/refresh-token.dto';
=======
import { Language } from '../../shared/decorators/language.decorator';
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
<<<<<<< HEAD
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
=======
  @ApiOperation({ summary: 'Registrar un nuevo usuario (restaurante)' })
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: User })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El usuario ya existe' })
  async register(
<<<<<<< HEAD
    @Body() registerDto: RegisterDto,
  ) {
    const user = await this.authService.register(registerDto);
    return {
      message: 'Usuario registrado correctamente',
=======
    @Body(ValidationPipe) registerDto: RegisterDto,
    @Language() lang: string,
    @I18n() i18n: I18nContext,
  ) {
    const user = await this.authService.register(registerDto);
    return {
      message: i18n.t('api.auth.registered', { lang }),
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      user,
    };
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({ status: 200, description: 'Inicio de sesión exitoso', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(
    @Body() loginDto: LoginDto, 
<<<<<<< HEAD
    @GetUser() user: User
  ) {
    const result = await this.authService.login(user);
    return {
      message: 'Inicio de sesión exitoso',
=======
    @GetUser() user: User,
    @Language() lang: string,
    @I18n() i18n: I18nContext
  ) {
    const result = await this.authService.login(user);
    return {
      message: i18n.t('api.auth.loggedIn', { lang }),
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente', type: User })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  getProfile(@GetUser() user: User): User {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  async logout(
<<<<<<< HEAD
    @GetUser() user: User
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: 'Sesión cerrada exitosamente' };
  }
  
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refrescar token de acceso usando refresh token' })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto
  ) {
    const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
    return {
      message: 'Token refrescado exitosamente',
      ...result,
    };
=======
    @GetUser() user: User,
    @Language() lang: string,
    @I18n() i18n: I18nContext
  ): Promise<{ message: string }> {
    await this.authService.logout(user.id);
    return { message: i18n.t('api.auth.loggedOut', { lang }) };
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }
}
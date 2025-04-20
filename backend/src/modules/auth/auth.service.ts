import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './repositories/user.repository';
import { RegisterDto } from './dto/register.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, rut, password } = registerDto;

    // Verificar si el correo ya existe
    const emailExists = await this.userRepository.findOneBy({ email });
    if (emailExists) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Verificar si el RUT ya existe
    if (rut) {
      const rutExists = await this.userRepository.findOneBy({ rut });
      if (rutExists) {
        throw new ConflictException('El RUT ya está registrado');
      }
    }

    // Crear nuevo usuario
    const user = this.userRepository.create(registerDto);
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(password, salt);

    // Guardar usuario
    await this.userRepository.save(user);
    
    return user;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    
    return null;
  }

  async login(user: User): Promise<LoginResponseDto> {
    const payload: JwtPayload = { 
      sub: user.id,
      email: user.email,
      role: user.role 
    };
    
<<<<<<< HEAD
    // Generar access token (corta duración)
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRATION') || '15m'
    });
    
    // Generar refresh token (larga duración)
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d'
      }
    );
    
    // Guardar refresh token en la base de datos
    user.refreshToken = refreshToken;
    await this.userRepository.save(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutos en segundos
=======
    const accessToken = this.jwtService.sign(payload);
    
    return {
      accessToken,
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async logout(userId: string): Promise<void> {
    const user = await this.userRepository.findOneBy({ id: userId });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    user.refreshToken = null;
    await this.userRepository.save(user);
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const user = await this.userRepository.findOneBy({ id: payload.sub });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
      };
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
<<<<<<< HEAD
  
  async refreshToken(refreshToken: string): Promise<LoginResponseDto> {
    try {
      // Verificar que el refresh token sea válido
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_SECRET'),
      });
      
      // Buscar el usuario por ID
      const user = await this.userRepository.findOneBy({ id: payload.sub });
      
      // Verificar que el usuario exista y que el refresh token coincida
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Token de refresco inválido');
      }
      
      // Generar nuevo access token
      const newPayload: JwtPayload = { 
        sub: user.id,
        email: user.email,
        role: user.role 
      };
      
      const accessToken = this.jwtService.sign(newPayload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION') || '15m'
      });
      
      // Generar nuevo refresh token
      const newRefreshToken = this.jwtService.sign(
        { sub: user.id },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d'
        }
      );
      
      // Actualizar refresh token en la base de datos
      user.refreshToken = newRefreshToken;
      await this.userRepository.save(user);
      
      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900, // 15 minutos en segundos
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Error al refrescar token: ' + error.message);
    }
  }
=======
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
}
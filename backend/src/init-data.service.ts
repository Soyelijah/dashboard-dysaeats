import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './modules/auth/entities/user.entity';
import { UserRole } from './modules/auth/enums/user-role.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InitDataService implements OnModuleInit {
  private readonly logger = new Logger(InitDataService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  async createDefaultAdmin() {
    try {
      // Verificar si ya existe un admin
      const adminExists = await this.userRepository.findOne({
        where: { role: UserRole.ADMIN },
      });

      if (adminExists) {
        this.logger.log('El usuario administrador predeterminado ya existe');
        return;
      }

      // Obtener credenciales de las variables de entorno
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') || 'admin@dysaeats.com';
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || '5369Foxi..';

      // Crear un hash de la contraseña
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      // Crear usuario administrador
      const adminUser = this.userRepository.create({
        firstName: 'Admin',
        lastName: 'DysaEats',
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN, // Usar el enum correcto
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+56912345678',
      });

      await this.userRepository.save(adminUser);
      
      this.logger.log(`Usuario administrador predeterminado creado con éxito: ${adminEmail}`);
    } catch (error) {
      this.logger.error('Error al crear el usuario administrador predeterminado:', error);
    }
  }
}
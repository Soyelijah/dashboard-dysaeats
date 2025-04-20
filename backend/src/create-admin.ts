import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './modules/auth/entities/user.entity';
import { Repository } from 'typeorm';
import { UserRole } from './modules/auth/enums/user-role.enum';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Verificar si existe el usuario admin
    const adminUser = await userRepository.findOne({
      where: { email: 'admin@dysaeats.com' }
    });

    if (adminUser) {
      console.log('Actualizando contraseña de administrador...');
      
      // Nueva contraseña: admin123
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Actualizar la contraseña
      adminUser.password = hashedPassword;
      await userRepository.save(adminUser);
      
      console.log('Contraseña del administrador actualizada con éxito.');
      console.log('Email: admin@dysaeats.com');
      console.log('Contraseña: admin123');
    } else {
      console.log('Creando nuevo usuario administrador...');
      
      // Nueva contraseña: admin123
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Crear un nuevo usuario administrador
      const newAdmin = userRepository.create({
        firstName: 'Admin',
        lastName: 'DysaEats',
        email: 'admin@dysaeats.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isEmailVerified: true,
        isActive: true,
        phoneNumber: '+56912345678',
      });
      
      await userRepository.save(newAdmin);
      
      console.log('Usuario administrador creado con éxito.');
      console.log('Email: admin@dysaeats.com');
      console.log('Contraseña: admin123');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
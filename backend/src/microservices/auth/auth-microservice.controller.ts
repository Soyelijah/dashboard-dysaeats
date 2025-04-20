import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../../modules/auth/auth.service';
import { RegisterDto } from '../../modules/auth/dto/register.dto';
import { LoginDto } from '../../modules/auth/dto/login.dto';

@Controller()
export class AuthMicroserviceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'register' })
  async register(data: RegisterDto) {
    try {
      const user = await this.authService.register(data);
      // Remove sensitive information
      const { password, ...result } = user;
      return result;
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @MessagePattern({ cmd: 'login' })
  async login(data: LoginDto) {
    try {
      // Validate user credentials
      const user = await this.authService.validateUser(data.email, data.password);
      
      if (!user) {
        return {
          status: 'error',
          message: 'Invalid credentials',
        };
      }
      
      // Generate JWT token
      return this.authService.login(user);
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @MessagePattern({ cmd: 'validate_token' })
  async validateToken(data: { token: string }) {
    try {
      return this.authService.validateToken(data.token);
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
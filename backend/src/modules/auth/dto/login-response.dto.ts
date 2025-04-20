import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UserDto {
<<<<<<< HEAD
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'usuario@ejemplo.com' })
  email: string;

  @ApiProperty({ example: 'Juan' })
  firstName: string;

  @ApiProperty({ example: 'Pérez' })
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.RESTAURANT_ADMIN })
=======
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  role: UserRole;
}

export class LoginResponseDto {
<<<<<<< HEAD
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

=======
  @ApiProperty()
  accessToken: string;

>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  @ApiProperty({ type: UserDto })
  user: UserDto;
}
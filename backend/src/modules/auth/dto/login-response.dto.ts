import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enums/user-role.enum';

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;
}

export class LoginResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: UserDto })
  user: UserDto;
}
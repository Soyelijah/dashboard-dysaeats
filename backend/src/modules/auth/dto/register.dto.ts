import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsRutValid } from '../../../shared/validators/rut.validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nombre del usuario',
    example: 'Juan',
  })
  @IsString({ message: i18nValidationMessage('validation.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'firstName' }) })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del usuario',
    example: 'Pérez',
  })
  @IsString({ message: i18nValidationMessage('validation.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'lastName' }) })
  lastName: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'juan.perez@example.com',
  })
  @IsEmail({}, { message: i18nValidationMessage('validation.email') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'email' }) })
  email: string;

  @ApiProperty({
    description: 'RUT chileno del usuario (formato: 12345678-9)',
    example: '12345678-9',
  })
  @IsString({ message: i18nValidationMessage('validation.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'rut' }) })
  @IsRutValid({ message: i18nValidationMessage('validation.rutInvalid') })
  rut: string;

  @ApiProperty({
    description: 'Contraseña del usuario (mínimo 8 caracteres)',
    example: 'Cl4v3S3gur4!',
  })
  @IsString({ message: i18nValidationMessage('validation.string') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.required', { field: 'password' }) })
  @MinLength(8, { message: i18nValidationMessage('validation.min.string', { field: 'password', min: 8 }) })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: i18nValidationMessage('validation.passwordComplexity'),
  })
  password: string;

  @ApiProperty({
    description: 'Nombre del restaurante (opcional)',
    example: 'Restaurante El Chileno',
    required: false,
  })
  @IsString({ message: i18nValidationMessage('validation.string') })
  @IsOptional()
  restaurantName?: string;
}
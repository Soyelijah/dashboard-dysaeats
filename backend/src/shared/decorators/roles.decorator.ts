import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/auth/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Especifica los roles que pueden acceder a una ruta
 * @param roles Roles permitidos para acceder a la ruta
 * @returns Decorador para roles
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
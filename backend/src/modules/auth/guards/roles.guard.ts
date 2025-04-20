import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRole } from '../enums/user-role.enum';
import { ROLES_KEY } from '../../../shared/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos definidos en el controlador o método
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles definidos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Determinar si es un contexto HTTP o GraphQL
    const isGraphQL = context.getType().toString() !== 'http';
    const request = isGraphQL
      ? GqlExecutionContext.create(context).getContext().req
      : context.switchToHttp().getRequest();

    const { user } = request;

    // Verificar que el usuario existe y tiene uno de los roles requeridos
    if (!user) {
      throw new ForbiddenException('No hay usuario autenticado');
    }

    const hasRequiredRole = requiredRoles.some(role => user.role === role);
    
    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../../../shared/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Comprobar si la ruta está marcada como pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Continuar con la autenticación JWT
    return super.canActivate(context);
  }

  getRequest(context: ExecutionContext) {
    // Soporte para contextos GraphQL
    if (context.getType().toString() !== 'http') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }

    // Context HTTP normal
    return context.switchToHttp().getRequest();
  }
}
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorador personalizado para obtener el usuario autenticado desde la solicitud
 * Funciona tanto para REST como para GraphQL
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    // Obtener el tipo de contexto (HTTP o GQL)
    const isGraphQL = context.getType().toString() !== 'http';

    // Obtener el objeto request según el tipo de contexto
    const request = isGraphQL
      ? GqlExecutionContext.create(context).getContext().req
      : context.switchToHttp().getRequest();

    // Si se especifica una propiedad, devolver esa propiedad del usuario
    if (data) {
      return request.user?.[data];
    }

    // Si no se especifica una propiedad, devolver el usuario completo
    return request.user;
  },
);
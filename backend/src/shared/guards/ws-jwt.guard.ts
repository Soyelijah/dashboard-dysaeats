import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const token = this.extractTokenFromHeader(client);
      
      if (!token) {
        throw new WsException('Token no proporcionado');
      }
      
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.get<string>('jwt.secret'),
        });
        
        // Adjuntar el payload decodificado al cliente de socket para uso posterior
        client.user = payload;
        
        return true;
      } catch (error) {
        throw new WsException('Token no válido');
      }
    } catch (err) {
      throw new WsException(err.message);
    }
  }

  private extractTokenFromHeader(client: any): string | undefined {
    // En Socket.IO, el token se puede proporcionar en los handshake.auth o handshake.query
    const auth = client.handshake?.auth || {};
    const query = client.handshake?.query || {};
<<<<<<< HEAD
    const headers = client.handshake?.headers || {};
    
    // Obtener token de diferentes fuentes posibles
    let token = auth.token || query.token;
    
    // Intentar extraer de la cabecera Authorization
    if (!token && headers.authorization) {
      const authHeader = headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7, authHeader.length);
      }
    }
    
    return token;
=======
    
    return auth.token || query.token;
>>>>>>> bffe05d7ca956643d183738ecc522ad112b3e36f
  }
}
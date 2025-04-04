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
    
    return auth.token || query.token;
  }
}
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromHeader(client);
      
      if (!token) {
        throw new WsException('Token no proporcionado');
      }
      
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });
      
      // Agregamos el usuario al socket para usarlo en los gateways
      client['user'] = payload;
      
      return true;
    } catch (error) {
      throw new WsException('Token inválido');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    // Extraer token de la consulta de socket.io
    const { token } = client.handshake.auth || {};
    if (token) return token;
    
    // Si no está en auth, intentar extraerlo de headers o cookies
    const { authorization } = client.handshake.headers || {};
    return authorization?.split(' ')[1];
  }
}

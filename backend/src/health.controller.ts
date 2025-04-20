import { Controller, Get, UseGuards } from '@nestjs/common';
import { Public } from './shared/decorators/public.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
@Public() // Aplicamos el decorador a nivel de controlador
export class HealthController {
  // Usamos dos rutas: una con /api y otra sin prefijo
  @Get('health')
  @Public()
  @UseGuards() // Desactiva explícitamente cualquier guard
  @ApiOperation({ summary: 'Verificar estado de la API' })
  getHealthWithoutPrefix() {
    return this.getHealthResponse();
  }
  
  @Get('api/health')
  @Public()
  @UseGuards() // Desactiva explícitamente cualquier guard
  @ApiOperation({ summary: 'Verificar estado de la API (con prefijo)' })
  getHealthWithPrefix() {
    return this.getHealthResponse();
  }
  
  private getHealthResponse() {
    return { 
      status: 'ok', 
      service: 'dysaeats-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}
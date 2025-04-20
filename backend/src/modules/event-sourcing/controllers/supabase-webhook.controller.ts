import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('webhooks/supabase')
export class SupabaseWebhookController {
  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post('events')
  async handleEventWebhook(
    @Headers('x-webhook-token') token: string,
    @Body() payload: any,
  ) {
    // Verificar el token de seguridad para asegurar que la petición viene de Supabase
    const webhookToken = this.configService.get<string>('supabase.webhookToken');
    if (token !== webhookToken) {
      return { success: false, message: 'Unauthorized' };
    }

    // Procesar el evento recibido
    const { event, record, table } = payload;

    if (table === 'events' && event === 'INSERT') {
      // Cuando se inserta un nuevo evento en Supabase, propagarlo al sistema
      const newEvent = record;
      
      // Emitir el evento usando el tipo y el agregado como canales
      this.eventEmitter.emit(newEvent.type, newEvent);
      this.eventEmitter.emit(
        `${newEvent.aggregate_type}:${newEvent.aggregate_id}`,
        newEvent,
      );
      
      // También emitir un evento general para todos los eventos
      this.eventEmitter.emit('event.created', newEvent);
    }

    return { success: true };
  }

  @Post('snapshots')
  async handleSnapshotWebhook(
    @Headers('x-webhook-token') token: string,
    @Body() payload: any,
  ) {
    // Verificar el token de seguridad
    const webhookToken = this.configService.get<string>('supabase.webhookToken');
    if (token !== webhookToken) {
      return { success: false, message: 'Unauthorized' };
    }

    // Procesar el evento de snapshot
    const { event, record, table } = payload;

    if (table === 'snapshots' && event === 'INSERT') {
      // Cuando se inserta un nuevo snapshot, notificar al sistema
      const newSnapshot = record;
      
      // Emitir evento de nuevo snapshot
      this.eventEmitter.emit('snapshot.created', newSnapshot);
      this.eventEmitter.emit(
        `snapshot.${newSnapshot.aggregate_type}.${newSnapshot.aggregate_id}`,
        newSnapshot,
      );
    }

    return { success: true };
  }
}
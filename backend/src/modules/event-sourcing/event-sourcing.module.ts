import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Snapshot } from './entities/snapshot.entity';
import { EventStoreService } from './services/event-store.service';
import { EventStoreController } from './controllers/event-store.controller';
import { SupabaseWebhookController } from './controllers/supabase-webhook.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, Snapshot]),
    ConfigModule,
    EventEmitterModule.forRoot({
      // Configuración global para propagación de eventos
      // Útil para manejar eventos en tiempo real en toda la aplicación
      wildcard: true,
      delimiter: ':',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: true,
      ignoreErrors: false,
    }),
  ],
  controllers: [EventStoreController, SupabaseWebhookController],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventSourcingModule {}
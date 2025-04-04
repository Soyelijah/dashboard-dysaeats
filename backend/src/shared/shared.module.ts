import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleMapsService } from './services';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [GoogleMapsService],
  exports: [GoogleMapsService],
})
export class SharedModule {}
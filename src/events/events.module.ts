import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { WebSocketService } from './events.service';


@Module({
  providers: [EventsGateway, WebSocketService],
  exports: [EventsGateway, WebSocketService],
})
export class EventsModule {}


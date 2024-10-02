import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { EventsModule } from '../events/events.module';
import { Event } from '../events/event.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Ticket, Event]), forwardRef(() => EventsModule)],
	providers: [TicketsService],
	exports: [TicketsService],
})
export class TicketsModule {}

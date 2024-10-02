import { forwardRef, Module } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { EventsModule } from '../events/events.module';

@Module({
	imports: [TypeOrmModule.forFeature([Ticket]), forwardRef(() => EventsModule)],
	providers: [TicketsService],
	exports: [TicketsService],
})
export class TicketsModule {}

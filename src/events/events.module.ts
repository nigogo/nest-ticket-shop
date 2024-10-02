import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { TicketsModule } from '../tickets/tickets.module';
import { CaslModule } from '../casl/casl.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Event]),
		forwardRef(() => TicketsModule),
		CaslModule,
	],
	controllers: [EventsController],
	providers: [EventsService],
	exports: [EventsService],
})
export class EventsModule {}

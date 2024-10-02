import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './ticket.entity';
import { Repository } from 'typeorm';
import { EventsService } from '../events/events.service';
import { TicketDto } from './dto/ticket.dto';

@Injectable()
export class TicketsService {
	constructor(
		@InjectRepository(Ticket)
		private ticketRepository: Repository<Ticket>,
		private eventService: EventsService
	) {}

	async create({
		eventId,
		userId,
	}: {
		eventId: number;
		userId: number;
	}): Promise<TicketDto> {
		const event = await this.eventService.findOne(eventId);
		const ticket = this.ticketRepository.create({
			user: { id: userId },
			event: { id: eventId },
			price_paid: event.ticket_price,
			purchase_time: new Date(),
		});
		const storedTicket = await this.ticketRepository.save(ticket);
		return {
			id: storedTicket.id,
			user_id: Number(storedTicket.user.id),
			event_id: Number(storedTicket.event.id),
			price_paid: storedTicket.price_paid,
			purchase_time: storedTicket.purchase_time,
		};
	}
}

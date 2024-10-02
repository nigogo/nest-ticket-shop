import { ConflictException, Injectable } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import { DataSource } from 'typeorm';
import { TicketDto } from './dto/ticket.dto';
import { Event } from '../events/event.entity';
import * as process from 'node:process';

@Injectable()
export class TicketsService {
	private TICKET_INCREMENT = process.env.TICKET_INCREMENT;
	private PRICE_INCREMENT = process.env.PRICE_INCREMENT;

	constructor(private dataSource: DataSource) {}

	async create({
		eventId,
		userId,
	}: {
		eventId: number;
		userId: number;
	}): Promise<TicketDto> {
		const queryRunner = this.dataSource.createQueryRunner();
		await queryRunner.connect();
		await queryRunner.startTransaction();

		try {
			const event = await queryRunner.manager.findOneOrFail(Event, {
				where: { id: eventId },
				lock: { mode: 'pessimistic_write' },
			});

			if (event.available_tickets <= 0) {
				throw new ConflictException('No available tickets');
			}

			// calculate ticket price
			const price_paid = this.calculateTicketPrice(event);

			const ticket = queryRunner.manager.create(Ticket, {
				user: { id: userId },
				event: { id: eventId },
				price_paid,
				purchase_time: new Date(),
			});
			const storedTicket = await queryRunner.manager.save(Ticket, ticket);

			await queryRunner.manager.update(Event, eventId, {
				available_tickets: event.available_tickets - 1,
			});

			await queryRunner.commitTransaction();

			return {
				id: storedTicket.id,
				user_id: Number(storedTicket.user.id),
				event_id: Number(storedTicket.event.id),
				price_paid: storedTicket.price_paid,
				purchase_time: storedTicket.purchase_time,
			};
		} catch (error) {
			await queryRunner.rollbackTransaction();
			throw error;
		} finally {
			await queryRunner.release();
		}
	}

	// TODO unit test
	// Note: A better alternative would be to store the amount of sold tickets in the event entity instead of calculating it
	private calculateTicketPrice(event: Event): number {
		const soldTickets = event.total_tickets - event.available_tickets;
		const soldTicketBlocks = Math.floor(
			soldTickets / Number(this.TICKET_INCREMENT)
		);
		return event.ticket_price + soldTicketBlocks * Number(this.PRICE_INCREMENT);
	}
}

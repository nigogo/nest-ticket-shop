import { ConflictException, Injectable } from '@nestjs/common';
import { Ticket } from './ticket.entity';
import { DataSource } from 'typeorm';
import { TicketDto } from './dto/ticket.dto';
import { Event } from '../events/event.entity';

@Injectable()
export class TicketsService {
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

			const ticket = queryRunner.manager.create(Ticket, {
				user: { id: userId },
				event: { id: eventId },
				price_paid: event.ticket_price,
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
}

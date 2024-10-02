import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import * as fs from 'node:fs';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
	private readonly logger = new Logger(EventsService.name);

	constructor(
		@InjectRepository(Event)
		private eventRepository: Repository<Event>
	) {}

	async create(createEventDto: CreateEventDto): Promise<Event> {
		const event = this.eventRepository.create(createEventDto);
		return this.eventRepository.save(event);
	}

	async findAll(): Promise<Event[]> {
		return this.eventRepository.find();
	}

	async findOne(id: number): Promise<Event> {
		return this.eventRepository.findOneByOrFail({ id });
	}

	async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
		const event = await this.findOne(id);

		// Note: This is a simple solution to prevent reducing the total tickets below the number of tickets already sold.
		if (
			updateEventDto.total_tickets &&
			updateEventDto.total_tickets < event.total_tickets
		) {
			throw new BadRequestException('Total tickets cannot be decreased');
		}

		const updatedEvent = this.eventRepository.merge(event, updateEventDto);
		return this.eventRepository.save(updatedEvent);
	}

	async remove(id: number): Promise<void> {
		// Note: We could soft delete the event before hard deleting it so that it will not be available to users but can be recovered if needed.
		const event = await this.eventRepository.findOneOrFail({
			where: { id },
		});
		this.writeEventToFileAndDelete(event);
	}

	async writeEventToFileAndDelete(event: Event) {
		fs.writeFile(
			`event-${event.id}.json`,
			JSON.stringify(event),
			{},
			async (err) => {
				if (err) {
					throw new Error(
						`Error writing event ${event.id} to file. Error: ${err}`
					);
				} else if (fs.existsSync(`event-${event.id}.json`)) {
					this.logger.log(`Event ${event.id} written to file, deleting event...`);
					this.eventRepository
						.remove(event)
						.catch((err) => {
							throw new Error(
								`Error deleting event ${event.id} after writing to file. Error: ${err}`
							);
						})
						.then(() => {
							this.logger.log(`Event deleted`);
						});
				}
			}
		);
	}
}

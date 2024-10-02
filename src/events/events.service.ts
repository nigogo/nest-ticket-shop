import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
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
		if (updateEventDto.total_tickets && updateEventDto.total_tickets < event.total_tickets) {
			throw new BadRequestException('Total tickets cannot be decreased');
		}

		const updatedEvent = this.eventRepository.merge(event, updateEventDto);
		return this.eventRepository.save(updatedEvent);
	}
}

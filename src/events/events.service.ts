import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';

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
}

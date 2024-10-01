import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiBearerAuth()
	async createEvent(@Body() createEventDto: CreateEventDto) {
		return this.eventsService.create(createEventDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiBearerAuth()
	async getAllEvents() {
		return this.eventsService.findAll();
	}
}

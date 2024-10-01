import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Post,
	Query,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventDto } from './dto/event.dto';

@Controller('events')
@UseInterceptors(ClassSerializerInterceptor)
export class EventsController {
	constructor(private readonly eventsService: EventsService) {}

	// TODO auth - use jwt auth guard for all routes by default and make exceptions where needed
	@UseGuards(JwtAuthGuard)
	@Post()
	@ApiBearerAuth()
	async createEvent(@Body() createEventDto: CreateEventDto): Promise<EventDto> {
		return this.eventsService.create(createEventDto);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	@ApiBearerAuth()
	async getAllEvents(): Promise<EventDto[]> {
		return this.eventsService.findAll();
	}

	@UseGuards(JwtAuthGuard)
	@Get(':id')
	@ApiBearerAuth()
	async getEvent(@Query('id') id: number): Promise<EventDto> {
		return this.eventsService.findOne(id);
	}
}

import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventDto } from './dto/event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('events')
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
	async getEvent(@Param('id') id: number): Promise<EventDto> {
		return this.eventsService.findOne(id);
	}

	@UseGuards(JwtAuthGuard)
	@Put(':id')
	@ApiBearerAuth()
	async updateEvent(
		@Param('id') id: number,
		@Body() createEventDto: UpdateEventDto
	): Promise<EventDto> {
		return this.eventsService.update(id, createEventDto);
	}

	// Note: We could return a 200 containing the filename, UUID or url of the JSON file
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	@HttpCode(204)
	@ApiBearerAuth()
	async deleteEvent(@Param('id') id: number): Promise<void> {
		return this.eventsService.remove(id);
	}
}

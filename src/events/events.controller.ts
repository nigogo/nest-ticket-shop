import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	Post,
	Put,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { EventDto } from './dto/event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../users/user.entity';
import { TicketsService } from '../tickets/tickets.service';
import * as process from 'node:process';
import { Response } from 'express';
import { AbilityGuard } from '../common/guards/ability.guard';
import { CheckPolicies } from '../common/decorators/policy.decorator';
import { Event } from './event.entity';
import { Ticket } from '../tickets/ticket.entity';

@Controller('events')
@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('events')
export class EventsController {
	private API_BASE_URL = process.env.API_BASE_URL;

	constructor(
		private readonly eventsService: EventsService,
		private readonly ticketsService: TicketsService
	) {}

	// TODO auth - use jwt auth guard for all routes by default and make exceptions where needed
	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('create', Event))
	@Post()
	@ApiBearerAuth()
	async createEvent(@Body() createEventDto: CreateEventDto): Promise<EventDto> {
		return this.eventsService.create(createEventDto);
	}

	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('read', Event))
	@Get()
	@ApiBearerAuth()
	async getAllEvents(): Promise<EventDto[]> {
		return this.eventsService.findAll();
	}

	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('read', Event))
	@Get(':id')
	@ApiBearerAuth()
	async getEvent(@Param('id') id: number): Promise<EventDto> {
		return this.eventsService.findOne(id);
	}

	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('update', Event))
	@Put(':id')
	@ApiBearerAuth()
	async updateEvent(
		@Param('id') id: number,
		@Body() createEventDto: UpdateEventDto
	): Promise<EventDto> {
		return this.eventsService.update(id, createEventDto);
	}

	// Note: We could return a 200 containing the filename, UUID or url of the JSON file
	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('delete', Event))
	@Delete(':id')
	@HttpCode(204)
	@ApiBearerAuth()
	async deleteEvent(@Param('id') id: number): Promise<void> {
		return this.eventsService.remove(id);
	}

	@UseGuards(JwtAuthGuard, AbilityGuard)
	@CheckPolicies((ability) => ability.can('create', Ticket))
	@Post(':id/tickets')
	@ApiBearerAuth()
	async createTicket(
		@Param('id') id: number,
		@GetUser() { id: userId }: User,
		@Res() res: Response
	) {
		const ticket = await this.ticketsService.create({ eventId: id, userId });
		res.setHeader('Location', `${this.API_BASE_URL}/tickets/${ticket.id}`);
		res.status(HttpStatus.CREATED).json(ticket);
	}
}

import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { createEventDto } from '../../test/test-data';
import { EventsService } from './events.service';
import { validate } from 'class-validator';
import { CreateEventDto } from './dto/create-event.dto';
import { expectValidationConstraintError } from '../../test/e2e-utils';

describe('EventsController', () => {
	let controller: EventsController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EventsController],
			providers: [
				{
					provide: EventsService,
					useValue: {},
				},
			],
		}).compile();

		controller = module.get<EventsController>(EventsController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should pass if all fields are valid', async () => {
		const event: CreateEventDto = new CreateEventDto();
		Object.assign(event, createEventDto);
		const errors = await validate(event);
		expect(errors).toHaveLength(0);
	});

	it('should fail if total_ticket <= 0', async () => {
		const event = new CreateEventDto();
		Object.assign(event, createEventDto);

		event.total_tickets = 0;
		await expectValidationConstraintError(event, 'total_tickets', 'min');

		event.total_tickets = -1;
		await expectValidationConstraintError(event, 'total_tickets', 'min');
	});

	// TODO fix
	it('should fail if available_tickets > total_tickets', async () => {
		const event = new CreateEventDto();
		Object.assign(event, createEventDto);
		event.total_tickets = 100;
		event.available_tickets = 200;

		await expectValidationConstraintError(event, 'available_tickets', 'IsLessThanOrEqualTo');
	});

	it('should fail if the ticket price is not within constraints', async () => {
		const event = new CreateEventDto();
		Object.assign(event, createEventDto);

		event.ticket_price = -1;
		await expectValidationConstraintError(event, 'ticket_price', 'min');

		event.ticket_price = 10000;
		await expectValidationConstraintError(event, 'ticket_price', 'max');

		event.ticket_price = 0.001;
		await expectValidationConstraintError(event, 'ticket_price', 'isNumber');
	});

	it('should fail if the date is not a valid date', async () => {
		const event = new CreateEventDto();
		Object.assign(event, createEventDto);

		event.date = 'invalid date'
		await expectValidationConstraintError(event, 'date', 'isIso8601');
	});
});

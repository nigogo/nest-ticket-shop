import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Event } from '../src/events/event.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { createEventDto } from './test-data';
import { E2eUtils } from './e2e-utils';

describe('Tickets e2e Tests', () => {
	let app: INestApplication;
	let userRepository: Repository<User>;
	let eventRepository: Repository<Event>;
	let ticketRepository: Repository<Event>;
	let utils: E2eUtils;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				TypeOrmModule.forRoot({
					type: 'postgres',
					url: process.env.DB_URL,
					entities: [__dirname + '/**/*.entity{.ts,.js}'],
					synchronize: true,
				}),
			],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe());
		await app.init();
		userRepository = moduleFixture.get<Repository<User>>(
			getRepositoryToken(User)
		);
		eventRepository = moduleFixture.get<Repository<Event>>(
			getRepositoryToken(Event)
		);
		ticketRepository = moduleFixture.get<Repository<Event>>(
			getRepositoryToken(Event)
		);
		utils = new E2eUtils(app);
	});

	afterEach(async () => {
		// TODO remove all files created during tests (event-*.json)
		await ticketRepository.delete({});
		await eventRepository.delete({});
		await userRepository.delete({});
		await app.close();
	});

	it('/events/:id/tickets (POST) - should create a ticket', async () => {
		const token = await utils.registerUserAndLogin();

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${token}`)
			.expect(201)
			.expect((res) => {
				expect(res.body).toHaveProperty('id');
				expect(res.body).toHaveProperty('user_id');
				expect(res.body).toHaveProperty('event_id', event.id);
				expect(res.body).toHaveProperty('price_paid', event.ticket_price);
				expect(res.body).toHaveProperty('purchase_time');
			});

		await request(app.getHttpServer())
			.get(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.available_tickets).toBe(event.available_tickets - 1);
			});
	});

	it('/events/:id/tickets (POST) - should return 409 if the event is sold out', async () => {
		const token = await utils.registerUserAndLogin();

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send({ ...createEventDto, total_tickets: 1, available_tickets: 1 })
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${token}`)
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${token}`)
			.expect(409);
	});

	it('/events/:id/tickets (POST) - should return 404 if the event does not exist', async () => {
		const token = await utils.registerUserAndLogin();

		await request(app.getHttpServer())
			.post(`/events/0/tickets`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/events/:id/tickets (POST) - should return 401 if user is not logged in', async () => {
		const token = await utils.registerUserAndLogin();

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.expect(401);
	});
});

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { Event } from '../src/events/event.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { createEventDto, registerUserDto } from './test-data';
import { E2eUtils } from './e2e-utils';
import * as process from 'node:process';

describe('Tickets e2e Tests', () => {
	const API_BASE_URL = process.env.API_BASE_URL;
	const TICKET_INCREMENT = process.env.TICKET_INCREMENT;
	const PRICE_INCREMENT = process.env.PRICE_INCREMENT;

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
		const adminToken = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${adminToken}`)
			.send(createEventDto)
			.expect(201);

		const userToken = await utils.registerUserAndLogin({
			...registerUserDto,
			username: 'user',
		});

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(201)
			.expect((res) => {
				expect(res.body).toHaveProperty('id');
				expect(res.body).toHaveProperty('user_id');
				expect(res.body).toHaveProperty('event_id', event.id);
				expect(res.body).toHaveProperty('price_paid', event.ticket_price);
				expect(res.body).toHaveProperty('purchase_time');
				expect(res.headers).toHaveProperty(
					'location',
					`${API_BASE_URL}/tickets/${res.body.id}`
				);
			});

		await request(app.getHttpServer())
			.get(`/events/${event.id}`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.available_tickets).toBe(event.available_tickets - 1);
			});
	});

	it('/events/:id/tickets (POST) - should return 409 if the event is sold out', async () => {
		const adminToken = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...createEventDto, total_tickets: 1, available_tickets: 1 })
			.expect(201);

		const userToken = await utils.registerUserAndLogin({
			...registerUserDto,
			username: 'user',
		});

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${userToken}`)
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
		const adminToken = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${adminToken}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.expect(401);
	});

	it('/events/:id/tickets (POST) - should increase ticket price after TICKET_INCREMENT tickets are sold', async () => {
		const adminToken = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${adminToken}`)
			.send({ ...createEventDto })
			.expect(201);

		const userToken = await utils.registerUserAndLogin({
			...registerUserDto,
			username: 'user',
		});

		for (let i = 0; i < Number(TICKET_INCREMENT); i++) {
			await request(app.getHttpServer())
				.post(`/events/${event.id}/tickets`)
				.set('Authorization', `Bearer ${userToken}`)
				.expect(201);
		}

		await request(app.getHttpServer())
			.post(`/events/${event.id}/tickets`)
			.set('Authorization', `Bearer ${userToken}`)
			.expect(201)
			.expect((res) => {
				expect(res.body.price_paid).toBe(
					createEventDto.ticket_price + Number(PRICE_INCREMENT)
				);
			});
	});
});

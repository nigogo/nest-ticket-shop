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

describe('Events e2e Tests', () => {
	let app: INestApplication;
	let userRepository: Repository<User>;
	let eventRepository: Repository<Event>;
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
		utils = new E2eUtils(app);
	});

	afterEach(async () => {
		await eventRepository.delete({});
		await userRepository.delete({});
		await app.close();
	});

	// 404 if event not found
	// single event - 403 if user is not logged in
	// POST event - 401 if user is not logged in
	// POST event - 400 if data is invalid
	// POST event - 201 if event is created
	// POST event - 403 if user is not an admin

	it('/events (GET) - should return all events', async () => {
		const token = await utils.registerUserAndLogin();
		await utils.createEvent(createEventDto, token);
		await utils.createEvent(createEventDto, token);

		await request(app.getHttpServer())
			.get('/events')
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect((res) => {
				expect(res.body).toHaveLength(2);
			});
	});

	it('/events (GET) - should return 403 if user is not logged in', async () => {
		await request(app.getHttpServer())
			.get('/events')
			.expect(401);
	});

	it('/events/:id (GET) - should return a single event', async () => {
		const token = await utils.registerUserAndLogin();

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.get(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(200)
			.expect((res) => {
				console.log(res.body);
				expect(res.body).toHaveProperty('id', event.id);
				expect(res.body).toHaveProperty('created_at');
				expect(res.body).toHaveProperty('updated_at');
				expect(res.body).toHaveProperty('name', createEventDto.name);
				expect(new Date(res.body.date)).toEqual(createEventDto.date);
				expect(res.body).toHaveProperty('location', createEventDto.location);
				expect(res.body).toHaveProperty('total_tickets', createEventDto.total_tickets);
				expect(res.body).toHaveProperty('available_tickets', createEventDto.total_tickets);
				expect(res.body).toHaveProperty('ticket_price', createEventDto.ticket_price);
			});
	});
});

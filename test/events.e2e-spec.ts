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
	// Get all events
	// all events - 403 if user is not logged in
	// POST event - 403 if user is not logged in
	// POST event - 400 if data is invalid
	// POST event - 201 if event is created
	// POST event - 402 if user is not an admin

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
});

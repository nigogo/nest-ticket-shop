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
import { CaslModule } from '../src/casl/casl.module';

describe('Events e2e Tests', () => {
	let app: INestApplication;
	let userRepository: Repository<User>;
	let eventRepository: Repository<Event>;
	let utils: E2eUtils;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				AppModule,
				CaslModule,
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
		// TODO remove all files created during tests (event-*.json)
		await eventRepository.delete({});
		await userRepository.delete({});
		await app.close();
	});

	it('/events (POST) - should create an event', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201)
			.expect((res) => {
				expect(res.body).toHaveProperty('id');
				expect(res.body).toHaveProperty('created_at');
				expect(res.body).toHaveProperty('updated_at');
				expect(res.body).toHaveProperty('name', createEventDto.name);
				expect(new Date(res.body.date)).toEqual(new Date(createEventDto.date));
				expect(res.body).toHaveProperty('location', createEventDto.location);
				expect(res.body).toHaveProperty(
					'total_tickets',
					createEventDto.total_tickets
				);
				expect(res.body).toHaveProperty(
					'available_tickets',
					createEventDto.total_tickets
				);
				expect(res.body).toHaveProperty(
					'ticket_price',
					createEventDto.ticket_price
				);
			});
	});

	it('/events (GET) - should return all events', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);
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

	it('/events (GET) - should return 401 if user is not logged in', async () => {
		await request(app.getHttpServer()).get('/events').expect(401);
	});

	it('/events/:id (GET) - should return a single event', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

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
				expect(res.body).toHaveProperty('id', event.id);
				expect(res.body).toHaveProperty('name', event.name);
			});
	});

	it('/events/:id (GET) - should return 401 if user is not logged in', () => {
		return request(app.getHttpServer()).get('/events/1').expect(401);
	});

	// TODO auth POST event - 403 if user is not an admin

	it('/events/:id (GET) - should return 404 if event does not exist', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.get(`/events/${event.id + 1}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/events/:id (PUT) - should update an event', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		const updatedEvent = {
			...createEventDto,
			name: 'Updated Event',
			location: 'Updated Location',
			date: '2025-01-01T00:00:00.000Z',
			total_tickets: 20001,
		};

		await request(app.getHttpServer())
			.put(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(updatedEvent)
			.expect(200)
			.expect((res) => {
				expect(res.body).toHaveProperty('id', event.id);
				expect(res.body).toHaveProperty('name', updatedEvent.name);
				expect(res.body).toHaveProperty('location', updatedEvent.location);
				expect(res.body).toHaveProperty('date', updatedEvent.date);
			});
	});

	it('/events/:id (PUT) - should return 400 if total_tickets are decreased', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		const updatedEvent = {
			...createEventDto,
			total_tickets: 100,
		};

		await request(app.getHttpServer())
			.put(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(updatedEvent)
			.expect(400);
	});

	it('/events/:id (PUT) - should return 404 if event does not exist', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.put(`/events/${event.id + 1}`)
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(404);
	});

	it('/events/:id (PUT) - should return 401 if user is not logged in', async () => {
		await request(app.getHttpServer())
			.post('/events')
			.send(createEventDto)
			.expect(401);
	});

	it('/events/:id (PUT) - should return 400 if invalid data is sent', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		const updatedEvent = {
			...createEventDto,
			date: 'invalid date',
		};

		await request(app.getHttpServer())
			.put(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.send(updatedEvent)
			.expect(400);
	});

	// TODO auth PUT event - should fail if available tickets are sent

	it('/events/:id (DELETE) - should delete an event', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(204);

		// wait for the event to be deleted
		await new Promise((resolve) => setTimeout(resolve, 200));

		const { body: { access_token: token2 } } = await request(app.getHttpServer())
			.post('/auth/login')
			.send(registerUserDto)
			.expect(200);

		await request(app.getHttpServer())
			.get(`/events/${event.id}`)
			.set('Authorization', `Bearer ${token2}`)
			.expect(404);
	});

	it('/events/:id (DELETE) - should return 404 if event does not exist', async () => {
		const token = await utils.registerAdminUserAndLogin(userRepository);

		const { body: event } = await request(app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);

		await request(app.getHttpServer())
			.delete(`/events/${event.id + 1}`)
			.set('Authorization', `Bearer ${token}`)
			.expect(404);
	});

	it('/events/:id (DELETE) - should return 401 if user is not logged in', async () => {
		await request(app.getHttpServer())
			.delete('/events/0')
			.send(createEventDto)
			.expect(401);
	});

	// TODO DELETE event - should return 403 if user is not an admin
});

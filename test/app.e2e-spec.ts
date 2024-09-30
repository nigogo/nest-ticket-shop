import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { registerUserDto } from './test-data';
import { Repository } from 'typeorm';
import { User } from '../src/users/user.entity';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';

describe('Application Behavior Tests (e2e)', () => {
	let app: INestApplication;
	let userRepository: Repository<User>;

	beforeEach(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule, TypeOrmModule.forRoot({
				type: 'postgres',
				url: process.env.DB_URL,
				entities: [__dirname + '/**/*.entity{.ts,.js}'],
				synchronize: true,
			})],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(new ValidationPipe());
		await app.init();
		userRepository = moduleFixture.get<Repository<User>>(
			getRepositoryToken(User)
		);
	});

	afterEach(async () => {
		await userRepository.delete({});
		await app.close();
	});

	it('/auth/register (POST) - should create a new user', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect((res) => {
				expect(res.status).toBe(201);
				expect(res.body).toBeDefined();
				expect(res.body).not.toHaveProperty('id');
				expect(res.body).toHaveProperty('username', registerUserDto.username);
				expect(res.body).not.toHaveProperty('created_at');
				expect(res.body).not.toHaveProperty('updated_at');
			});
	});

	it('/auth/register (POST) - should fail if username already exists', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect(201);

		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect(409);
	});

	it('/auth/register (POST) - should fail if the data is invalid', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send({ username: 'foo', password: 'bar' })
			.expect((res) => {
				expect(res.status).toBe(400);
				expect(res.body.message).toHaveLength(2);
			});

		await request(app.getHttpServer())
			.post('/auth/register')
			.send({
				username:
					'***this_username_is_too_long_and_has_symbols_other_than_underscore',
				password:
					'this-is-a-very-long-password-that-should-fail-validation-because-it-is-over-64-characters',
			})
			.expect((res) => {
				expect(res.status).toBe(400);
				expect(res.body.message).toHaveLength(2);
			});
	});

	it('/auth/login (POST) - should return an access token', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect(201);

		await request(app.getHttpServer())
			.post('/auth/login')
			.send(registerUserDto)
			.expect((res) => {
				expect(res.status).toBe(200);
				expect(res.body).toHaveProperty('access_token');
			});
	});

	it('/auth/login (POST) - should fail if the user does not exist', async () => {
		await request(app.getHttpServer())
			.post('/auth/login')
			.send(registerUserDto)
			.expect(401);
	});

	it('/auth/login (POST) - should fail if the username is incorrect', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect(201);

		await request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...registerUserDto, username: 'wrong_username' })
			.expect(401);
	});

	it('/auth/login (POST) - should fail if the password is incorrect', async () => {
		await request(app.getHttpServer())
			.post('/auth/register')
			.send(registerUserDto)
			.expect(201);

		await request(app.getHttpServer())
			.post('/auth/login')
			.send({ ...registerUserDto, password: 'wrong_password' })
			.expect(401);
	});
});

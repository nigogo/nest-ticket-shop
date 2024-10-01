import { CreateEventDto } from '../src/events/dto/create-event.dto';
import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { RegisterUserDto } from '../src/auth/dto/register-user.dto';
import { registerUserDto } from './test-data';
import { validate } from 'class-validator';

export class E2eUtils {
	constructor(private app: INestApplication) {}

	async registerUserAndLogin(
		dto: RegisterUserDto = registerUserDto
	): Promise<string> {
		await request(this.app.getHttpServer())
			.post('/auth/register')
			.send(dto)
			.expect(201);

		const { body } = await request(this.app.getHttpServer())
			.post('/auth/login')
			.send(dto)
			.expect(200);

		return body.access_token;
	}

	async createEvent(createEventDto: CreateEventDto, token: string) {
		await request(this.app.getHttpServer())
			.post('/events')
			.set('Authorization', `Bearer ${token}`)
			.send(createEventDto)
			.expect(201);
	}
}

export const expectValidationConstraintError = async <T extends object>(dto: T, property: keyof T, constraint: string) => {
	const errors = await validate(dto);
	const errorForProperty = errors.find(error => error.property === property);
	expect(errorForProperty).toBeDefined();
	expect(errorForProperty?.constraints).toBeDefined();
	expect(Object.keys(errorForProperty?.constraints || {})).toContain(constraint);
}

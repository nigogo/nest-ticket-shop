import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { registerUserDto } from '../../test/test-data';
import { JwtModule } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				JwtModule.register({
					secret: 'secret',
					signOptions: { expiresIn: '2m' },
				}),
			],
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: {
						createUser: jest.fn(() =>
							Promise.resolve({ id: 1, ...registerUserDto })
						),
						getUserForInternalUse: jest.fn(() =>
							Promise.resolve({ id: 1, ...registerUserDto })
						),
					},
				},
				{
					provide: getRepositoryToken(User),
					useValue: {},
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should compare the password to the hash when validating a user', async () => {
		const spy = jest.spyOn(service, 'comparePasswords');
		await service.register(registerUserDto);
		const { username, password } = registerUserDto;
		await service.validateUser({ username, password });
		expect(spy).toHaveBeenCalledTimes(1);
	});
});

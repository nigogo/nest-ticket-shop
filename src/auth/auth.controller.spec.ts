import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { registerUserDto } from '../../test/test-data';
import { validate } from 'class-validator';
import { RegisterUserDto } from './dto/register-user.dto';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import fn = jest.fn;

describe('AuthController', () => {
	let controller: AuthController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				PassportModule,
				JwtModule.register({
					secret: 'secret',
					signOptions: { expiresIn: '2m' },
				}),
			],
			controllers: [AuthController],
			providers: [
				LocalStrategy,
				JwtStrategy,
				{
					provide: AuthService,
					useValue: {
						register: fn(() => Promise.resolve({ id: 1, ...registerUserDto })),
						login: fn(() => Promise.resolve({ accessToken: 'token' })),
					},
				},
			],
		}).compile();

		controller = module.get<AuthController>(AuthController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should fail validation for a username that is too short', async () => {
		const user = new RegisterUserDto();
		user.username = 'foo';
		user.password = registerUserDto.password;
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});

	it('should fail validation for a username that is too long', async () => {
		const user = new RegisterUserDto();
		user.username = 'very_cool_username_that_is_too_long';
		user.password = registerUserDto.password;
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});

	it('should fail validation for a username that contains disallowed characters', async () => {
		const user = new RegisterUserDto();
		user.username = '_1337_h4x0r_^_^*';
		user.password = registerUserDto.password;
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});

	it('should fail validation for a password that is too short', async () => {
		const user = new RegisterUserDto();
		user.username = registerUserDto.username;
		user.password = '123';
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});

	it('should fail validation for a password that is too long', async () => {
		const user = new RegisterUserDto();
		user.username = registerUserDto.username;
		user.password =
			'this-is-a-very-long-password-that-should-fail-validation-because-it-is-over-64-characters';
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});

	it('should fail validation for a password that does not contain all necessary characters', async () => {
		const user = new RegisterUserDto();
		user.username = registerUserDto.username;
		user.password = 'password';
		const errors = await validate(user);
		expect(errors).toHaveLength(1);
	});
});

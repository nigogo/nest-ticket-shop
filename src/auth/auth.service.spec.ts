import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { registerUserDto } from '../../test/test-data';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';

describe('AuthService', () => {
	let service: AuthService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				UsersModule,
				JwtModule.register({
					secret: 'secret',
					signOptions: { expiresIn: '2m' },
				}),
			],
			providers: [AuthService],
		})
			// .overrideProvider(PrismaService)
			// .useValue({
			// 	user: mockDeep<PrismaClient['user']>({
			// 		create: jest.fn().mockResolvedValue(userDto),
			// 		findUnique: jest.fn().mockResolvedValue(user),
			// 	}),
			// })
			.compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	it('should compare the password to the hash when validating a user', async () => {
		const spy = jest.spyOn(service, 'comparePasswords');
		// TODO test data
		// await service.register(registerUserDto);
		const { username, password } = registerUserDto;
		await service.validateUser({ username, password });
		expect(spy).toHaveBeenCalledTimes(1);
	});
});

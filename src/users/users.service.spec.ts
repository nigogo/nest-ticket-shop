import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
	let service: UsersService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UsersService],
		})
			// .overrideProvider(PrismaService)
			// .useValue({
			// 	user: mockDeep<PrismaClient['user']>({
			// 		create: jest.fn().mockResolvedValue(userDto),
			// 	}),
			// })
			.compile();

		service = module.get<UsersService>(UsersService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});
});

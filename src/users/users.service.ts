import { Injectable, Logger } from '@nestjs/common';
import { UserInterface } from '../common/interfaces/user.interface';

@Injectable()
export class UsersService {
	logger = new Logger(UsersService.name);

	constructor() {}

	async getUserForInternalUse(username: string): Promise<UserInterface | null> {
		return {
			id: 1,
			username,
			password: 'password',
		};
	}

	async getUser(id: number): Promise<UserInterface> {
		return {
			id,
			username: 'username',
			password: 'password',
		};
	}

	// TODO ORM
	// async getUserForInternalUse(username: string): Promise<User | null> {
	// 	try {
	// 		const user = await this.prisma.user.findUnique({ where: { username } });
	// 		if (user) {
	// 			return {
	// 				id: user.id,
	// 				username: user.username,
	// 				password: user.password,
	// 			};
	// 		}
	// 		return null;
	// 	} catch (e) {
	// 		if (e instanceof Prisma.PrismaClientKnownRequestError) {
	// 			if (e.code === 'P2025') {
	// 				throw new NotFoundException(
	// 					`User with username ${username} not found`
	// 				);
	// 			}
	// 		}
	// 		this.logger.error(e);
	// 		throw e;
	// 	}
	// }

	// TODO ORM
	// async getUser(id: number): Promise<UserDto> {
	// 	try {
	// 		const user = await this.prisma.user.findUnique({ where: { id } });
	// 		return plainToInstance(UserDto, user);
	// 	} catch (e) {
	// 		if (e instanceof Prisma.PrismaClientKnownRequestError) {
	// 			if (e.code === 'P2025') {
	// 				throw new NotFoundException(`User not found`);
	// 			}
	// 		}
	// 		this.logger.error(e);
	// 		throw e;
	// 	}
	// }
}

import { Injectable, Logger } from '@nestjs/common';
import { UserInterface } from '../common/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UserDto } from '../auth/dto/user.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
	logger = new Logger(UsersService.name);

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async getUserForInternalUse(username: string): Promise<UserInterface | null> {
		try {
			const user = await this.usersRepository.findOneBy({ username });
			if (user) {
				return {
					id: user.id,
					username: user.username,
					password: user.password,
				};
			}
			return null;
		} catch (e) {
			// TODO global error handling
			// TODO concise error handling
			this.logger.error(e);
			throw e;
		}
	}

	async createUser({username, password}: { username: string, password: string }): Promise<User> {
		try {
			const user = this.usersRepository.create({
				username,
				password,
			});
			return await this.usersRepository.save(user);
		} catch (e) {
			console.error(JSON.stringify(e, null, 2));
			throw e;
		}
	}

	async getUser(id: number): Promise<UserDto> {
		try {
			const user = await this.usersRepository.findOneOrFail({
				where: { id },
			});
			return plainToInstance(UserDto, user);
		} catch (e) {
			// TODO global error handling
			// TODO concise error handling
			this.logger.error(e);
			throw e;
		}
	}
}

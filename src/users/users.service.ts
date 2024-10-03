import { Injectable, Logger } from '@nestjs/common';
import { UserInterface } from '../common/interfaces/user.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
	logger = new Logger(UsersService.name);

	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async getUserForInternalUse(username: string): Promise<UserInterface | null> {
		const user = await this.usersRepository.findOneBy({ username });
		if (user) {
			return {
				id: user.id,
				username: user.username,
				password: user.password,
				role: user.role,
			};
		}
		return null;
	}
	async createUser({
		username,
		password,
	}: {
		username: string;
		password: string;
	}): Promise<User> {
		const user = this.usersRepository.create({ username, password });
		return await this.usersRepository.save(user);
	}
}

import { Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserInterface } from '../common/interfaces/user.interface';
import { AccessTokenDto } from './dto/access-token.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService
	) {}

	async register({ username, password }: RegisterUserDto): Promise<UserDto> {
		try {
			// TODO ORM
			// const user = await this.prisma.user.create({
			// 	data: {
			// 		username,
			// 		password: await this.hashPassword(password),
			// 	},
			// });
			const user = {
				id: 1,
				username,
				password: await this.hashPassword(password),
			}

			// Note: plainToInstance is used as a safeguard to ensure that no sensitive data is returned
			return plainToInstance(UserDto, user);
		} catch (e) {
			// TODO ORM
			// if (e.code === 'P2002') {
			// 	const message = `User with username '${username}' already exists`;
			// 	this.logger.error(message);
			// 	throw new ConflictException(message);
			// }
			//
			this.logger.error(e);
			throw e;
		}
	}

	async login(user: UserInterface): Promise<AccessTokenDto> {
		const payload: JwtPayload = {
			sub: user.id,
			username: user.username,
			jti: uuidv4(),
		};
		return {
			// TODO use RS256 algorithm
			access_token: this.jwtService.sign(payload),
		};
	}

	async validateUser({
		username,
		password,
	}: LoginUserDto): Promise<UserInterface | null> {
		const user = await this.usersService.getUserForInternalUse(username);
		const isCorrectPassword =
			user?.password && (await this.comparePasswords(password, user?.password));
		if (isCorrectPassword) {
			return {
				id: user.id,
				username: user.username,
			};
		}
		return null;
	}

	// public modifiers for testing purposes, generally this is not recommended
	public async hashPassword(password: string) {
		return bcrypt.hash(password, 10);
	}

	public async comparePasswords(password: string, hash: string) {
		return bcrypt.compare(password, hash);
	}
}

import { UserType } from '../../users/user.entity';

export interface JwtPayload {
	jti: string;
	sub: number;
	username: string;
	role: UserType | undefined;
	exp?: number;
}

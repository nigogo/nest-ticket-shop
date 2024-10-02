import { UserType } from '../../users/user.entity';

export interface UserInterface {
	id: number;
	username: string;
	password?: string;
	role?: UserType | undefined;
}

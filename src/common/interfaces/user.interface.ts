export interface UserInterface {
	id: number;
	username: string;
	password?: string;
	role?: 'user' | 'admin';
}

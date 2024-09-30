import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserInterface } from '../common/interfaces/user.interface';

export enum UserType {
	USER = 'user',
	ADMIN = 'admin',
}

@Entity()
export class User implements UserInterface {
	@PrimaryGeneratedColumn()
	id!: number;

	// unique col username
	@Column({ unique: true })
	username!: string;

	@Column()
	password!: string;

	@Column({
		type: 'enum',
		enum: UserType,
		default: UserType.USER,
	})
	role!: UserType;
}
import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { UserInterface } from '../common/interfaces/user.interface';
import { Ticket } from '../tickets/ticket.entity';

// TODO extract to common
export enum UserType {
	USER = 'user',
	ADMIN = 'admin',
}

@Entity()
export class User implements UserInterface {
	@PrimaryGeneratedColumn()
	id!: number;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updated_at!: Date;

	// TODO consider indexing username
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

	@OneToMany(() => Ticket, (ticket) => ticket.user)
	tickets!: Ticket[];
}
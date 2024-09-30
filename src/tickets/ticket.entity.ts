import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { TicketInterface } from '../common/interfaces/ticket.interface';

@Entity()
export class Ticket implements TicketInterface {
	@PrimaryGeneratedColumn()
	id!: number;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updated_at!: Date;

	@ManyToOne(() => Event, (event) => event.tickets, { nullable: false, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'event_id' })
	event!: Event;

	@ManyToOne(() => User, (user) => user.tickets, { nullable: false, onDelete: 'RESTRICT' })
	@JoinColumn({ name: 'user_id' })
	user!: User;

	@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
	purchase_time!: Date;

	@Column({ type: 'decimal', precision: 6, scale: 2 })
	price_paid!: number;
}
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne, OneToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { EventInterface } from '../common/interfaces/event.interface';
import { Ticket } from '../tickets/ticket.entity';

@Entity()
export class Event implements EventInterface {
	@PrimaryGeneratedColumn()
	id!: number;

	@CreateDateColumn({ type: 'timestamptz' })
	created_at!: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updated_at!: Date;

	@Column()
	name!: string;

	@Column({ type: 'date' })
	date!: Date

	@Column()
	location!: string;

	@Column({ type: 'int', default: 0 })
	total_tickets!: number;

	@Column({ type: 'int', default: 0 })
	available_tickets!: number;

	@Column({ type: 'decimal', precision: 6, scale: 2 })
	ticket_price!: number;

	@OneToMany(() => Ticket, (ticket) => ticket.event)
	tickets!: Ticket[];
}
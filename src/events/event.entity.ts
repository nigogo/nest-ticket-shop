import {
	Column,
	CreateDateColumn,
	Entity,
	OneToMany,
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

	@Column({ type: 'timestamptz' })
	date!: Date;

	@Column()
	location!: string;

	@Column({ type: 'int', default: 0 })
	total_tickets!: number;

	@Column({ type: 'int', default: 0 })
	available_tickets!: number;

	@Column({
		type: 'decimal',
		precision: 6,
		scale: 2,
		transformer: {
			from: (value: string) => parseFloat(value),
			to: (value: number) => value,
		},
	})
	ticket_price!: number;

	@OneToMany(() => Ticket, (ticket) => ticket.event)
	tickets!: Ticket[];
}

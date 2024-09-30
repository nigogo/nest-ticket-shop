import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EventInterface } from '../common/interfaces/event.interface';

@Entity()
export class Event implements EventInterface {
	@PrimaryGeneratedColumn()
	id!: number;

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
}
import { EventInterface } from '../../common/interfaces/event.interface';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

@Expose()
export class EventDto implements EventInterface {
	@ApiProperty()
	id!: number;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	date!: Date;

	@ApiProperty()
	location!: string;

	@ApiProperty()
	total_tickets!: number;

	@ApiProperty()
	available_tickets!: number;

	@ApiProperty()
	ticket_price!: number;
}
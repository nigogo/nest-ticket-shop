import { ApiProperty } from '@nestjs/swagger';

export class TicketDto {
	@ApiProperty()
	id!: number;

	@ApiProperty()
	event_id!: number;

	@ApiProperty()
	user_id!: number;

	@ApiProperty()
	purchase_time!: Date;

	@ApiProperty()
	price_paid!: number;
}
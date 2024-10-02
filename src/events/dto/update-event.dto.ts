import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(
	OmitType(CreateEventDto, ['available_tickets'])
) {
	@ApiProperty({ required: false })
	name?: string;

	@ApiProperty({ type: String, format: 'date-time', required: false })
	date?: string;

	@ApiProperty({ required: false })
	location?: string;

	@ApiProperty({ required: false })
	total_tickets?: number;

	@ApiProperty({ required: false })
	ticket_price?: number;
}

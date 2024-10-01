import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { IsLessThanOrEqualTo } from '../../common/decorators/is-less-than-or-equal-to.decorator';

export class CreateEventDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty()
	@IsISO8601({ strict: true })
	date!: Date;

	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	location!: string;

	@ApiProperty()
	@IsInt()
	@Min(1)
	total_tickets!: number;

	@ApiProperty()
	@IsLessThanOrEqualTo('total_tickets')
	available_tickets!: number;

	@ApiProperty()
	@IsNumber()
	@Min(0)
	ticket_price!: number;
}

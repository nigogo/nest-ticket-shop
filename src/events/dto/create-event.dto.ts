import { ApiProperty } from '@nestjs/swagger';
import {
	IsDate,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
	Max,
	Min,
} from 'class-validator';
import { IsLessThanOrEqualTo } from '../../common/decorators/is-less-than-or-equal-to.decorator';

export class CreateEventDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty()
	@IsDate()
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
	@IsInt()
	@IsLessThanOrEqualTo('total_tickets')
	available_tickets!: number;

	@ApiProperty()
	@Min(0)
	@Max(9999.99)
	@IsNumber({ maxDecimalPlaces: 2 })
	ticket_price!: number;
}

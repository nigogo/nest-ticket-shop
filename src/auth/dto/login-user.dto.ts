import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/* Note: username and password validators are not used here on purpose. We could
potentially have users with old policy password or username that do not conform
to the new policy. */
export class LoginUserDto {
	@IsString()
	@ApiProperty()
	username!: string

	@IsString()
	@ApiProperty()
	password!: string
}

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';

@Module({
	providers: [UsersService],
	controllers: [],
	exports: [UsersService],
})
export class UsersModule {}

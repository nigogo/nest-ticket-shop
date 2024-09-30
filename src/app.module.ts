import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'node:process';

@Module({
	imports: [AuthModule, UsersModule, TypeOrmModule.forRoot({
		type: 'postgres',
		url: process.env.DB_URL,
		entities: [__dirname + '/**/*.entity{.ts,.js}'],
		synchronize: true,
		autoLoadEntities: true,
	})],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}

import { ClassSerializerInterceptor, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import * as process from 'node:process';
import {
	APP_FILTER,
	APP_INTERCEPTOR,
	HttpAdapterHost,
	Reflector,
} from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from '../pino.config';

@Module({
	imports: [
		AuthModule,
		UsersModule,
		EventsModule,
		TicketsModule,
		LoggerModule.forRoot(pinoConfig),
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: process.env.DB_URL,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true,
			autoLoadEntities: true,
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		Logger,
		// TODO cleanup - check if injection is necessary, maybe init in main.ts
		{
			provide: APP_INTERCEPTOR,
			inject: [Reflector],
			useFactory: (reflector: Reflector) => {
				return new ClassSerializerInterceptor(reflector, {
					enableImplicitConversion: true,
					excludeExtraneousValues: true,
				});
			},
		},
		{
			provide: APP_FILTER,
			inject: [HttpAdapterHost],
			useFactory: (httpAdapterHost: HttpAdapterHost) => {
				return new GlobalExceptionFilter(httpAdapterHost);
			},
		},
	],
})
export class AppModule {}

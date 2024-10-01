import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from './events/events.module';
import { TicketsModule } from './tickets/tickets.module';
import * as process from 'node:process';
import { APP_FILTER, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

@Module({
	imports: [
		AuthModule,
		UsersModule,
		TypeOrmModule.forRoot({
			type: 'postgres',
			url: process.env.DB_URL,
			entities: [__dirname + '/**/*.entity{.ts,.js}'],
			synchronize: true,
			autoLoadEntities: true,
		}),
		EventsModule,
		TicketsModule,
	],
	controllers: [AppController],
	providers: [
		AppService,
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
		{ provide: APP_FILTER, useClass: GlobalExceptionFilter },
	],
})
export class AppModule {}

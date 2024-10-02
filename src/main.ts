import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		bufferLogs: true,
	});
	app.useLogger(app.get(Logger));
	app.enableCors({
		origin: 'localhost:3000',
		allowedHeaders: ['Content-Type', 'Authorization'],
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	});
	app.use(helmet());
	app.setGlobalPrefix('api/v1');
	// TODO cleanup - check if injection is necessary, maybe init in main.ts
	// app.useGlobalInterceptors(
	// 	new ClassSerializerInterceptor(app.get(Reflector), {
	// 		enableImplicitConversion: true,
	// 		excludeExtraneousValues: true,
	// 		strategy: 'excludeAll',
	// 	},)
	// );
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		})
	);

	// TODO Note: Disable Swagger in production (it will negatively impact cold start times)
	const config = new DocumentBuilder()
		.setTitle('Ticket Shop')
		.setDescription(
			'A simple ticket shop API that allows users to buy tickets for events and admins to manage events.'
		)
		.setVersion('1.0')
		.addBearerAuth()
		.addSecurityRequirements('bearer')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api/v1', app, document);

	await app.listen(3000);
}

bootstrap();

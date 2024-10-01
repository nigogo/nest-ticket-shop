import {
	ArgumentsHost,
	Catch,
	ExceptionFilter, HttpException,
	HttpStatus,
} from '@nestjs/common';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		let status = 500;
		let message = 'Internal server error';

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			// TODO logging - use pre-defined messages?
			message = exception.getResponse().toString();
		}
		else if (exception instanceof TypeORMError) {
			switch (exception.constructor) {
				case QueryFailedError:
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					if ((exception as any).code === '23505') {
						status = HttpStatus.CONFLICT;
						message = 'Conflict';
					}
					break;
			}
		}

		// TODO logging - rework this to use a logger and a sensible log message
		httpAdapter.reply(
			ctx.getResponse<Response>(),
			{
				statusCode: status,
				message,
			},
			status
		);
	}
}

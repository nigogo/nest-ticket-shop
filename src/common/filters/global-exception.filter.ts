import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from '@nestjs/common';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { request, Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	constructor(private httpAdapterHost: HttpAdapterHost) {}

	catch(exception: Error, host: ArgumentsHost) {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		let status;
		let message;

		if (exception instanceof HttpException) {
			status = exception.getStatus();
			({ message } = exception.getResponse() as any); // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		else if (exception instanceof QueryFailedError) {
			if ((exception as any).code === '23505') { // eslint-disable-line @typescript-eslint/no-explicit-any
				status = HttpStatus.CONFLICT;
				message = (exception as any).detail;// eslint-disable-line @typescript-eslint/no-explicit-any
			}
		}
		else if (exception instanceof EntityNotFoundError) {
			status = HttpStatus.NOT_FOUND;
			message = (exception as any).message; // eslint-disable-line @typescript-eslint/no-explicit-any
		}
		else {
			status = HttpStatus.INTERNAL_SERVER_ERROR;
			message = 'Internal server error';
		}

		this.logger.error(
			message,
			exception.stack,
			`${request.method} ${request.url}`
		);

		httpAdapter.reply(
			ctx.getResponse<Response>(),
			{
				statusCode: status,
				timestamp: new Date().toISOString(),
				path: request.url,
				message,
			},
			status
		);
	}
}

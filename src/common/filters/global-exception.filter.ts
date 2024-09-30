import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { QueryFailedError, TypeORMError } from 'typeorm';
import { Response } from 'express';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost) {
		const { httpAdapter } = this.httpAdapterHost;
		const ctx = host.switchToHttp();

		console.error('[WAAAAAAH]', JSON.stringify(exception, null, 2));

		if (exception instanceof TypeORMError) {
			switch (exception.constructor) {
				case QueryFailedError:
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					if ((exception as any).code === '23505') {
						httpAdapter.reply(ctx.getResponse<Response>(), {
							statusCode: 409,
							message: 'Conflict',
						}, 409);
					}
			}
		}

		httpAdapter.reply(ctx.getResponse<Response>(), {
			statusCode: 500,
			message: 'Internal server error',
		}, 500);
	}
}
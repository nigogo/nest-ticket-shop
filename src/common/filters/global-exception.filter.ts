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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			({ message } = exception.getResponse() as any);
			// message = resMsg;
		} else if (exception instanceof QueryFailedError) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((exception as any).code === '23505') {
				status = HttpStatus.CONFLICT;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				message = (exception as any).detail;
			}
		}
		else if (exception instanceof EntityNotFoundError) {
			status = HttpStatus.NOT_FOUND;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			message = (exception as any).message;
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

		// switch (exception.constructor) {
		// 	case BadRequestException:
		// 		status = HttpStatus.BAD_REQUEST;
		// 		message = (exception as BadRequestException).message;
		// 		break;
		// 	case HttpException:
		// 		status = (exception as HttpException).getStatus();
		// 		message = (exception as HttpException).message;
		// 		break;
		// 	case ValidationError:
		// 		status = HttpStatus.BAD_REQUEST;
		// 		message = (exception as HttpException).message;
		// 		break;
		// 	case QueryFailedError:
		// 		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 		if ((exception as any).code === '23505') {
		// 			status = HttpStatus.CONFLICT;
		// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 			message = (exception as any).message;
		// 		}
		// 		break;
		// 	default:
		// 		status = HttpStatus.INTERNAL_SERVER_ERROR;
		// 		message = 'Internal server error';
		// 		break;
		// }

		// if (exception instanceof HttpException) {
		// 	status = exception.getStatus();
		// 	// TODO logging - use pre-defined messages?
		// 	message = exception.getResponse().toString();
		// }
		// else if (exception instanceof TypeORMError) {
		// 	switch (exception.constructor) {
		// 		case QueryFailedError:
		// 			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		// 			if ((exception as any).code === '23505') {
		// 				status = HttpStatus.CONFLICT;
		// 				message = 'Conflict';
		// 			}
		// 			break;
		// 	}
		// }

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

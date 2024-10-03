import {
	CallHandler,
	ExecutionContext,
	Injectable, Logger,
	NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger(LoggingInterceptor.name);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest();
		const res = context.switchToHttp().getResponse();

		return next.handle().pipe(
			tap((responseBody) => {
				// Note: duplicate EXIT log for logging response body
				this.logger.log({
					message: `EXIT: ${req.method} ${req.url} - ${res.statusCode}`,
					responseBody
				});
			}),
		);
	}
}

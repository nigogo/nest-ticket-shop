import * as process from 'node:process';
import { Params } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';

// Note: Pino logging for development could be improved by using pino-pretty
export const pinoConfig: Params = {
	pinoHttp: {
		level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

		genReqId: (req) => {
			// Generate or get x-tracking-id
			const trackingId = req.headers['x-tracking-id'] || uuidv4();
			req.headers['x-tracking-id'] = trackingId;
			return trackingId;
		},

		// customLogLevel: (res, err) => {
		// 	if (res.statusCode >= 400 && res.statusCode < 500) {
		// 		return 'warn';
		// 	} else if (res.statusCode >= 500 || err) {
		// 		return 'error';
		// 	}
		// 	return 'info';
		// },
		serializers: {
			req(req) {
				return {
					method: req.method,
					url: req.url,
					trackingId: req.headers['x-tracking-id'],
				};
			},
			res(res) {
				return {
					statusCode: res.statusCode,
					trackingId: res.headers['x-tracking-id'],
				};
			},
		},
	},
};
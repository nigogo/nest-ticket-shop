import * as process from 'node:process';
import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';

// Note: Pino logging for development could be improved by using pino-pretty
export const pinoConfig: Params = {
	pinoHttp: {
		level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
		autoLogging: true,	// enables logging of entry and exit logs

		genReqId: (req, res) => {
			const existingID = req.id ?? req.headers["x-tracking-id"]
			if (existingID) return existingID
			const id = randomUUID()
			res.setHeader('x-tracking-id', id)
			return id
		},

		customReceivedMessage: (req) => {
			return `ENTRY ${req.url} (${req.method})`
		},

		customSuccessMessage: (req, res) => {
			return `EXIT ${req.url} (${req.method}) - ${res.statusCode}`
		},

		customProps: (req) => {
			return {
				"x-tracking-id": req.id
			};
		},

		// customSuccessObject: (req, res, val) => {
		// 	return {
		// 		...val,
		// 		res: {
		// 			...val.res,
		// 		}
		// 	};
		// },

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
					// trackingId: req.headers['x-tracking-id'],
				};
			},
			res(res) {
				return {
					statusCode: res.statusCode,
					body: res.body,
					// trackingId: res.headers['x-tracking-id'],
				};
			},
		},
	},
};
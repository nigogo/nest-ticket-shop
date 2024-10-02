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

		serializers: {
			req(req) {
				return {
					method: req.method,
					url: req.url,
				};
			},
			res(res) {
				return {
					// TODO to return a response i need to read the body stream
					// body: "<response body goes here>",
				};
			},
		},
	},
};
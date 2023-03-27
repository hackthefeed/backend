import { authHeadersSchema } from '$/server/shared/schema';

export const sourceSubscribeSchema = {
	description: 'Subscribes to a feed',
	tags: ['feed'],
	headers: authHeadersSchema,
	params: {
		type: 'object',
		properties: {
			sourceId: { type: 'string', format: 'uuid' },
		},
		required: ['sourceId'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const sourceUnsubscribeSchema = {
	description: 'Unsubscribes from a feed',
	tags: ['feed'],
	headers: authHeadersSchema,
	params: {
		type: 'object',
		properties: {
			sourceId: { type: 'string', format: 'uuid' },
		},
		required: ['sourceId'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

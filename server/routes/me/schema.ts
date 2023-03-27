import { authHeadersSchema } from '$/server/shared/schema';

export const feedSchema = {
	description: 'Gets the user\'s feed',
	headers: authHeadersSchema,
	querystring: {
		type: 'object',
		properties: {
			page: { type: 'number', minimum: 1 },
		},
		required: ['page'],
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
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'string' },
							title: { type: 'string' },
							content: { type: 'string' },
							createdAt: { type: 'string' },
							updatedAt: { type: 'string' },
							url: { type: 'string' },
							thumbnail: { type: 'string' },
							notes: {
								type: 'array',
								items: {
									type: 'object',
									properties: {
										content: { type: 'string' },
										id: { type: 'string' },
									},
								},
							},
							source: {
								type: 'object',
								properties: {
									id: { type: 'string' },
									name: { type: 'string' },
								},
							},
							_count: {
								type: 'object',
								properties: {
									comments: { type: 'number' },
								},
							},
						},
					},
				},
			},
		},
	},
};

export const subscriptionsSchema = {
	description: 'Gets all producers and shows if the user is subscribed to them',
	headers: authHeadersSchema,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							id: { type: 'string' },
							name: { type: 'string' },
							subscribed: { type: 'boolean' },
						},
					},
				},
			},
		},
	},
};

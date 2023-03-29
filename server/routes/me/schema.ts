export const feedSchema = {
	description: 'Gets the user\'s feed',
	tags: ['feed'],
	headers: { $ref: 'auth#' },
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
					items: { $ref: 'feedPost#' },
				},
			},
		},
	},
};

export const subscriptionsSchema = {
	description: 'Gets all sources and shows if the user is subscribed to them',
	tags: ['feed'],
	headers: { $ref: 'auth#' },
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

export const microsoftSchema = {
	description: 'Authentication endpoint for Microsoft accounts',
	tags: ['auth'],
	querystring: {
		type: 'object',
		properties: {
			code: { type: 'string' },
		},
		required: ['code'],
	},
	response: {
		200: {
			type: 'object',
			description: 'Successful response, redirects to home page',
		},
		403: {
			type: 'object',
			description: 'Authentication error',
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

export const loginSchema = {
	description: 'Logs in to the specified account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		},
		required: ['username', 'password'],
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
				key: { type: 'string', format: 'uuid' },
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

export const registerSchema = {
	description: 'Registers a new account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			email: { type: 'string' },
			password: { type: 'string' },
		},
		required: ['username', 'email', 'password'],
	},
	response: {
		201: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				user: {
					type: 'object',
					properties: {
						key: { type: 'string', format: 'uuid' },
					},
				},
			},
		},
		400: {
			description: 'Email or username already taken',
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

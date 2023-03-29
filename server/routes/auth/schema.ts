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
		302: {
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
			token: { type: 'string' },
		},
		required: ['username', 'password', 'token'],
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
				data: { type: 'string' },
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
			token: { type: 'string' },
		},
		required: ['username', 'email', 'password', 'token'],
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
				data: { type: 'string' },
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

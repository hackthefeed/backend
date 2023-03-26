import { prisma } from '$/database';
import { server } from '$/server/server';

const meSchema = {
	description: 'Gets the user associated with the key',
	tags: ['auth'],
	querystring: {
		type: 'object',
		properties: {
			key: { type: 'string', format: 'uuid' },
		},
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
					type: 'object',
					properties: {
						id: { type: 'number' },
						username: { type: 'string' },
						displayName: { type: 'string' },
						email: { type: 'string' },
						createdAt: { type: 'string' },
						updatedAt: { type: 'string' },
						producer: {
							type: 'object',
							properties: {
								id: { type: 'number' },
								name: { type: 'string' },
							},
						},
					},
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

const meFeedSchema = {
	description: 'Gets the user\'s feed',
	querystring: {
		type: 'object',
		properties: {
			key: { type: 'string', format: 'uuid' },
			page: { type: 'integer', minimum: 1 },
		},
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
										id: { type: 'number' },
									},
								},
							},
							producer: {
								type: 'object',
								properties: {
									id: { type: 'number' },
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

const meSubscriptionsSchema = {
	description: 'Gets all producers and shows if the user is subscribed to them',
	querystring: {
		type: 'object',
		properties: {
			key: { type: 'string', format: 'uuid' },
		},
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
							id: { type: 'number' },
							name: { type: 'string' },
							subscribed: { type: 'boolean' },
						},
					},
				},
			},
		},
	},
};

type MeSchema = {
	key: string;
	page: number;
}

server.get('/me', { schema: meSchema }, async (request, response) => {
	const query = request.query as MeSchema;

	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
			username: true,
			displayName: true,
			email: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	return {
		success: true,
		data: user,
	};
});

server.get('/me/feed', { schema: meFeedSchema }, async (request, response) => {
	const query = request.query as MeSchema;

	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	const posts = await prisma.post.findMany({
		where: {
			producer: {
				subscribers: {
					some: {
						key: query.key,
					},
				},
			},
		},
		skip: (query.page - 1) * 50,
		take: 50,
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
			updatedAt: true,
			url: true,
			thumbnail: true,
			producer: {
				select: {
					id: true,
					name: true,
				},
			},
			notes: {
				where: {
					author: {
						key: query.key,
					},
				},
				select: {
					content: true,
					id: true,
				},
				orderBy: {
					updatedAt: 'desc',
				},
			},
			_count: {
				select: {
					comments: true,
				},
			},
		},
		orderBy: [
			{
				createdAt: 'desc',
			},
			{
				id: 'desc',
			},
		],
	});

	return {
		success: true,
		data: posts,
	};
});

server.get('/me/subscriptions', { schema: meSubscriptionsSchema }, async (request, response) => {
	const query = request.query as MeSchema;

	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	const producers = await prisma.producer.findMany({
		select: {
			id: true,
			name: true,
			subscribers: {
				where: {
					key: query.key,
				},
				select: {
					id: true,
				},
			},
		},
		orderBy: [
			{
				name: 'asc',
			},
			{
				id: 'asc',
			},
		],
	});

	return {
		success: true,
		data: producers.map(p => ({
			id: p.id,
			name: p.name,
			subscribed: p.subscribers.length > 0,
		})),
	};
});

import { prisma } from '$/database';
import { connections } from '$/server/routes/websocket';
import { server } from '$/server/server';

const feedSubscribeSchema = {
	description: 'Subscribes to a feed',
	tags: ['feed'],
	body: {
		type: 'object',
		properties: {
			producerId: { type: 'number' },
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

const feedUnsubscribeSchema = {
	description: 'Subscribes from a feed',
	tags: ['feed'],
	body: {
		type: 'object',
		properties: {
			producerId: { type: 'number' },
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

type FeedPayload = {
	producerId: number;
	key: string;
}

server.get('/feed/list', {
	schema: {
		description: 'Lists all feeds',
		tags: ['feed'],
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
							},
						},
					},
				},
			},
		},
	},
}, async () => {
	const feeds = await prisma.producer.findMany({
		select: {
			id: true,
			name: true,
		},
	});

	return {
		success: true,
		data: feeds,
	};
});

server.post('/feed/subscribe', { schema: feedSubscribeSchema }, async (request, response) => {
	const body = request.body as FeedPayload;

	// check if a user with the key exists
	const user = await prisma.user.findUnique({
		where: {
			key: body.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	connections.get(user.id)?.join(body.producerId.toString());

	await prisma.producer.update({
		where: {
			id: body.producerId,
		},
		data: {
			subscribers: {
				connect: {
					key: body.key,
				},
			},
		},
	});

	return {
		success: true,
	};
});

server.post('/feed/unsubscribe', { schema: feedUnsubscribeSchema }, async (request, response) => {
	const body = request.body as FeedPayload;

	const user = await prisma.user.findUnique({
		where: {
			key: body.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	connections.get(user.id)?.leave(body.producerId.toString());

	await prisma.producer.update({
		where: {
			id: body.producerId,
		},
		data: {
			subscribers: {
				disconnect: {
					key: body.key,
				},
			},
		},
	});
});

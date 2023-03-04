import { server } from "..";
import { prisma } from "$/database";
import { connections } from './websocket';

const schema = {
	body: {
		type: 'object',
		properties: {
			producerId: { type: 'number' },
			key: { type: 'string' },
		},
	}
};

type FeedPayload = {
	producerId: number;
	key: string;
}

server.post('/feed/subscribe', { schema }, async (request, response) => {
	const body = request.body as FeedPayload;

	// check if a user with the key exists
	const user = await prisma.user.findUnique({
		where: {
			key: body.key,
		},
		select: {
			id: true,
		}
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.'
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
				}
			}
		}
	});

	return {
		success: true,
	}
});


server.post('/feed/unsubscribe', { schema }, async (request, response) => {
	const body = request.body as FeedPayload;

	const user = await prisma.user.findUnique({
		where: {
			key: body.key,
		},
		select: {
			id: true,
		}
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.'
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
					}
				}
			}
	});
});

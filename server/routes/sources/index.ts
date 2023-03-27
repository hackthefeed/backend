import { prisma } from '$/database';
import { connections } from '$/server/routes/ws';
import { server } from '$/server/server';
import { AuthHeaders } from '$/server/shared/schema';

import { sourceSubscribeSchema, sourceUnsubscribeSchema } from './schema';

server.post<{
	Headers: AuthHeaders;
	Params: { sourceId: string };
}>('/sources/:sourceId/subscribe', { schema: sourceSubscribeSchema }, async (request, response) => {
	// check if a user with the key exists
	const user = await prisma.user.findUnique({
		where: {
			key: request.headers.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	connections.get(user.id)?.join(request.params.sourceId);

	await prisma.source.update({
		where: {
			id: request.params.sourceId,
		},
		data: {
			subscribers: {
				connect: {
					key: request.headers.key,
				},
			},
		},
	});

	return {
		success: true,
	};
});

server.post<{
	Headers: AuthHeaders;
	Params: { sourceId: string };
}>('/sources/:sourceId/unsubscribe', { schema: sourceUnsubscribeSchema }, async (request, response) => {
	const user = await prisma.user.findUnique({
		where: {
			key: request.headers.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	connections.get(user.id)?.leave(request.params.sourceId);

	await prisma.source.update({
		where: {
			id: request.params.sourceId,
		},
		data: {
			subscribers: {
				disconnect: {
					key: request.headers.key,
				},
			},
		},
	});

	return {
		success: true,
	};
});

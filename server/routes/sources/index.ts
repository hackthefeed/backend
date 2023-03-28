import { prisma } from '$/database';
import { connections } from '$/server/routes/ws';
import { server } from '$/server/server';

import { sourceSubscribeSchema, sourceUnsubscribeSchema } from './schema';

server.get<{
	Params: { sourceId: string };
}>('/sources/:sourceId/subscribe', {
	schema: sourceSubscribeSchema,
	preHandler: [server.auth],
}, async request => {
	connections.get(request.user.id)?.join(request.params.sourceId);

	await prisma.source.update({
		where: {
			id: request.params.sourceId,
		},
		data: {
			subscribers: {
				connect: {
					id: request.user.id,
				},
			},
		},
	});

	return {
		success: true,
	};
});

server.get<{
	Params: { sourceId: string };
}>('/sources/:sourceId/unsubscribe', {
	schema: sourceUnsubscribeSchema,
	preHandler: [server.auth],
}, async request => {
	connections.get(request.user.id)?.leave(request.params.sourceId);

	await prisma.source.update({
		where: {
			id: request.params.sourceId,
		},
		data: {
			subscribers: {
				disconnect: {
					id: request.user.id,
				},
			},
		},
	});

	return {
		success: true,
	};
});

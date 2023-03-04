import type { Socket } from 'socket.io';

import { prisma } from '$/database';
import { generateFeed } from '$/rss';
import { io } from '$/server/server';

export const connections = new Map<number, Socket>();
// fetch updates every 5 minutes
export const feed = generateFeed(300_000);

io.on('connection', async socket => {
	const key = socket.handshake.query.key;
	if (typeof key !== 'string') return socket.disconnect(true);

	// Check if key is valid
	const user = await prisma.user.findUnique({
		where: {
			key,
		},
		select: {
			id: true,
			subscriptions: {
				select: {
					id: true,
				},
			},
		},
	});

	if (!user) return socket.disconnect(true);

	socket.once('disconnect', () => {
		connections.delete(user.id);
	});

	if (connections.has(user.id)) {
		const other = connections.get(user.id)!;

		other.disconnect(true);
	}

	connections.set(user.id, socket);

	for (const subscription of user.subscriptions) {
		socket.join(subscription.id.toString());
	}
});

export async function process() {
	for await (const post of feed) {
		io.to(post.producerId.toString()).emit('postCreated', post);
	}
}

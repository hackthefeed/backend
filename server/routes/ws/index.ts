import type { Socket } from 'socket.io';

import { prisma } from '$/database';
import { generateFeed } from '$/rss';
import { server } from '$/server/server';

export const connections = new Map<string, Socket>();
// fetch updates every 5 minutes
export const feed = generateFeed(300_000);

export type ExternalPost = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	title: string;
	content: string;
	url: string;
	thumbnail: string | null;
	producer: {
		id: number;
		name: string;
	};
	notes: {
		id: number;
		content: string;
	}[];
};

server.io.on('connection', async socket => {
	const key = socket.handshake.query.key;
	console.log('connecting with key', key);

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
		server.io.to(post.producer.id.toString()).emit('postCreated', post);
	}
}
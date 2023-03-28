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
	source: {
		id: number;
		name: string;
	};
	notes: {
		id: number;
		content: string;
	}[];
};

server.io.on('connection', async socket => {
	const token = socket.handshake.headers.authorization;

	if (typeof token !== 'string') return socket.disconnect(true);

	const payload = server.jwt.verify(token);

	console.log(payload);

	// Check if key is valid
	const user = await prisma.user.findUnique({
		where: {
			id: '',
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
		server.io.to(post.source.id.toString()).emit('postCreated', post);
	}
}

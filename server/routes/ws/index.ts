import type { Socket } from 'socket.io';

import { prisma } from '$/database';
import { generateFeed } from '$/rss';
import { server } from '$/server/server';

export const connections = new Map<string, Socket>();
// fetch updates every 5 minutes
export const feed = generateFeed(300_000);

export type ExternalPost = {
	id: string;
	title: string;
	content: string;
	url: string;
	thumbnail: string | null;
	notes: {
		id: string;
		content: string;
		author: {
			id: string;
			username: string | null;
			displayName: string | null;
		};
	}[];
	source: {
		id: string;
		name: string;
	};
	_count: {
		comments: number;
	};
	createdAt: Date;
	updatedAt: Date;
};

function getUserFromToken(token?: string): { id: string } | null {
	if (typeof token !== 'string' || !token.startsWith('Bearer ')) return null;

	try {
		const payload = server.jwt.verify(token.slice(7));
		return payload as { id: string };
	} catch {
		return null;
	}
}

server.io.on('connection', async socket => {
	const token = socket.handshake.headers.authorization;
	const payload = getUserFromToken(token);

	if (!payload) return socket.disconnect(true);

	// Check if key is valid
	const user = await prisma.user.findUnique({
		where: {
			id: payload.id,
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

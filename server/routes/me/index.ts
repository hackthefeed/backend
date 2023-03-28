import { prisma } from '$/database';
import { server } from '$/server/server';

import { feedSchema, subscriptionsSchema } from './schema';
import { FeedSchemaQuery } from './types';

server.get<{
	Querystring: FeedSchemaQuery;
}>('/me/feed', {
	schema: feedSchema,
	preHandler: [server.auth],
}, async (request) => {
	const posts = await prisma.post.findMany({
		where: {
			source: {
				subscribers: {
					some: {
						id: request.user.id,
					},
				},
			},
		},
		skip: (request.query.page - 1) * 50,
		take: 50,
		select: {
			id: true,
			title: true,
			content: true,
			createdAt: true,
			updatedAt: true,
			url: true,
			thumbnail: true,
			source: {
				select: {
					id: true,
					name: true,
				},
			},
			notes: {
				where: {
					author: {
						id: request.user.id,
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

server.get('/me/subscriptions', {
	schema: subscriptionsSchema,
	preHandler: [server.auth],
}, async request => {
	const subscriptions = await prisma.source.findMany({
		select: {
			id: true,
			name: true,
			subscribers: {
				where: {
					id: request.user.id,
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
		data: subscriptions.map(p => ({
			id: p.id,
			name: p.name,
			subscribed: p.subscribers.length > 0,
		})),
	};
});

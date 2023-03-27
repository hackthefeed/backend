import { prisma } from '$/database';
import { server } from '$/server/server';
import { AuthHeaders } from '$/server/shared/schema';

import { feedSchema, subscriptionsSchema } from './schema';
import { FeedSchemaQuery } from './types';

server.get<{
	Headers: AuthHeaders;
	Querystring: FeedSchemaQuery;
}>('/me/feed', { schema: feedSchema }, async (request, response) => {
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

	const posts = await prisma.post.findMany({
		where: {
			source: {
				subscribers: {
					some: {
						key: request.headers.key,
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
						key: request.headers.key,
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

server.get<{
	Headers: AuthHeaders;
}>('/me/subscriptions', { schema: subscriptionsSchema }, async (request, response) => {
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

	const subscriptions = await prisma.source.findMany({
		select: {
			id: true,
			name: true,
			subscribers: {
				where: {
					key: request.headers.key,
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

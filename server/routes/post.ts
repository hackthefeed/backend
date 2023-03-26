import { prisma } from '$/database';
import { server } from '$/server/server';

const createPostCommentSchema = {
	description: 'Creates a comment on a post',
	tags: ['comment'],
	body: {
		type: 'object',
		properties: {
			postId: { type: 'string' },
			content: { type: 'string' },
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
				data: { type: 'number' },
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

const deletePostCommentSchema = {
	description: 'Deletes a comment on from post',
	tags: ['comment'],
	body: {
		type: 'object',
		properties: {
			postId: { type: 'string' },
			commentId: { type: 'number' },
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

const getCommentsSchema = {
	description: 'Gets all comments on a post',
	tags: ['comment'],
	querystring: {
		type: 'object',
		properties: {
			postId: { type: 'string' },
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
				data: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							content: { type: 'string' },
							author: {
								type: 'object',
								properties: {
									username: { type: 'string' },
									displayName: { type: 'string' },
								},
							},
						},
					},
				},
			},
		},
	},
};

type CreatePostCommnentSchema = {
	postId: string;
	content: string;
	key: string;
}

server.get('/post/comments', { schema: getCommentsSchema }, async request => {
	const query = request.query as { postId: string };

	const comments = await prisma.comment.findMany({
		where: {
			postId: query.postId,
		},
		select: {
			content: true,
			author: {
				select: {
					username: true,
					displayName: true,
				},
			},
		},
		orderBy: [
			{
				updatedAt: 'desc',
			},
			{
				id: 'asc',
			},
		],
	});

	return {
		success: true,
		data: comments,
	};
});

server.post('/post/comment', { schema: createPostCommentSchema }, async (request, response) => {
	const query = request.body as CreatePostCommnentSchema;
	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	try {
		const comment = await prisma.comment.create({
			data: {
				content: query.content,
				post: {
					connect: {
						id: query.postId,
					},
				},
				author: {
					connect: {
						id: user.id,
					},
				},
			},
			select: {
				id: true,
			},
		});

		return response.status(200).send({
			success: true,
			data: comment.id,
		});
	} catch {
		return response.status(404).send({
			success: false,
			message: 'Unknown postId.',
		});
	}
});

type DeletePostCommentSchema = {
	postId: string;
	commentId: number;
	key: string;
}

server.delete('/post/comment', { schema: deletePostCommentSchema }, async (request, response) => {
	const query = request.body as DeletePostCommentSchema;
	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	try {
		await prisma.comment.delete({
			where: {
				id: query.commentId,
			},
		});

		return response.status(200).send({
			success: true,
		});
	} catch {
		return response.status(404).send({
			success: false,
			message: 'Unknown postId or commentId.',
		});
	}
});

import { prisma } from '$/database';
import { server } from '$/server/server';

import { createNoteSchema, createPostCommentSchema, deleteNoteSchema, deletePostCommentSchema, postCommentsSchema, viewPostSchema } from './schema';
import { CreateNoteSchemaBody, CreatePostCommnentSchema } from './types';

server.get<{
	Params: { postId: string };
}>('/posts/:postId', { schema: viewPostSchema }, async (request, response) => {
	const post = await prisma.post.findUnique({
		where: {
			id: request.params.postId,
		},
		select: {
			id: true,
			title: true,
			content: true,
			url: true,
			thumbnail: true,
			updatedAt: true,
			createdAt: true,
			source: {
				select: {
					id: true,
					name: true,
				},
			},
			comments: {
				select: {
					id: true,
					content: true,
					author: {
						select: {
							id: true,
							username: true,
							displayName: true,
						},
					},
					createdAt: true,
					updatedAt: true,
				},
				orderBy: [
					{
						updatedAt: 'desc',
					},
					{
						id: 'desc',
					},
				],
			},
		},
	});

	if (post === null) return response.status(404).send({
		message: 'Unknown postId.',
		success: false,
	});

	return {
		success: true,
		data: post,
	};
});

server.post<{
	Body: CreateNoteSchemaBody;
	Params: { postId: string };
}>('/posts/:postId/notes', {
	schema: createNoteSchema,
	preHandler: [server.auth],
}, async (request, response) => {
	try {
		const note = await prisma.note.create({
			data: {
				content: request.body.content,
				author: {
					connect: {
						id: request.user.id,
					},
				},
				post: {
					connect: {
						id: request.params.postId,
					},
				},
			},
			select: {
				id: true,
			},
		});

		return {
			success: true,
			message: 'Note created successfully.',
			data: note.id,
		};
	} catch {
		return response.status(400).send({
			message: 'Unknown post identification number.',
			success: false,
		});
	}
});

server.delete<{
	Params: { postId: string; noteId: string };
}>('/posts/:postId/notes/:noteId', {
	schema: deleteNoteSchema,
	preHandler: [server.auth],
}, async (request, response) => {
	const updated = await prisma.note.deleteMany({
		where: {
			id: request.params.noteId,
			postId: request.params.postId,
			authorId: request.user.id,
		},
	});

	if (updated.count === 0) return response.status(400).send({
		message: 'Unknown noteId or postId.',
		success: false,
	});

	return {
		success: true,
	};
});

server.get<{
	Params: { postId: string };
}>('/posts/:postId/comments', { schema: postCommentsSchema }, async request => {
	const comments = await prisma.comment.findMany({
		where: {
			postId: request.params.postId,
		},
		select: {
			id: true,
			content: true,
			author: {
				select: {
					id: true,
					username: true,
					displayName: true,
				},
			},
			createdAt: true,
			updatedAt: true,
		},
		orderBy: [
			{
				updatedAt: 'desc',
			},
			{
				id: 'desc',
			},
		],
	});

	return {
		success: true,
		data: comments,
	};
});

server.post<{
	Body: CreatePostCommnentSchema;
	Params: { postId: string };
}>('/posts/:postId/comments', {
	schema: createPostCommentSchema,
	preHandler: [server.auth],
}, async (request, response) => {
	try {
		const comment = await prisma.comment.create({
			data: {
				content: request.body.content,
				post: {
					connect: {
						id: request.params.postId,
					},
				},
				author: {
					connect: {
						id: request.user.id,
					},
				},
			},
			select: {
				id: true,
				content: true,
				author: {
					select: {
						id: true,
						username: true,
						displayName: true,
					},
				},
			},
		});

		return response.status(200).send({
			success: true,
			data: comment,
		});
	} catch {
		return response.status(404).send({
			success: false,
			message: 'Unknown postId.',
		});
	}
});

server.delete<{
	Params: { postId: string; commentId: string };
}>('/posts/:postId/comments/:commentId', {
	schema: deletePostCommentSchema,
	preHandler: [server.auth],
}, async (request, response) => {
	const updated = await prisma.comment.deleteMany({
		where: {
			id: request.params.commentId,
			authorId: request.user.id,
		},
	});

	if (updated.count === 0) return response.status(404).send({
		success: false,
		message: 'Unknown postId or commentId.',
	});

	return response.status(200).send({
		success: true,
	});
});

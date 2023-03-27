import { prisma } from '$/database';
import { server } from '$/server/server';
import { AuthHeaders } from '$/server/shared/schema';

import { createNoteSchema, createPostCommentSchema, deleteNoteSchema, deletePostCommentSchema, postCommentsSchema } from './schema';
import { CreateNoteSchemaBody, CreatePostCommnentSchema } from './types';

server.post<{
	Body: CreateNoteSchemaBody;
	Headers: AuthHeaders;
	Params: { postId: string };
}>('/posts/:postId/notes', { schema: createNoteSchema }, async (request, response) => {
	const user = await prisma.user.findUnique({
		where: {
			key: request.headers.key,
		},
	});

	if (user === null) return response.status(401).send({
		message: 'Invalid authentication key.',
		success: false,
	});

	try {
		const note = await prisma.note.create({
			data: {
				content: request.body.content,
				author: {
					connect: {
						id: user.id,
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
	Headers: AuthHeaders;
	Params: { postId: string; noteId: string };
}>('/posts/:postId/notes/:noteId', { schema: deleteNoteSchema }, async (request, response) => {
	const user = await prisma.user.findUnique({
		where: {
			key: request.headers.key,
		},
	});

	if (user === null) return response.status(401).send({
		message: 'Invalid authentication key.',
		success: false,
	});

	const updated = await prisma.note.deleteMany({
		where: {
			id: request.params.noteId,
			postId: request.params.postId,
			authorId: user.id,
		},
	});

	if (updated.count === 0) return response.status(400).send({
		message: 'Unknown noteId or postId.',
		success: false,
	});

	return {
		success: true,
		message: 'Note deleted successfully.',
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

server.post<{
	Body: CreatePostCommnentSchema;
	Headers: AuthHeaders;
	Params: { postId: string };
}>('/posts/:postId/comments', { schema: createPostCommentSchema }, async (request, response) => {
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
						id: user.id,
					},
				},
			},
			select: {
				id: true,
				content: true,
				author: {
					select: {
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
	Headers: AuthHeaders;
	Params: { postId: string; commentId: string };
}>('/posts/:postId/comments/:commentId', { schema: deletePostCommentSchema }, async (request, response) => {
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

	try {
		await prisma.comment.delete({
			where: {
				id: request.params.commentId,
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

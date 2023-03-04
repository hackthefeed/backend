import { prisma } from '$/database';
import { server } from '$/server/server';

const createNoteSchema = {
	description: 'Creates a note on a post',
	tags: ['note'],
	body: {
		type: 'object',
		properties: {
			postId: { type: 'string' },
			content: { type: 'string' },
			key: { type: 'string' },
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
				message: { type: 'string' },
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

const deleteNoteSchema = {
	description: 'Deletes a note on from post',
	tags: ['note'],
	body: {
		type: 'object',
		properties: {
			postId: { type: 'string' },
			noteId: { type: 'number' },
			key: { type: 'string' },
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
				message: { type: 'string' },
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
		400: {
			description: 'Unknown noteId or postId',
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

type CreateNoteSchema = {
	postId: string;
	content: string;
	key: string;
}

type DeleteNoteSchema = {
	postId: string;
	noteId: number;
	key: string;
}

// post = from the rss feed
// note = from a user
server.post('/post/note', { schema: createNoteSchema }, async (request, response) => {
	const { postId, content, key } = request.body as CreateNoteSchema;

	const user = await prisma.user.findUnique({
		where: {
			key,
		},
	});

	if (user === null) return response.status(401).send({
		message: 'Invalid authentication key.',
		success: false,
	});

	try {
		await prisma.note.create({
			data: {
				content,
				author: {
					connect: {
						id: user.id,
					},
				},
				post: {
					connect: {
						id: postId,
					},
				},
			},
		});

		return {
			success: true,
			message: 'Note created successfully.',
		};
	} catch {
		return response.status(400).send({
			message: 'Unknown post identification number.',
			success: false,
		});
	}
});

server.delete('/post/note', { schema: deleteNoteSchema }, async (request, response) => {
	const { postId, noteId, key } = request.body as DeleteNoteSchema;

	const user = await prisma.user.findUnique({
		where: {
			key,
		},
	});

	if (user === null) return response.status(401).send({
		message: 'Invalid authentication key.',
		success: false,
	});

	const updated = await prisma.note.deleteMany({
		where: {
			id: noteId,
			postId: postId,
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

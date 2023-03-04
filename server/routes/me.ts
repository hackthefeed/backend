import { prisma } from '$/database';
import { server } from '$/server/server';

const meSchema = {
	description: 'Gets the user associated with the key',
	tags: ['auth'],
	querystring: {
		type: 'object',
		properties: {
			key: { type: 'string' },
		},
	},
};

type MeSchema = {
	key: string;
}

server.get('/me', { schema: meSchema }, async (request, response) => {
	const query = request.query as MeSchema;

	const user = await prisma.user.findUnique({
		where: {
			key: query.key,
		},
		select: {
			id: true,
			username: true,
			displayName: true,
			email: true,
			createdAt: true,
			updatedAt: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid authentication key.',
	});

	return {
		success: true,
		data: user,
	};
});

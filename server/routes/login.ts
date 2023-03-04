import { prisma } from '$/database';
import { server } from '$/server/server';
import { createPasswordHash } from '$/server/util';

const loginSchema = {
	description: 'Logs in to the specified account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			password: { type: 'string' },
		},
	},
};

type LoginSchema = {
	username: string;
	password: string;
}

server.post('/login', { schema: loginSchema }, async (request, response) => {
	const payload = request.body as LoginSchema;
	const userWithSalt = await prisma.user.findFirst({
		where: {
			OR: [
				{
					username: payload.username,
				},
				{
					email: payload.username,
				},
			],
		},
		select: {
			email: true,
		},
	});

	if (userWithSalt === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	const hash = createPasswordHash(payload.password, userWithSalt.email);

	const user = await prisma.user.findFirst({
		where: {
			OR: [
				{
					username: payload.username,
				},
				{
					email: payload.username,
				},
			],
			password: hash,
		},
		select: {
			key: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	return {
		success: true,
		key: user.key,
	};
});

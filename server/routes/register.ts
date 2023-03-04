import { prisma } from '$/database';
import { server } from '$/server/server';
import { createPasswordHash } from '$/server/util';

const registerSchema = {
	description: 'Registers a new account',
	tags: ['auth'],
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			email: { type: 'string' },
			password: { type: 'string' },
		},
	},
	response: {
		201: {
			type: 'object',
			properties: {
				success: true,
				user: {
					type: 'object',
					properties: {
						key: { type: 'string' },
					},
				},
			},
		},
		400: {
			type: 'object',
			properties: {
				success: false,
				message: { type: 'string' },
			},
		},
	},
};

type RegisterSchema = {
	username: string;
	email: string;
	password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Not a great implementation, but it's a good enough one for now.
function validEmail(email: string) {
	return EMAIL_REGEX.test(email);
}

server.post('/register', { schema: registerSchema }, async (request, response) => {
	const payload = request.body as RegisterSchema;

	if (!validEmail(payload.email)) return response.status(400).send({
		message: 'Invalid email.',
		success: false,
	});

	const hash = createPasswordHash(payload.password, payload.email.toLowerCase());

	try {
		const user = await prisma.user.create({
			data: {
				username: payload.username.toLowerCase(),
				email: payload.email.toLowerCase(),
				password: hash,
			},
			select: {
				key: true,
			},
		});

		return response.status(201).send({
			message: 'User created successfully.',
			success: true,
			user,
		});
	} catch {
		return response.status(400).send({
			message: 'Email or username is already in use.',
			success: false,
		});
	}
});

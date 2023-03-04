import { server } from "..";
import { prisma } from "$/database";
import { createPasswordHash } from "../util";

const registerSchema = {
	body: {
		type: 'object',
		properties: {
			username: { type: 'string' },
			email: { type: 'string' },
			password: { type: 'string' },
		}
	}
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

	const hash = createPasswordHash(payload.password);

	try {
		const user = await prisma.user.create({
			data: {
				username: payload.username,
				email: payload.email,
				password: hash,
			},
			select: {
				key: true,
			}
		});

		return response.status(201).send({
			message: 'User created successfully.',
			success: true,
			user,
		});
	} catch {
		return response.status(400).send({
			message: 'Email or username is already in use.',
			success: false
		});
	}
});

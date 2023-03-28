import jwt from '@fastify/jwt';
import type { FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module '@fastify/jwt' {
	export interface FastifyJWT {
		// uuidv4 of user
		payload: {
			id: string;
		};
		// bare minimum user info
		user: {
			id: string;
		};
	}
}

declare module 'fastify' {
	export interface FastifyInstance {
		auth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
}

export default fp(async function (fastify) {
	await fastify.register(jwt, {
		secret: process.env.AUTH_SECRET!,
	});

	fastify.decorate('auth', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.send({
				success: false,
				message: 'Authentication error.',
			});
		}
	});
});

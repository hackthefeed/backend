import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import fastify from 'fastify';
import socket from 'fastify-socket.io';

export const server = fastify();

server.register(socket, {
	path: '/ws',
	cors: {
		origin: true,
	},
});

server.register(swagger, {
	swagger: {
		info: {
			title: 'HackTheFeed',
			description: 'HackTheFeed API documentation',
			version: '0.1.0',
		},
		consumes: ['application/json'],
		produces: ['application/json'],
	},
});

server.register(swaggerUi, {
	routePrefix: '/docs',
	uiConfig: {
		docExpansion: 'full',
		deepLinking: false,
	},
	uiHooks: {
		onRequest: function (request, reply, next) { next(); },
		preHandler: function (request, reply, next) { next(); },
	},
	staticCSP: true,
	transformStaticCSP: (header) => header,
	transformSpecification: (swaggerObject) => { return swaggerObject; },
	transformSpecificationClone: true,
});

server.register(cors, {
	origin: true,
});

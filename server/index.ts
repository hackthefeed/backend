// import routes so they register routes
import 'dotenv/config';

import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import { httpServer, server } from '$/server/server';

async function main() {
	server.get('/', async () => {
		return {
			name: 'HackTheFeed API',
			version: '0.1.0',
		};
	});

	await server.register(cors, {
		origin: '*',
	});

	await server.register(swagger, {
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

	await server.register(swaggerUi, {
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

	await import('./routes/register');
	await import('./routes/login');
	await import('./routes/feed');
	await import('./routes/auth');
	await import('./routes/me');
	const { process } = await import('./routes/websocket');

	httpServer.listen(8082);

	const api = await server.listen({
		host: '0.0.0.0',
		port: 8081,
	});

	console.log(`Listening at ${api} and 0.0.0.0:8082`);

	// process feed updates
	process();
}

main();

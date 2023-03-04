import fastify from 'fastify';
import cors from '@fastify/cors'
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import { process } from './routes/websocket';

// import routes so they register routes
import './routes/register';
import './routes/login';
import './routes/feed';

const httpServer = createServer();

export const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

export const server = fastify();

server.get('/', async (request, response) => {
	return 'yo hello hi';
});

async function main() {
	await server.register(cors, {
		origin: '*',
	});

	httpServer.listen(8081);

	const api = await server.listen({
		host: '0.0.0.0',
		port: 8080,
	});

	console.log(`Listening at ${api} and 0.0.0.0:8081`);

	// process feed updates
	process();
}

main();

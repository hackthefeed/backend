// import routes so they register routes
import './routes/register';
import './routes/login';
import './routes/feed';

import { createServer } from 'node:http';

import cors from '@fastify/cors';
import fastify from 'fastify';
import { Server } from 'socket.io';

import { process } from './routes/websocket';

const httpServer = createServer();

export const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

export const server = fastify();

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

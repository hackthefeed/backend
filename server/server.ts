import { createServer } from 'node:http';

import fastify from 'fastify';
import { Server } from 'socket.io';

export const httpServer = createServer();

export const io = new Server(httpServer, {
	cors: {
		origin: '*',
	},
});

export const server = fastify();

// import routes so they register routes
import './routes/register';
import './routes/login';
import './routes/feed';

import cors from '@fastify/cors';

import { process } from './routes/websocket';
import { httpServer, server } from './server';

async function main() {
	await server.register(cors, {
		origin: '*',
	});

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

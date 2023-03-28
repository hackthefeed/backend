// import routes so they register routes
import 'dotenv/config';
import '$/server/routes';

import { process } from '$/server/routes/ws';
import { server } from '$/server/server';

async function main() {
	const api = await server.listen({
		host: '0.0.0.0',
		port: 8081,
	});

	console.log(`Listening at ${api}`);

	// process feed updates
	process();
}

main();

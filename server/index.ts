// import routes so they register routes
import 'dotenv/config';
import '$/routes';

import { process } from '$/server/routes/ws';
import { server } from '$/server/server';

const api = await server.listen({
	host: '0.0.0.0',
	port: 8081,
});

console.log(`Listening at ${api} and 0.0.0.0:8082`);

// process feed updates
process();

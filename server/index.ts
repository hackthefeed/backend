import fastify from 'fastify';

const server = fastify();

async function main() {
	const root = await server.listen({
		host: '0.0.0.0',
		port: 8080,
	});

	console.log(`Listening at ${root}`);
}

main();

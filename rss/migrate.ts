import fs from 'fs/promises';

import { prisma } from '../database';

type RawFeed = {
	name: string;
	url: string;
}

async function main() {
	const feed: RawFeed[] = JSON.parse(await fs.readFile('./data/feeds.json', 'utf8'));

	const response = await prisma.producer.createMany({
		skipDuplicates: true,
		data: feed.map((f) => ({
			name: f.name,
			feedUrl: f.url,
			website: f.url,
		})),
	});

	console.log(`Created ${response.count} feeds.`);
}

main();

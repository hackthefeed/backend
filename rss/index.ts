// scrape rss feed and store in database
// run every few minutes
// add function to add new rss feeds to database

import axios from 'axios';
import { Producer } from '@prisma/client';
import { prisma } from '../database';

export function getActiveFeeds(connected: number[]) {
	const feeds = prisma.producer.findMany({
		where: {
			subscribers: {
				some: {
					id: {
						in: connected
					}
				}
			}
		}
	});

	return feeds;
}

export function getAllFeeds() {
	const feeds = prisma.producer.findMany();

	return feeds;
}

export async function updateFeed(feed: Producer) {
	const data = await axios.get(feed.feedUrl);

	console.log(data);
	process.exit();
}

async function main() {
	const feeds = await getAllFeeds();

	for (const feed of feeds) {
		await updateFeed(feed);
	}
}

main();
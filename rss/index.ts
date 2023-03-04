// scrape rss feed and store in database
// run every few minutes
// add function to add new rss feeds to database

import axios from 'axios';
import { Producer } from '@prisma/client';
import { prisma } from '../database';
import { parse } from './parse';
import { sleep } from './util';

export type FeedItem = {
	title: string;
	description: string;
	link: string;
	pubDate: string;
	guid: string;
}

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
	const response = await axios.get(feed.feedUrl).catch(err => {
		console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl}): `, err);
	});

	if (!response) return;

	const xml = parse(response.data);
	const items = xml.rss.channel.item;

	for (const item of items) {
		const data = await prisma.producer.upsert({
			where: {
				id
			}
		})
	}
}

async function main() {
	const feeds = await getAllFeeds();
	let lastUpdate = Date.now();

	for (;;) {
		for (const feed of feeds) {
			console.log(`Updating feed "${feed.name}" (${feed.feedUrl})...`);

			await updateFeed(feed);
		}

		const now = Date.now();
		const elapsed = now - lastUpdate;
		const wait = 1000 * 60 * 5 - elapsed;

		if (wait > 0) {
			await sleep(wait);
		}
	}
}

main();
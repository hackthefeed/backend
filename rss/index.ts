import { Producer } from '@prisma/client';
import axios from 'axios';

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
						in: connected,
					},
				},
			},
		},
	});

	return feeds;
}

export function getAllFeeds() {
	const feeds = prisma.producer.findMany();

	return feeds;
}

export async function* updateFeed(feed: Producer) {
	const response = await axios.get(feed.feedUrl).catch(err => {
		console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl}): `, err);
	});

	if (!response) return;

	try {
		const xml = parse(response.data);
		const items: FeedItem[] = xml.rss.channel.item;

		for (const item of items) {
			const post = await prisma.post.create({
				data: {
					id: item.guid,
					title: item.title,
					content: item.description,
					createdAt: new Date(item.pubDate),
					producer: {
						connect: {
							id: feed.id,
						},
					},
				},
			}).catch(() => null);

			// if it exists, we've already sent the update
			if (post === null) continue;

			yield post;
		}
	} catch (err) {
		console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl}): `, err);
	}
}

export async function *generateFeed(delayMs = 300_000) {
	const feeds = await getAllFeeds();
	const lastUpdate = Date.now();

	for (;;) {
		for (const feed of feeds) {
			console.log(`Updating feed "${feed.name}" (${feed.feedUrl})...`);

			yield* updateFeed(feed);
		}

		const now = Date.now();
		const elapsed = now - lastUpdate;
		const wait = delayMs - elapsed;

		if (wait > 0) {
			await sleep(wait);
		}
	}
}

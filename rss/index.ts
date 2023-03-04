import axios from 'axios';
import { Post, Producer } from '@prisma/client';
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

export async function updateFeed(feed: Producer, callback: (post: Post) => void) {
	const response = await axios.get(feed.feedUrl).catch(err => {
		console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl}): `, err);
	});

	if (!response) return;

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
						id: feed.id
					}
				}
			}
		}).catch(() => null);

		// if it exists, we've already sent the update
		if (post === null) continue;

		callback(post);
	}
}

export async function generateFeed(delayMs: number = 300_000, callback: (post: Post) => void) {
	const feeds = await getAllFeeds();
	let lastUpdate = Date.now();

	for (;;) {
		for (const feed of feeds) {
			console.log(`Updating feed "${feed.name}" (${feed.feedUrl})...`);

			await updateFeed(feed, callback);
		}

		const now = Date.now();
		const elapsed = now - lastUpdate;
		const wait = delayMs - elapsed;

		if (wait > 0) {
			await sleep(wait);
		}
	}
}

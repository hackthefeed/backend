import { Producer } from '@prisma/client';
import axios, { AxiosError } from 'axios';

import { prisma } from '$/database';
import { parse } from '$/rss/parse';
import { sleep } from '$/rss/util';
import type { ExternalPost } from '$/server/routes/websocket';

export type FeedItem = {
	title: string;
	description: string;
	link: string;
	pubDate: string;
	guid: string | {
		'#text': string;
	};
	'content:encoded'?: string;
	'media:thumbnail'?: {
		'@_url'?: string;
	}
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

export async function* updateFeed(feed: Producer): AsyncGenerator<ExternalPost, void, unknown> {
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
					id: typeof item.guid === 'string' ? item.guid : item.guid['#text'],
					title: item.title,
					content: item.description ?? item['content:encoded'],
					createdAt: new Date(item.pubDate),
					url: item.link,
					thumbnail: item?.['media:thumbnail']?.['@_url'],
					producer: {
						connect: {
							id: feed.id,
						},
					},
				},
				select: {
					id: true,
					title: true,
					content: true,
					createdAt: true,
					updatedAt: true,
					url: true,
					thumbnail: true,
					producer: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			}).catch(() => null) as ExternalPost | null;

			// if it exists, we've already sent the update
			if (post === null) continue;

			// Overwrite the notes to be empty since they will not exist
			// on new entries
			post.notes = [];

			yield post;
		}
	} catch (err) {
		if (err instanceof AxiosError) {
			console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl}): `, err.message);
		} else {
			console.error(`Error parsing feed "${feed.name}" (${feed.feedUrl})`);
		}
	}
}

export async function* generateFeed(delayMs = 300_000) {
	const feeds = await getAllFeeds();
	const lastUpdate = Date.now();

	for (; ;) {
		for (const feed of feeds) {
			// console.log(`Updating feed "${feed.name}" (${feed.feedUrl})...`);

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

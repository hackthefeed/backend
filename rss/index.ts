import { Source } from '@prisma/client';
import axios from 'axios';

import { prisma } from '$/database';
import { sanitize } from '$/rss/clean';
import { parse } from '$/rss/parse';
import { sleep } from '$/rss/util';
import type { ExternalPost } from '$/server/routes/ws';

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

export function getActiveFeeds(connected: string[]) {
	const feeds = prisma.source.findMany({
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
	const feeds = prisma.source.findMany();

	return feeds;
}

export async function* updateFeed(feed: Source): AsyncGenerator<ExternalPost, void, unknown> {
	const response = await axios.get(feed.feed).catch(() => {
		console.error(`Error parsing feed "${feed.name}" (${feed.feed})`);
	});

	if (!response) return;

	try {
		const xml = parse(response.data);
		const items: FeedItem[] = xml.rss.channel.item;

		for (const item of items) {
			const post = await prisma.post.create({
				data: {
					uid: typeof item.guid === 'string' ? item.guid : item.guid?.['#text'] ?? item.link,
					title: sanitize(item.title),
					content: sanitize(item.description ?? item['content:encoded']),
					createdAt: new Date(item.pubDate),
					url: item.link,
					thumbnail: item?.['media:thumbnail']?.['@_url'],
					source: {
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
					source: {
						select: {
							id: true,
							name: true,
						},
					},
					notes: {
						select: {
							id: true,
							createdAt: true,
							updatedAt: true,
							content: true,
							author: {
								select: {
									id: true,
									username: true,
									displayName: true,
								},
							},
						},
						take: 0,
					},
					_count: {
						select: {
							comments: true,
						},
					},
				},
			}).catch(() => null);

			// if it exists, we've already sent the update
			if (post === null) continue;

			yield post;
		}
	} catch (err) {
		console.error(`Error parsing feed "${feed.name}" (${feed.feed})`);
	}
}

export async function* generateFeed(delayMs = 300_000) {
	const feeds = await getAllFeeds();
	const lastUpdate = Date.now();

	for (; ;) {
		for (const feed of feeds) {
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

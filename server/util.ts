import 'dotenv/config';

import { createHmac } from 'node:crypto';
import { Readable } from 'node:stream';

import { Post, Source } from '@prisma/client';
import { Configuration, OpenAIApi } from 'openai';

export type PostWithSource = Pick<Post, 'title' | 'content'> & {
	source: Pick<Source, 'name'>;
};

export type ChatCompletionChoice = {
	delta: {
		content: string;
		role?: string;
	};
	index: number;
	finish_reason: null;
} | {
	delta: {
		role: string;
		content?: string;
	};
	index: number;
	finish_reason: null;
} | {
	delta: object;
	index: number;
	finish_reason: 'stop';
}

export type ChatCompletionChunk = {
	id: string;
	choices: ChatCompletionChoice[];
}

export const openai = new OpenAIApi(new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
}));

export const INSIGHT_PROMPT = `Title: {title}
Publisher: {source}

{content}`;

export function createPasswordHash(password: string, salt: string) {
	return createHmac('sha512', salt).update(password).digest('hex').toString();
}

export function replace(template: string, data: Record<string, string>) {
	return template.replace(/{(\w+)}/g, (_, key) => data[key]);
}

export async function* parseInsightStream(stream: Readable) {
	for await (const chunk of stream) {
		const raw = chunk.toString();

		for (const data of raw.split('\n')) {
			if (data === 'data: [DONE]') return;
			if (!data.startsWith('data: ')) continue;

			const sliced = data.slice(6);
			const json: ChatCompletionChunk = JSON.parse(sliced);

			if (json.choices[0].finish_reason === 'stop') return;
			if (json.choices[0].delta.content === undefined) continue;

			yield sliced;
			yield '\n';
		}
	}
}

export async function createInsight(post: PostWithSource) {
	const completion = await openai.createChatCompletion({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content: 'Write something insightful about the current state of cyber-security, its impacts, and some key points using the article provided. Please keep it short and concise.',
			},
			{
				role: 'user',
				content: replace(INSIGHT_PROMPT, {
					title: post.title,
					source: post.source.name,
					content: post.content,
				}),
			},
		],
		n: 1,
		stream: true,
	}, {
		responseType: 'stream',
	});

	const stream = completion.data as unknown as Readable;
	const chat = parseInsightStream(stream);

	const out = new Readable({
		read() {
			chat.next().then(({ value, done }) => {
				if (done) return this.push(null);

				this.push(value);
			});
		},
	});

	return out;
}

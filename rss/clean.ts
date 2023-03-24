import sanitizeHtml from 'sanitize-html';

import { prisma } from '$/database';

async function main() {
	const posts = await prisma.post.findMany({});

	for (const [i, post] of posts.entries()) {
		await prisma.post.update({
			where: {
				id: post.id,
			},
			data: {
				content: sanitizeHtml(post.content, {
					allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
					allowedAttributes: {
						'a': ['href'],
					},
				}),
				title: sanitizeHtml(post.title, {
					allowedTags: ['b', 'i', 'em', 'strong', 'a', 'br'],
					allowedAttributes: {
						'a': ['href'],
					},
				}),
			},
		});

		console.log(`[${i}/${posts.length}] Updated post ${post.id}`);
	}
}

main();

import { server } from '$/server/server';

server.addSchema({
	$id: 'auth',
	type: 'object',
	properties: {
		authorization: { type: 'string' },
	},
});

server.addSchema({
	$id: 'user',
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		username: { type: 'string' },
		displayName: { type: 'string' },
	},
	required: ['id'],
});

server.addSchema({
	$id: 'note',
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		content: { type: 'string' },
		author: { $ref: 'user#' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
});

server.addSchema({
	$id: 'comment',
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		content: { type: 'string' },
		author: { $ref: 'user#' },
		parentId: {
			oneOf: [
				{ type: 'string', format: 'uuid' },
				{ type: 'null' },
			],
		},
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
	required: ['content'],
});

server.addSchema({
	$id: 'post',
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		title: { type: 'string' },
		content: { type: 'string' },
		url: { type: 'string' },
		thumbnail: { type: 'string' },
		comments: {
			type: 'array',
			items: { $ref: 'comment#' },
		},
		source: {
			type: 'object',
			properties: {
				id: { type: 'string', format: 'uuid' },
				name: { type: 'string' },
			},
		},
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
	required: [
		'id',
		'title',
		'content',
		'url',
		'comments',
		'source',
		'createdAt',
		'updatedAt',
	],
});

server.addSchema({
	$id: 'feedPost',
	type: 'object',
	properties: {
		id: { type: 'string', format: 'uuid' },
		title: { type: 'string' },
		content: { type: 'string' },
		url: { type: 'string' },
		thumbnail: { type: 'string' },
		notes: {
			type: 'array',
			items: { $ref: 'note#' },
		},
		source: {
			type: 'object',
			properties: {
				id: { type: 'string', format: 'uuid' },
				name: { type: 'string' },
			},
		},
		_count: {
			type: 'object',
			properties: {
				comments: { type: 'integer' },
			},
		},
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
	required: [
		'id',
		'title',
		'content',
		'url',
		'notes',
		'source',
		'_count',
		'createdAt',
		'updatedAt',
	],
});

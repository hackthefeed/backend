export const createNoteSchema = {
	description: 'Creates a note on a post',
	tags: ['note'],
	body: {
		type: 'object',
		properties: {
			content: { type: 'string' },
		},
		required: ['content'],
	},
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
	headers: { $ref: 'auth#' },
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				message: { type: 'string' },
				data: { type: 'string', format: 'uuid' },
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const deleteNoteSchema = {
	description: 'Deletes a note on from post',
	tags: ['note'],
	headers: { $ref: 'auth#' },
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
			noteId: { type: 'string', format: 'uuid' },
		},
		required: ['postId', 'noteId'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Unknown noteId or postId',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const createPostCommentSchema = {
	description: 'Creates a comment on a post',
	tags: ['comment'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
	body: {
		type: 'object',
		properties: {
			content: { type: 'string' },
		},
		required: ['content'],
	},
	headers: { $ref: 'auth#' },
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { $ref: 'comment#' },
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const createPostCommentReplySchema = {
	description: 'Replies to a comment on a post',
	tags: ['comment'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
	body: {
		type: 'object',
		properties: {
			content: { type: 'string' },
		},
		required: ['content'],
	},
	headers: { $ref: 'auth#' },
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { $ref: 'comment#' },
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const deletePostCommentSchema = {
	description: 'Deletes a comment on from post',
	tags: ['comment'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
			commentId: { type: 'string', format: 'uuid' },
		},
		required: ['postId', 'commentId'],
	},
	headers: { $ref: 'auth#' },
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
			},
		},
		401: {
			description: 'Authentication error',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const viewPostSchema = {
	description: 'Gets a post',
	tags: ['post'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: { $ref: 'post#' },
			},
		},
		404: {
			description: 'Unknown postId',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [false],
				},
				message: { type: 'string' },
			},
		},
	},
};

export const postCommentsSchema = {
	description: 'Gets all comments on a post',
	tags: ['comment'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				success: {
					type: 'boolean',
					enum: [true],
				},
				data: {
					type: 'array',
					items: { $ref: 'comment#' },
				},
			},
		},
	},
};

export const postInsightsSchema = {
	description: 'Gets insights on a post',
	tags: ['insight'],
	params: {
		type: 'object',
		properties: {
			postId: { type: 'string', format: 'uuid' },
		},
		required: ['postId'],
	},
};

export const authHeadersSchema = {
	type: 'object',
	properties: {
		key: { type: 'string' },
	},
	required: ['key'],
};

export type AuthHeaders = {
	key: string;
}

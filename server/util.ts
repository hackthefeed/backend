import { createHash } from 'node:crypto';

export function createPasswordHash(password: string) {
	return createHash('sha512').update(password).digest('hex').toString();
}

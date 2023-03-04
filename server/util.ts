import { createHmac } from 'node:crypto';

export function createPasswordHash(password: string, salt: string) {
	return createHmac('sha512', salt).update(password).digest('hex').toString();
}

import assert from 'node:assert';

import { createPasswordHash } from '$/server/util';

describe('auth', () => {
	it('should correctly salt and hash the password', () => {
		const email = 'test@hackthefeed.com';
		const password = 'password';

		assert.equal(
			createPasswordHash(password, email),
			'482ad11f19a77100f6d2dbf9b60f14c487bc9796c94240953e90fe1d6094ff8366938653489afe6f73e2464786e60b93435719df0101e6e80b3f60325e47c5ad'
		);
	});
});

import { createHash } from 'node:crypto';

import axios from 'axios';

import { prisma } from '$/database';
import { server } from '$/server/server';
import { createPasswordHash } from '$/server/util';

import { loginSchema, microsoftSchema, registerSchema } from './schema';
import type { LoginSchemaBody, MicrosoftSchemaQuery, RegisterSchema } from './types';

type MicrosoftTokenResponse = {
	access_token: string;
}

type MicrosoftUserResponse = {
	displayName: string;
	userPrincipalName: string;
}

type TurnstileResponse = {
	success: boolean;
	hostname: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Not a great implementation, but it's a good enough one for now.
function validEmail(email: string) {
	return EMAIL_REGEX.test(email);
}

async function verifyToken(token: string, ip: string): Promise<boolean> {
	const formData = new FormData();

	formData.append('secret', process.env.CF_TURNSTILE_SECRET!);
	formData.append('response', token);
	formData.append('remoteip', ip);

	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
	const result = await fetch(url, {
		body: formData,
		method: 'POST',
	});

	const outcome: TurnstileResponse = await result.json();

	return outcome.hostname === 'hackthefeed.com' && outcome.success;
}

async function verifyPasswordStrength(password: string) {
	const hasher = createHash('sha1');

	hasher.update(password);

	const hash = hasher.digest('hex').toUpperCase();
	const result = await axios.get(`https://api.pwnedpasswords.com/range/${hash.slice(0, 5)}`);

	const hashes = await result.data.split('\n');
	const end = hash.slice(5);

	for (const h of hashes) {
		const [hash, count] = h.split(':');

		if (hash === end) {
			return parseInt(count);
		}
	}

	return 0;
}

server.get<{
	Querystring: MicrosoftSchemaQuery;
}>('/auth/microsoft', { schema: microsoftSchema }, async (request, response) => {
	const query = request.query;
	const form = new FormData();

	form.append('client_id', process.env.MS_CLIENT_ID!);
	form.append('scope', 'User.Read,offline_access');
	form.append('code', query.code);
	form.append('grant_type', 'authorization_code');
	form.append('redirect_uri', 'https://api.hackthefeed.com/auth/microsoft');
	form.append('client_secret', process.env.MS_CLIENT_SECRET!);

	try {
		const login = await axios.post<MicrosoftTokenResponse>('https://login.microsoftonline.com/common/oauth2/v2.0/token', form);
		const graphUser = await axios.get<MicrosoftUserResponse>('https://graph.microsoft.com/v1.0/me', {
			headers: {
				Authorization: `Bearer ${login.data.access_token}`,
			},
		});

		const emailLower = graphUser.data.userPrincipalName.toLowerCase();
		const user = await prisma.user.upsert({
			where: {
				email: emailLower,
			},
			update: {
				displayName: graphUser.data.displayName,
			},
			create: {
				email: emailLower,
				displayName: graphUser.data.displayName,
			},
			select: {
				id: true,
			},
		});

		const token = server.jwt.sign({
			id: user.id,
		});

		// frontend should store the key in localStorage
		return response.redirect(302, `https://hackthefeed.com/?key=${token}`);
	} catch {
		return response.status(403).send({
			message: 'Invalid authenication code.',
			success: false,
		});
	}
});

server.post<{
	Body: LoginSchemaBody
}>('/auth/login', { schema: loginSchema }, async (request, response) => {
	const captcha = await verifyToken(request.body.token, request.ip);

	if (!captcha) {
		return response.status(403).send({
			success: false,
			message: 'Invalid captcha.',
		});
	}

	const userWithSalt = await prisma.user.findFirst({
		where: {
			OR: [
				{
					username: request.body.username,
				},
				{
					email: request.body.username,
				},
			],
		},
		select: {
			email: true,
		},
	});

	if (userWithSalt === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	const hash = createPasswordHash(request.body.password, userWithSalt.email);

	const user = await prisma.user.findFirst({
		where: {
			OR: [
				{
					username: request.body.username,
				},
				{
					email: request.body.username,
				},
			],
			password: hash,
		},
		select: {
			id: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	const token = server.jwt.sign({
		id: user.id,
	});

	return {
		success: true,
		data: token,
	};
});

server.post<{
	Body: RegisterSchema;
}>('/auth/register', { schema: registerSchema }, async (request, response) => {
	const captcha = await verifyToken(request.body.token, request.ip);

	if (!captcha) {
		return response.status(403).send({
			success: false,
			message: 'invalid_captcha',
		});
	}

	if (!validEmail(request.body.email)) return response.status(400).send({
		message: 'invalid_email',
		success: false,
	});

	if (await verifyPasswordStrength(request.body.password) > 0) return response.status(400).send({
		message: 'password_too_common',
		success: false,
	});

	const hash = createPasswordHash(request.body.password, request.body.email.toLowerCase());

	try {
		const user = await prisma.user.create({
			data: {
				username: request.body.username.toLowerCase(),
				email: request.body.email.toLowerCase(),
				password: hash,
			},
			select: {
				id: true,
			},
		});

		const token = server.jwt.sign({
			id: user.id,
		});

		return response.status(201).send({
			success: true,
			data: token,
		});
	} catch {
		return response.status(400).send({
			message: 'email_or_username_taken',
			success: false,
		});
	}
});

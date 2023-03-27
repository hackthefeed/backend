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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Not a great implementation, but it's a good enough one for now.
function validEmail(email: string) {
	return EMAIL_REGEX.test(email);
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
				key: true,
			},
		});

		// frontend should store the key in localStorage
		return response.redirect(302, `https://hackthefeed.com/?key=${user.key}`);
	} catch (e) {
		console.error(e);
		return response.status(403).send({
			message: 'Invalid authenication code.',
			success: false,
		});
	}
});

server.post<{
	Body: LoginSchemaBody
}>('/auth/login', { schema: loginSchema }, async (request, response) => {
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
			key: true,
		},
	});

	if (user === null) return response.status(401).send({
		success: false,
		message: 'Invalid username or password.',
	});

	return {
		success: true,
		key: user.key,
	};
});

server.post<{
	Body: RegisterSchema;
}>('/auth/register', { schema: registerSchema }, async (request, response) => {
	if (!validEmail(request.body.email)) return response.status(400).send({
		message: 'Invalid email.',
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
				key: true,
			},
		});

		return response.status(201).send({
			message: 'User created successfully.',
			success: true,
			user,
		});
	} catch {
		return response.status(400).send({
			message: 'Email or username is already in use.',
			success: false,
		});
	}
});

import axios from 'axios';

import { prisma } from '$/database';

import { server } from '../server';

// Microsoft authentication endpoint

const microsoftAuthSchema = {
	querystring: {
		type: 'object',
		properties: {
			code: { type: 'string' },
		},
	},
};

type MicrosoftAuthQuery = {
	code: string;
}

type MicrosoftTokenResponse = {
	access_token: string;
}

type MicrosoftUserResponse = {
	displayName: string;
	userPrincipalName: string;
}

server.get('/auth/microsoft', { schema: microsoftAuthSchema }, async (request, response) => {
	const query = request.query as MicrosoftAuthQuery;
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
		return response.redirect(200, `https://hackthefeed.com/?key=${user.key}`);
	} catch {
		return response.status(403).send({
			message: 'Invalid authenication code.',
			success: false,
		});
	}
});

// https://login.live.com/oauth20_authorize.srf?client_id=11b61ecc-d611-4cc6-bed4-6d4940b5c1ea&response_type=code&scope=openid,email

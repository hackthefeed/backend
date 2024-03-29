export type MicrosoftSchemaQuery = {
	code: string;
}

export type LoginSchemaBody = {
	username: string;
	password: string;
	token: string;
};

export type RegisterSchema = {
	username: string;
	email: string;
	password: string;
	token: string;
};

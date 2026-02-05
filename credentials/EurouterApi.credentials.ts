import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EurouterApi implements ICredentialType {
	name = 'eurouterApi';

	displayName = 'EUrouter API';

	icon: Icon = { light: 'file:../nodes/Eurouter/eurouter.svg', dark: 'file:../nodes/Eurouter/eurouter.dark.svg' };

	documentationUrl = 'https://github.com/EUrouter/eurouter-n8n-node#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.eurouter.ai/api/v1',
			url: '/models',
		},
	};
}

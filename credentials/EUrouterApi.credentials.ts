import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class EUrouterApi implements ICredentialType {
	name = 'eUrouterApi';

	displayName = 'EUrouter API';

	documentationUrl = 'https://www.eurouter.ai/docs/concepts/authentication';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'Your EUrouter API key. Create one in your <a href="https://www.eurouter.ai/dashboard/keys" target="_blank">EUrouter dashboard</a>.',
		},
		{
			displayName:
				'⚙️ <b>App Attribution</b> (optional)<br/>By default, every request from this node is attributed to <b>n8n</b> in EUrouter analytics. If you are embedding n8n inside your own product (agency platform, internal tool, SaaS), you can override the attribution below to track usage under your own brand. <a href="https://www.eurouter.ai/docs/concepts/app-attribution" target="_blank">Learn more</a>.',
			name: 'attributionNotice',
			type: 'notice',
			default: '',
		},
		{
			displayName: 'App URL',
			name: 'appUrl',
			type: 'string',
			default: '',
			placeholder: 'https://n8n.io',
			description:
				'Overrides the <code>HTTP-Referer</code> header. Leave empty to attribute to n8n. Set this to your own app URL if you are embedding n8n inside a product.',
		},
		{
			displayName: 'App Title',
			name: 'appTitle',
			type: 'string',
			default: '',
			placeholder: 'n8n',
			description:
				'Overrides the <code>X-EUrouter-Title</code> header. Leave empty to attribute to n8n. Set this to your app name to appear in EUrouter rankings under your own brand.',
		},
		{
			displayName: 'App Categories',
			name: 'appCategories',
			type: 'string',
			default: '',
			placeholder: 'programming-app,cloud-agent',
			description:
				'Overrides the <code>X-EUrouter-Categories</code> header. Comma-separated, from EUrouter\'s allowed list: <code>cli-agent</code>, <code>ide-extension</code>, <code>cloud-agent</code>, <code>programming-app</code>, <code>native-app-builder</code>, <code>creative-writing</code>, <code>video-gen</code>, <code>image-gen</code>, <code>writing-assistant</code>, <code>general-chat</code>, <code>personal-agent</code>, <code>roleplay</code>, <code>game</code>. Defaults to <code>programming-app,cloud-agent</code>.',
		},
		{
			displayName: 'Base URL',
			name: 'url',
			type: 'hidden',
			default: 'https://api.eurouter.ai/api/v1',
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
			baseURL: '={{ $credentials.url }}',
			url: '/models',
			method: 'GET',
		},
	};
}

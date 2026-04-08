import { ChatOpenAI } from '@langchain/openai';
import type { ClientOptions } from '@langchain/openai';
import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

export class EUrouterChatModel implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EUrouter Chat Model',
		name: 'eUrouterChatModel',
		icon: 'file:eurouter-icon.svg',
		group: ['transform'],
		version: [1],
		description: 'The European AI gateway. 100+ models, all served from EU infrastructure with GDPR-friendly defaults.',
		defaults: {
			name: 'EUrouter Chat Model',
		},
		subtitle: '={{ $parameter.model }}',
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.eurouter.ai/docs/api/chat',
					},
				],
			},
		},

		inputs: [],

		outputs: [NodeConnectionTypes.AiLanguageModel],
		outputNames: ['Model'],
		credentials: [
			{
				name: 'eUrouterApi',
				required: true,
			},
		],
		requestDefaults: {
			ignoreHttpStatusErrors: true,
			baseURL: '={{ $credentials?.url }}',
		},
		properties: [
			{
				displayName: '🇪🇺 Every request is routed through European infrastructure by default. Use the <b>Provider Routing & Privacy</b> options below to lock down to a specific country, EU-owned providers only, zero data retention, or no training-data collection.',
				name: 'eUrouterNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description:
					'Which EUrouter model to use. The list is fetched live from your account. <a href="https://www.eurouter.ai/models" target="_blank">Browse all models</a>. <br/><br/>Tip: append <code>:floor</code> for cheapest, <code>:nitro</code> for fastest, or <code>:free</code> where available.',
				typeOptions: {
					loadOptions: {
						routing: {
							request: {
								method: 'GET',
								url: '/models',
							},
							output: {
								postReceive: [
									{
										type: 'rootProperty',
										properties: {
											property: 'data',
										},
									},
									{
										type: 'setKeyValue',
										properties: {
											name: '={{$responseItem.id}}',
											value: '={{$responseItem.id}}',
										},
									},
									{
										type: 'sort',
										properties: {
											key: 'name',
										},
									},
								],
							},
						},
					},
				},
				routing: {
					send: {
						type: 'body',
						property: 'model',
					},
				},
				default: 'claude-sonnet-4-6',
			},
			{
				displayName: 'Sampling Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Generation parameters: temperature, token limits, response format, retries, and timeout',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							'Penalize tokens based on how often they have already appeared, reducing verbatim repetition. Range: -2 to 2.',
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description:
							'Hard cap on the number of tokens the model may generate. Set to <code>-1</code> for the model default.',
						type: 'number',
						typeOptions: {
							maxValue: 128000,
						},
					},
					{
						displayName: 'Response Format',
						name: 'responseFormat',
						default: 'text',
						type: 'options',
						description: 'Force the model to return free text or strict JSON',
						options: [
							{
								name: 'Text',
								value: 'text',
								description: 'Plain text response (default)',
							},
							{
								name: 'JSON Object',
								value: 'json_object',
								description: 'Constrain the model to return valid JSON. Only supported on JSON-capable models.',
							},
						],
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							'Penalize tokens that have appeared at all, encouraging the model to introduce new topics. Range: -2 to 2.',
						type: 'number',
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'How random the output should be. <code>0</code> is deterministic; <code>2</code> is wild. Use this <i>or</i> Top P, not both.',
						type: 'number',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						default: 360000,
						description:
							'Per-request timeout in milliseconds. Default is 6 minutes — bump higher if you use reasoning-heavy models like DeepSeek-R1 or Claude with thinking.',
						type: 'number',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						default: 2,
						description: 'How many times the SDK will retry on transient network failures',
						type: 'number',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description:
							'Nucleus sampling. <code>0.5</code> considers only the half-most-likely tokens. Use this <i>or</i> Temperature, not both.',
						type: 'number',
					},
				],
			},
			{
				displayName: 'Provider Routing & Privacy',
				name: 'routing',
				placeholder: 'Add Routing Option',
				description:
					'Control how EUrouter selects providers, where your data lives, and how long it can be retained. See <a href="https://www.eurouter.ai/docs/concepts/routing" target="_blank">Routing docs</a>.',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Sort By',
						name: 'sort',
						type: 'options',
						default: '',
						description: 'Which metric to prioritize when EUrouter picks a provider',
						options: [
							{
								name: 'Default (Best Score)',
								value: '',
								description: "EUrouter's balanced score: health divided by price squared",
							},
							{
								name: 'Price (Cheapest First)',
								value: 'price',
								description: 'Route to the cheapest provider first',
							},
							{
								name: 'Latency (Fastest First)',
								value: 'latency',
								description: 'Route to the lowest-latency provider first',
							},
							{
								name: 'Throughput (Highest First)',
								value: 'throughput',
								description: 'Route to the highest-throughput provider first',
							},
						],
					},
					{
						displayName: 'Provider Order',
						name: 'order',
						type: 'string',
						default: '',
						placeholder: 'scaleway,nebius,tensorix',
						description:
							'Comma-separated provider slugs to try in priority order. The first available provider in the list is used. See <a href="https://www.eurouter.ai/docs/concepts/providers" target="_blank">all providers</a>.',
					},
					{
						displayName: 'Only Use Providers',
						name: 'only',
						type: 'string',
						default: '',
						placeholder: 'mistral,scaleway',
						description:
							'Comma-separated allowlist of provider slugs. EUrouter will fail rather than route outside this list.',
					},
					{
						displayName: 'Ignore Providers',
						name: 'ignore',
						type: 'string',
						default: '',
						placeholder: 'nebius',
						description: 'Comma-separated denylist of provider slugs. These providers are never used.',
					},
					{
						displayName: 'Allow Fallbacks',
						name: 'allowFallbacks',
						type: 'boolean',
						default: true,
						description: 'Whether to retry with another provider if the first one fails. Disable for strict pinning.',
					},
					{
						displayName: 'Data Residency',
						name: 'dataResidency',
						type: 'options',
						default: '',
						description: 'Restrict inference to providers physically located in the chosen region',
						options: [
							{
								name: 'Any EU (Default)',
								value: '',
								description: 'Any provider in EUrouter\'s European pool',
							},
							{
								name: 'European Union',
								value: 'eu',
								description: 'EU member states only',
							},
							{
								name: 'European Economic Area',
								value: 'eea',
								description: 'EU + Iceland, Liechtenstein, and Norway',
							},
							{
								name: 'Germany Only',
								value: 'de',
								description: 'Providers physically located in Germany',
							},
							{
								name: 'France Only',
								value: 'fr',
								description: 'Providers physically located in France',
							},
						],
					},
					{
						displayName: 'EU-Owned Providers Only',
						name: 'euOwned',
						type: 'boolean',
						default: false,
						description:
							'Whether to restrict to providers whose parent company is headquartered in the EEA. Excludes EU-located subsidiaries of non-EU companies.',
					},
					{
						displayName: 'Max Data Retention (Days)',
						name: 'maxRetentionDays',
						type: 'number',
						default: -1,
						typeOptions: { minValue: -1 },
						description:
							'Maximum number of days a provider may retain your request data. Use <code>0</code> for zero-retention providers only, <code>-1</code> for no limit.',
					},
					{
						displayName: 'Data Collection',
						name: 'dataCollection',
						type: 'options',
						default: '',
						description: 'Whether providers may use your request data for training their own models',
						options: [
							{
								name: 'Default',
								value: '',
								description: 'Use the default per-provider policy',
							},
							{
								name: 'Allow',
								value: 'allow',
								description: 'Permit providers to use data for training',
							},
							{
								name: 'Deny (Recommended for Sensitive Data)',
								value: 'deny',
								description: 'Only route to providers that contractually do not train on your data',
							},
						],
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials<{
			apiKey: string;
			url: string;
			appUrl?: string;
			appTitle?: string;
			appCategories?: string;
		}>('eUrouterApi');

		const modelName = this.getNodeParameter('model', itemIndex) as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			frequencyPenalty?: number;
			maxTokens?: number;
			maxRetries: number;
			timeout: number;
			presencePenalty?: number;
			temperature?: number;
			topP?: number;
			responseFormat?: 'text' | 'json_object';
		};

		const routing = this.getNodeParameter('routing', itemIndex, {}) as {
			sort?: string;
			order?: string;
			only?: string;
			ignore?: string;
			allowFallbacks?: boolean;
			dataResidency?: string;
			euOwned?: boolean;
			maxRetentionDays?: number;
			dataCollection?: string;
		};

		// Build the provider object for EUrouter routing
		const provider: Record<string, unknown> = {};
		if (routing.sort) provider.sort = routing.sort;
		if (routing.order) provider.order = routing.order.split(',').map((s) => s.trim());
		if (routing.only) provider.only = routing.only.split(',').map((s) => s.trim());
		if (routing.ignore) provider.ignore = routing.ignore.split(',').map((s) => s.trim());
		if (routing.allowFallbacks === false) provider.allow_fallbacks = false;
		if (routing.dataResidency) provider.data_residency = routing.dataResidency;
		if (routing.euOwned) provider.eu_owned = true;
		if (routing.maxRetentionDays !== undefined && routing.maxRetentionDays >= 0) {
			provider.max_retention_days = routing.maxRetentionDays;
		}
		if (routing.dataCollection) provider.data_collection = routing.dataCollection;

		const timeout = options.timeout;

		// App attribution: defaults to n8n, overridable per-credential.
		// See https://www.eurouter.ai/docs/concepts/app-attribution
		const defaultHeaders: Record<string, string> = {
			'HTTP-Referer': credentials.appUrl?.trim() || 'https://n8n.io',
			'X-EUrouter-Title': credentials.appTitle?.trim() || 'n8n',
			'X-EUrouter-Categories': credentials.appCategories?.trim() || 'programming-app,cloud-agent',
		};

		const configuration: ClientOptions = {
			baseURL: credentials.url,
			defaultHeaders,
		};

		const modelKwargs: Record<string, unknown> = {};
		if (options.responseFormat) {
			modelKwargs.response_format = { type: options.responseFormat };
		}
		if (Object.keys(provider).length > 0) {
			modelKwargs.provider = provider;
		}

		const model = new ChatOpenAI({
			apiKey: credentials.apiKey,
			model: modelName,
			...options,
			timeout,
			maxRetries: options.maxRetries ?? 2,
			configuration,
			modelKwargs: Object.keys(modelKwargs).length > 0 ? modelKwargs : undefined,
		});

		return {
			response: model,
		};
	}
}

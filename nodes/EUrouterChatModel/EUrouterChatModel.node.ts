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
		icon: 'file:eurouter.svg',
		group: ['transform'],
		version: [1],
		description: 'EU-hosted, GDPR-friendly AI gateway with 68+ models. Use with an AI chain or agent.',
		defaults: {
			name: 'EUrouter Chat Model',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Language Models', 'Root Nodes'],
				'Language Models': ['Chat Models (Recommended)'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.eurouter.ai/docs',
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
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description:
					'The model which will generate the completion. Append :floor for cheapest, :nitro for fastest, or :free for free providers. <a href="https://www.eurouter.ai/models">Browse all models</a>.',
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
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Frequency Penalty',
						name: 'frequencyPenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim",
						type: 'number',
					},
					{
						displayName: 'Maximum Number of Tokens',
						name: 'maxTokens',
						default: -1,
						description:
							'The maximum number of tokens to generate in the completion.',
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
						options: [
							{
								name: 'Text',
								value: 'text',
								description: 'Regular text response',
							},
							{
								name: 'JSON',
								value: 'json_object',
								description:
									'Enables JSON mode, which should guarantee the message the model generates is valid JSON',
							},
						],
					},
					{
						displayName: 'Presence Penalty',
						name: 'presencePenalty',
						default: 0,
						typeOptions: { maxValue: 2, minValue: -2, numberPrecision: 1 },
						description:
							"Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics",
						type: 'number',
					},
					{
						displayName: 'Sampling Temperature',
						name: 'temperature',
						default: 0.7,
						typeOptions: { maxValue: 2, minValue: 0, numberPrecision: 1 },
						description:
							'Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.',
						type: 'number',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						default: 360000,
						description: 'Maximum amount of time a request is allowed to take in milliseconds',
						type: 'number',
					},
					{
						displayName: 'Max Retries',
						name: 'maxRetries',
						default: 2,
						description: 'Maximum number of retries to attempt',
						type: 'number',
					},
					{
						displayName: 'Top P',
						name: 'topP',
						default: 1,
						typeOptions: { maxValue: 1, minValue: 0, numberPrecision: 1 },
						description:
							'Controls diversity via nucleus sampling: 0.5 means half of all likelihood-weighted options are considered. We generally recommend altering this or temperature but not both.',
						type: 'number',
					},
				],
			},
			{
				displayName: 'Routing',
				name: 'routing',
				placeholder: 'Add Routing Option',
				description: 'Control how EUrouter routes your request to providers',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Sort By',
						name: 'sort',
						type: 'options',
						default: '',
						description: 'Prioritize providers by a specific metric',
						options: [
							{
								name: 'Default (Best Score)',
								value: '',
								description: 'EUrouter default: health / price²',
							},
							{
								name: 'Price (Cheapest First)',
								value: 'price',
								description: 'Route to cheapest provider first',
							},
							{
								name: 'Latency (Fastest First)',
								value: 'latency',
								description: 'Route to lowest latency provider first',
							},
							{
								name: 'Throughput (Highest First)',
								value: 'throughput',
								description: 'Route to highest throughput provider first',
							},
						],
					},
					{
						displayName: 'Provider Order',
						name: 'order',
						type: 'string',
						default: '',
						description: 'Comma-separated list of provider slugs to try in order (e.g. "scaleway,nebius,tensorix")',
					},
					{
						displayName: 'Only Use Providers',
						name: 'only',
						type: 'string',
						default: '',
						description: 'Comma-separated list of provider slugs to exclusively use (e.g. "mistral,scaleway")',
					},
					{
						displayName: 'Ignore Providers',
						name: 'ignore',
						type: 'string',
						default: '',
						description: 'Comma-separated list of provider slugs to never use (e.g. "nebius")',
					},
					{
						displayName: 'Allow Fallbacks',
						name: 'allowFallbacks',
						type: 'boolean',
						default: true,
						description: 'Whether to automatically retry with other providers on failure',
					},
					{
						displayName: 'Data Residency',
						name: 'dataResidency',
						type: 'options',
						default: '',
						description: 'Restrict to providers in a specific region',
						options: [
							{
								name: 'Any EU',
								value: '',
								description: 'Any EU provider (default)',
							},
							{
								name: 'EU',
								value: 'eu',
								description: 'European Union',
							},
							{
								name: 'EEA',
								value: 'eea',
								description: 'European Economic Area',
							},
							{
								name: 'Germany',
								value: 'de',
							},
							{
								name: 'France',
								value: 'fr',
							},
						],
					},
					{
						displayName: 'EU-Owned Providers Only',
						name: 'euOwned',
						type: 'boolean',
						default: false,
						description: 'Whether to only use providers headquartered in the EEA',
					},
					{
						displayName: 'Max Data Retention (Days)',
						name: 'maxRetentionDays',
						type: 'number',
						default: -1,
						description: 'Maximum data retention in days. Set to 0 for zero retention. -1 for no limit.',
					},
					{
						displayName: 'Data Collection',
						name: 'dataCollection',
						type: 'options',
						default: '',
						description: 'Control whether providers can use data for training',
						options: [
							{
								name: 'Default',
								value: '',
							},
							{
								name: 'Allow',
								value: 'allow',
								description: 'Allow providers to use data for training',
							},
							{
								name: 'Deny',
								value: 'deny',
								description: 'Deny providers from using data for training',
							},
						],
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials<{ apiKey: string; url: string }>('eUrouterApi');

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
		const configuration: ClientOptions = {
			baseURL: credentials.url,
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

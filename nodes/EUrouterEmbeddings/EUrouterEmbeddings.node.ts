import { OpenAIEmbeddings } from '@langchain/openai';
import type { ClientOptions } from '@langchain/openai';
import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';

export class EUrouterEmbeddings implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EUrouter Embeddings',
		name: 'eUrouterEmbeddings',
		icon: 'file:eurouter-icon.svg',
		group: ['transform'],
		version: [1],
		description: 'European embeddings for RAG, semantic search, and vector stores. Full GDPR-friendly routing controls.',
		defaults: {
			name: 'EUrouter Embeddings',
		},
		subtitle: '={{ $parameter.model }}',
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://www.eurouter.ai/docs/api/embeddings',
					},
				],
			},
		},

		inputs: [],

		outputs: [NodeConnectionTypes.AiEmbedding],
		outputNames: ['Embeddings'],
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
				displayName: '🇪🇺 Embeddings often touch entire document corpora — for many RAG workloads this is more sensitive than chat. The <b>Provider Routing & Privacy</b> options below let you pin a country, EU-owned providers only, zero retention, and no training-data collection.',
				name: 'eUrouterEmbeddingsNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description:
					'Which EUrouter embedding model to use. The list is filtered to embedding-capable models and fetched live from your account. <a href="https://www.eurouter.ai/models" target="_blank">Browse all models</a>.',
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
										type: 'filter',
										properties: {
											pass: "={{$responseItem.id.includes('embed') || $responseItem.id.includes('bge') || $responseItem.id.includes('e5-') || $responseItem.id.includes('paraphrase') || $responseItem.id.includes('titan-') || ($responseItem.architecture && $responseItem.architecture.modality && $responseItem.architecture.modality.includes('embedding'))}}",
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
				default: 'bge-m3',
			},
			{
				displayName: 'Embedding Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Batch size, dimensions, normalization, and timeout',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Batch Size',
						name: 'batchSize',
						default: 512,
						typeOptions: { maxValue: 2048, minValue: 1 },
						description: 'How many documents to embed in a single request. Larger is faster but uses more memory.',
						type: 'number',
					},
					{
						displayName: 'Dimensions',
						name: 'dimensions',
						default: 0,
						description:
							'Output vector dimensions. Set to <code>0</code> for the model default. Some models support custom dimensions (e.g. Qwen3 Embedding accepts 32–4096) — others ignore this field.',
						type: 'number',
					},
					{
						displayName: 'Strip New Lines',
						name: 'stripNewLines',
						default: true,
						description: 'Whether to strip newlines from input text before embedding. Recommended for most retrieval use cases.',
						type: 'boolean',
					},
					{
						displayName: 'Timeout (Ms)',
						name: 'timeout',
						default: 60000,
						description: 'Per-request timeout in milliseconds',
						type: 'number',
					},
				],
			},
			{
				displayName: 'Provider Routing & Privacy',
				name: 'routing',
				placeholder: 'Add Routing Option',
				description:
					'Control how EUrouter selects providers, where your embeddings are computed, and how long they can be retained. See <a href="https://www.eurouter.ai/docs/concepts/routing" target="_blank">Routing docs</a>.',
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
							'Comma-separated provider slugs to try in priority order. See <a href="https://www.eurouter.ai/docs/concepts/providers" target="_blank">all providers</a>.',
					},
					{
						displayName: 'Only Use Providers',
						name: 'only',
						type: 'string',
						default: '',
						placeholder: 'mistral,scaleway',
						description: 'Comma-separated allowlist of provider slugs. EUrouter will fail rather than route outside this list.',
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
						description: 'Restrict embedding computation to providers physically located in the chosen region',
						options: [
							{
								name: 'Any EU (Default)',
								value: '',
								description: "Any provider in EUrouter's European pool",
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
							'Maximum number of days a provider may retain your embedding inputs. Use <code>0</code> for zero-retention providers only, <code>-1</code> for no limit.',
					},
					{
						displayName: 'Data Collection',
						name: 'dataCollection',
						type: 'options',
						default: '',
						description: 'Whether providers may use your embedding inputs for training their own models',
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

		const modelName = this.getNodeParameter('model', itemIndex, 'bge-m3') as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			batchSize?: number;
			stripNewLines?: boolean;
			timeout?: number;
			dimensions?: number;
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

		// Build the provider object for EUrouter routing.
		// The embeddings API supports the same provider routing controls as chat completions.
		// See https://www.eurouter.ai/docs/api/embeddings
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

		const embeddings = new OpenAIEmbeddings({
			model: modelName,
			apiKey: credentials.apiKey,
			batchSize: options.batchSize,
			stripNewLines: options.stripNewLines,
			timeout: options.timeout,
			dimensions: options.dimensions && options.dimensions > 0 ? options.dimensions : undefined,
			configuration,
			...(Object.keys(provider).length > 0 ? { modelKwargs: { provider } } : {}),
		});

		return {
			response: embeddings,
		};
	}
}

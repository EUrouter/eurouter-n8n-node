import {
	NodeConnectionTypes,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';
import {
	createEUrouterDefaultHeaders,
	EUrouterEmbeddingsClient,
	type EUrouterEmbeddingsResponse,
} from '../shared/eurouterAi';

export class EUrouterEmbeddings implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EUrouter Embeddings',
		name: 'eUrouterEmbeddings',
		icon: 'file:eurouter.svg',
		group: ['transform'],
		version: [1],
		description: 'Generate embeddings using EU-hosted models via EUrouter. Use with a vector store.',
		defaults: {
			name: 'EUrouter Embeddings',
		},
		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings'],
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
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description:
					'The embedding model to use. <a href="https://www.eurouter.ai/models">Browse all models</a>.',
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
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Batch Size',
						name: 'batchSize',
						default: 512,
						typeOptions: { maxValue: 2048 },
						description: 'Maximum number of documents to send in each request',
						type: 'number',
					},
					{
						displayName: 'Dimensions',
						name: 'dimensions',
						default: 0,
						description: 'Number of dimensions for the output embeddings. Set to 0 for model default. Supported by some models (e.g. Qwen3 Embedding supports 32-4096).',
						type: 'number',
					},
					{
						displayName: 'Strip New Lines',
						name: 'stripNewLines',
						default: true,
						description: 'Whether to strip new lines from the input text',
						type: 'boolean',
					},
					{
						displayName: 'Timeout',
						name: 'timeout',
						default: 60000,
						description: 'Maximum amount of time a request is allowed to take in milliseconds',
						type: 'number',
					},
				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		const credentials = await this.getCredentials<{ apiKey: string; url: string }>('eUrouterApi');

		const modelName = this.getNodeParameter('model', itemIndex, 'bge-m3') as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			batchSize?: number;
			stripNewLines?: boolean;
			timeout?: number;
			dimensions?: number;
		};

		const embeddings = new EUrouterEmbeddingsClient({
			headers: createEUrouterDefaultHeaders(),
			batchSize: options.batchSize,
			dimensions: options.dimensions && options.dimensions > 0 ? options.dimensions : undefined,
			model: modelName,
			request: async (request) => {
				const response = await this.helpers.httpRequestWithAuthentication.call(this, 'eUrouterApi', {
					method: 'POST',
					url: `${credentials.url}${request.path}`,
					body: request.body,
					headers: request.headers,
					json: true,
					timeout: request.timeout,
				});

				return response as EUrouterEmbeddingsResponse;
			},
			stripNewLines: options.stripNewLines,
			timeout: options.timeout,
		});

		return {
			response: embeddings,
		};
	}
}

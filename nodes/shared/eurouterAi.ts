export type EUrouterResponseFormat = 'text' | 'json_object';

export interface EUrouterChatRouting {
	sort?: string;
	order?: string;
	only?: string;
	ignore?: string;
	allowFallbacks?: boolean;
	dataResidency?: string;
	euOwned?: boolean;
	maxRetentionDays?: number;
	dataCollection?: string;
}

export interface BuildChatAdditionalParamsOptions {
	responseFormat?: EUrouterResponseFormat;
	routing?: EUrouterChatRouting;
}

export interface EUrouterEmbeddingsRequestBody {
	model: string;
	input: string[];
	dimensions?: number;
}

export interface EUrouterEmbeddingsRequest {
	path: string;
	body: EUrouterEmbeddingsRequestBody;
	headers?: Record<string, string>;
	timeout?: number;
}

export interface EUrouterEmbeddingsResponse {
	data?: Array<{
		embedding?: number[];
	}>;
}

export interface EUrouterEmbeddingsClientOptions {
	model: string;
	batchSize?: number;
	stripNewLines?: boolean;
	dimensions?: number;
	timeout?: number;
	headers?: Record<string, string>;
	request: (request: EUrouterEmbeddingsRequest) => Promise<EUrouterEmbeddingsResponse>;
}

const DEFAULT_HEADERS = {
	'HTTP-Referer': 'https://n8n.io',
	'X-EUrouter-Title': 'n8n',
} as const;

export function createEUrouterDefaultHeaders(): Record<string, string> {
	return { ...DEFAULT_HEADERS };
}

export function buildChatAdditionalParams(
	options: BuildChatAdditionalParamsOptions,
): Record<string, unknown> {
	const additionalParams: Record<string, unknown> = {};

	if (options.responseFormat) {
		additionalParams.response_format = { type: options.responseFormat };
	}

	const provider = buildProviderParams(options.routing ?? {});

	if (provider) {
		additionalParams.provider = provider;
	}

	return additionalParams;
}

export class EUrouterEmbeddingsClient {
	private readonly options: EUrouterEmbeddingsClientOptions;

	private readonly batchSize: number;

	constructor(options: EUrouterEmbeddingsClientOptions) {
		this.options = options;
		this.batchSize =
			options.batchSize !== undefined && options.batchSize > 0 ? options.batchSize : 512;
	}

	async embedDocuments(documents: string[]): Promise<number[][]> {
		if (documents.length === 0) {
			return [];
		}

		const embeddings: number[][] = [];

		for (const batch of chunk(this.normalizeInputs(documents), this.batchSize)) {
			const response = await this.options.request({
				path: '/embeddings',
				body: this.buildRequestBody(batch),
				headers: this.options.headers,
				timeout: this.options.timeout,
			});

			const data = response.data;

			if (!Array.isArray(data)) {
				throw new Error('EUrouter embeddings response did not include a data array');
			}

			for (const item of data) {
				if (!Array.isArray(item.embedding)) {
					throw new Error('EUrouter embeddings response item did not include an embedding');
				}

				embeddings.push(item.embedding);
			}
		}

		return embeddings;
	}

	async embedQuery(query: string): Promise<number[]> {
		const [embedding] = await this.embedDocuments([query]);

		if (embedding === undefined) {
			throw new Error('EUrouter embeddings response was empty');
		}

		return embedding;
	}

	private normalizeInputs(documents: string[]): string[] {
		if (!this.options.stripNewLines) {
			return documents;
		}

		return documents.map((document) => document.replace(/\n/g, ' '));
	}

	private buildRequestBody(input: string[]): EUrouterEmbeddingsRequestBody {
		return {
			model: this.options.model,
			input,
			...(this.options.dimensions !== undefined && this.options.dimensions > 0
				? { dimensions: this.options.dimensions }
				: {}),
		};
	}
}

function buildProviderParams(routing: EUrouterChatRouting): Record<string, unknown> | undefined {
	const provider: Record<string, unknown> = {};

	if (routing.sort) provider.sort = routing.sort;
	if (routing.order) provider.order = splitProviderList(routing.order);
	if (routing.only) provider.only = splitProviderList(routing.only);
	if (routing.ignore) provider.ignore = splitProviderList(routing.ignore);
	if (routing.allowFallbacks === false) provider.allow_fallbacks = false;
	if (routing.dataResidency) provider.data_residency = routing.dataResidency;
	if (routing.euOwned) provider.eu_owned = true;
	if (routing.maxRetentionDays !== undefined && routing.maxRetentionDays >= 0) {
		provider.max_retention_days = routing.maxRetentionDays;
	}
	if (routing.dataCollection) provider.data_collection = routing.dataCollection;

	return Object.keys(provider).length > 0 ? provider : undefined;
}

function splitProviderList(value: string): string[] | undefined {
	const items = value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item.length > 0);

	return items.length > 0 ? items : undefined;
}

function chunk<T>(items: T[], size: number): T[][] {
	const chunks: T[][] = [];

	for (let index = 0; index < items.length; index += size) {
		chunks.push(items.slice(index, index + size));
	}

	return chunks;
}

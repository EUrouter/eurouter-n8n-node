import test from 'node:test';
import assert from 'node:assert/strict';

import {
	buildChatAdditionalParams,
	EUrouterEmbeddingsClient,
} from '../nodes/shared/eurouterAi.ts';

test('buildChatAdditionalParams maps routing controls into OpenAI-compatible params', () => {
	const params = buildChatAdditionalParams({
		responseFormat: 'json_object',
		routing: {
			sort: 'latency',
			order: 'scaleway, nebius',
			only: 'mistral',
			ignore: 'tensorix',
			allowFallbacks: false,
			dataResidency: 'eu',
			euOwned: true,
			maxRetentionDays: 0,
			dataCollection: 'deny',
		},
	});

	assert.deepEqual(params, {
		response_format: { type: 'json_object' },
		provider: {
			sort: 'latency',
			order: ['scaleway', 'nebius'],
			only: ['mistral'],
			ignore: ['tensorix'],
			allow_fallbacks: false,
			data_residency: 'eu',
			eu_owned: true,
			max_retention_days: 0,
			data_collection: 'deny',
		},
	});
});

test('EUrouterEmbeddingsClient batches embedding requests and strips new lines', async () => {
	const requests = [];
	const client = new EUrouterEmbeddingsClient({
		model: 'bge-m3',
		batchSize: 2,
		stripNewLines: true,
		timeout: 60_000,
		request: async (request) => {
			requests.push(request);

			return {
				data: request.body.input.map((input, index) => ({
					embedding: [requests.length, index, input.length],
				})),
			};
		},
	});

	const embeddings = await client.embedDocuments(['first\nline', 'second', 'third\nvalue']);

	assert.deepEqual(
		requests.map((request) => request.body),
		[
			{ model: 'bge-m3', input: ['first line', 'second'] },
			{ model: 'bge-m3', input: ['third value'] },
		],
	);
	assert.deepEqual(embeddings, [
		[1, 0, 10],
		[1, 1, 6],
		[2, 0, 11],
	]);
});

test('EUrouterEmbeddingsClient omits zero dimensions when embedding a query', async () => {
	let requestBody;
	const client = new EUrouterEmbeddingsClient({
		model: 'bge-m3',
		batchSize: 8,
		stripNewLines: false,
		dimensions: 0,
		timeout: 60_000,
		request: async (request) => {
			requestBody = request.body;

			return {
				data: [{ embedding: [0.1, 0.2, 0.3] }],
			};
		},
	});

	const embedding = await client.embedQuery('What is EUrouter?');

	assert.deepEqual(embedding, [0.1, 0.2, 0.3]);
	assert.deepEqual(requestBody, {
		model: 'bge-m3',
		input: ['What is EUrouter?'],
	});
});

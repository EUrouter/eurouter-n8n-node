import type { INodeProperties } from 'n8n-workflow';
import { embeddingsCreateDescription } from './create';

const showOnlyForEmbeddings = {
	resource: ['embeddings'],
};

export const embeddingsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForEmbeddings,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create embeddings',
				description: 'Create embeddings',
				routing: {
					request: {
						method: 'POST',
						url: '/embeddings',
						body:
							'={{Object.assign({}, (typeof $parameter.additionalParameters === "string" ? ($parameter.additionalParameters ? JSON.parse($parameter.additionalParameters) : {}) : ($parameter.additionalParameters ?? {})), { model: $parameter.model, input: $parameter.input })}}',
					},
				},
			},
		],
		default: 'create',
	},
	...embeddingsCreateDescription,
];

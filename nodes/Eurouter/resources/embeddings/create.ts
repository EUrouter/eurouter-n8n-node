import type { INodeProperties } from 'n8n-workflow';

const showOnlyForEmbeddingsCreate = {
	operation: ['create'],
	resource: ['embeddings'],
};

export const embeddingsCreateDescription: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForEmbeddingsCreate,
		},
		description: 'Model ID to use for embeddings',
	},
	{
		displayName: 'Input',
		name: 'input',
		type: 'string',
		typeOptions: {
			rows: 2,
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForEmbeddingsCreate,
		},
		description: 'Text to embed',
	},
	{
		displayName: 'Additional Parameters',
		name: 'additionalParameters',
		type: 'json',
		typeOptions: {
			rows: 5,
		},
		default: '{}',
		displayOptions: {
			show: showOnlyForEmbeddingsCreate,
		},
		description: 'Additional request body fields to include (for example, user)',
	},
];

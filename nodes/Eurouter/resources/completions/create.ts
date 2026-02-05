import type { INodeProperties } from 'n8n-workflow';

const showOnlyForCompletionsCreate = {
	operation: ['create'],
	resource: ['completions'],
};

export const completionsCreateDescription: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompletionsCreate,
		},
		description: 'Model ID to use for the completion',
	},
	{
		displayName: 'Prompt',
		name: 'prompt',
		type: 'string',
		typeOptions: {
			rows: 4,
		},
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForCompletionsCreate,
		},
		description: 'Prompt to complete',
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
			show: showOnlyForCompletionsCreate,
		},
		description:
			'Additional request body fields to include (for example, temperature, max_tokens, stop)',
	},
];

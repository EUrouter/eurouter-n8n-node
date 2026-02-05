import type { INodeProperties } from 'n8n-workflow';

const showOnlyForChatCreate = {
	operation: ['create'],
	resource: ['chat'],
};

export const chatCreateDescription: INodeProperties[] = [
	{
		displayName: 'Model',
		name: 'model',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: showOnlyForChatCreate,
		},
		description: 'Model ID to use for the chat completion',
	},
	{
		displayName: 'Messages',
		name: 'messages',
		type: 'json',
		typeOptions: {
			rows: 5,
		},
		default: '[]',
		required: true,
		displayOptions: {
			show: showOnlyForChatCreate,
		},
		description: 'Array of messages in OpenAI format (role/content)',
		placeholder: '[{"role":"user","content":"Hello"}]',
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
			show: showOnlyForChatCreate,
		},
		description:
			'Additional request body fields to include (for example, temperature, max_tokens, response_format)',
	},
];

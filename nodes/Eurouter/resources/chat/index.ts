import type { INodeProperties } from 'n8n-workflow';
import { chatCreateDescription } from './create';

const showOnlyForChat = {
	resource: ['chat'],
};

export const chatDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForChat,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a chat completion',
				description: 'Create a chat completion',
				routing: {
					request: {
						method: 'POST',
						url: '/chat/completions',
						body:
							'={{Object.assign({}, (typeof $parameter.additionalParameters === "string" ? ($parameter.additionalParameters ? JSON.parse($parameter.additionalParameters) : {}) : ($parameter.additionalParameters ?? {})), { model: $parameter.model, messages: (typeof $parameter.messages === "string" ? ($parameter.messages ? JSON.parse($parameter.messages) : []) : $parameter.messages) })}}',
					},
				},
			},
		],
		default: 'create',
	},
	...chatCreateDescription,
];

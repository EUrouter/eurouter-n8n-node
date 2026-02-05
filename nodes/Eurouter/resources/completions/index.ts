import type { INodeProperties } from 'n8n-workflow';
import { completionsCreateDescription } from './create';

const showOnlyForCompletions = {
	resource: ['completions'],
};

export const completionsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForCompletions,
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				action: 'Create a completion',
				description: 'Create a completion',
				routing: {
					request: {
						method: 'POST',
						url: '/completions',
						body:
							'={{Object.assign({}, (typeof $parameter.additionalParameters === "string" ? ($parameter.additionalParameters ? JSON.parse($parameter.additionalParameters) : {}) : ($parameter.additionalParameters ?? {})), { model: $parameter.model, prompt: $parameter.prompt })}}',
					},
				},
			},
		],
		default: 'create',
	},
	...completionsCreateDescription,
];

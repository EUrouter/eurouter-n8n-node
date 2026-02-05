import type { INodeProperties } from 'n8n-workflow';

const showOnlyForModels = {
	resource: ['models'],
};

export const modelsDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: showOnlyForModels,
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				action: 'Get models',
				description: 'Get available models',
				routing: {
					request: {
						method: 'GET',
						url: '/models',
					},
				},
			},
		],
		default: 'getAll',
	},
];

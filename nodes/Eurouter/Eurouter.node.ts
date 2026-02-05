import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { chatDescription } from './resources/chat';
import { completionsDescription } from './resources/completions';
import { embeddingsDescription } from './resources/embeddings';
import { modelsDescription } from './resources/models';

export class Eurouter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'EUrouter',
		name: 'eurouter',
		icon: { light: 'file:eurouter.svg', dark: 'file:eurouter.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with the EUrouter API',
		defaults: {
			name: 'EUrouter',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'eurouterApi', required: true }],
		requestDefaults: {
			baseURL: 'https://api.eurouter.ai/api/v1',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Chat',
						value: 'chat',
					},
					{
						name: 'Completion',
						value: 'completions',
					},
					{
						name: 'Embedding',
						value: 'embeddings',
					},
					{
						name: 'Model',
						value: 'models',
					},
				],
				default: 'chat',
			},
			...chatDescription,
			...completionsDescription,
			...embeddingsDescription,
			...modelsDescription,
		],
	};
}

import js from '@eslint/js';
import { n8nCommunityNodesPlugin } from '@n8n/eslint-plugin-community-nodes';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	{
		ignores: ['dist/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	n8nCommunityNodesPlugin.configs.recommended,
);

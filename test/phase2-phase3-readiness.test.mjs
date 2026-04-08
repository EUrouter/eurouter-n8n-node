import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, 'package.json');
const publishWorkflowPath = path.join(repoRoot, '.github', 'workflows', 'publish.yml');
const chatNodePath = path.join(repoRoot, 'nodes', 'EUrouterChatModel', 'EUrouterChatModel.node.ts');
const embeddingsNodePath = path.join(
	repoRoot,
	'nodes',
	'EUrouterEmbeddings',
	'EUrouterEmbeddings.node.ts',
);

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

test('Phase 2 adopts the official n8n node CLI and provenance-friendly release scripts', () => {
	assert.equal(packageJson.devDependencies['@n8n/node-cli'] !== undefined, true);
	assert.equal(packageJson.peerDependencies['@n8n/ai-node-sdk'] !== undefined, true);
	assert.equal(packageJson.scripts.build, 'n8n-node build');
	assert.equal(packageJson.scripts.dev, 'n8n-node dev');
	assert.equal(packageJson.scripts.lint, 'n8n-node lint');
	assert.equal(packageJson.scripts['lint:fix'], 'n8n-node lint --fix');
	assert.equal(packageJson.scripts.release, 'n8n-node release');
	assert.equal(packageJson.scripts.prepublishOnly, 'n8n-node prerelease');
	assert.equal(packageJson.devDependencies['@langchain/openai'], undefined);
	assert.equal(packageJson.peerDependencies['@langchain/openai'], undefined);
});

test('Phase 2 adds a GitHub Actions publish workflow with npm provenance permissions', () => {
	assert.equal(existsSync(publishWorkflowPath), true);

	const workflow = readFileSync(publishWorkflowPath, 'utf8');
	assert.match(workflow, /tags:\s*\n\s*-\s*'v\*\.\*\.\*'/);
	assert.match(workflow, /id-token:\s*write/);
	assert.match(workflow, /registry-url:\s*'https:\/\/registry\.npmjs\.org\/'/);
	assert.match(workflow, /npm run release/);
});

test('Phase 3 removes direct @langchain/openai imports from the node sources', () => {
	const chatNode = readFileSync(chatNodePath, 'utf8');
	const embeddingsNode = readFileSync(embeddingsNodePath, 'utf8');

	assert.doesNotMatch(chatNode, /@langchain\/openai/);
	assert.doesNotMatch(embeddingsNode, /@langchain\/openai/);
});

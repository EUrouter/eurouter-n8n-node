import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const packageJsonPath = path.join(repoRoot, 'package.json');
const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
const eslintConfigPath = path.join(repoRoot, 'eslint.config.mjs');
const calibrationGuidePath = path.join(repoRoot, 'docs', 'calibration-release.md');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

test('Phase 1 targets version 1.1.0 with a matching changelog entry', () => {
	assert.equal(packageJson.version, '1.1.0');
	assert.equal(existsSync(changelogPath), true);

	const changelog = readFileSync(changelogPath, 'utf8');
	assert.match(changelog, /^## \[?1\.1\.0\]?/m);
});

test('Phase 1 installs the official n8n community-node linting stack', () => {
	assert.equal(existsSync(eslintConfigPath), true);

	assert.equal(packageJson.devDependencies.eslint !== undefined, true);
	assert.equal(
		packageJson.devDependencies['@n8n/eslint-plugin-community-nodes'] !== undefined,
		true,
	);
});

test('Phase 1 includes a calibration release checklist', () => {
	assert.equal(existsSync(calibrationGuidePath), true);
	assert.equal(packageJson.scripts['release:check'] !== undefined, true);
});

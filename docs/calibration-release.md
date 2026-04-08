# Calibration Release Checklist

This Phase 1 checklist prepares the `1.1.0` calibration release described in GitHub issue `#9`.

## Goal

Publish `n8n-nodes-eurouter@1.1.0`, then run the official n8n scanner against the published package so we have real verification data before the larger refactor in issue `#6`.

## Before Publishing

1. Install dependencies with `npm install`.
2. Run `npm run test:phase1` to confirm the Phase 1 repo checks are present.
3. Run `npm run lint` and save the output.
4. Run `npm run release:check` to confirm the package builds and packs cleanly.

## Expected Lint Outcome

`npm run lint` is expected to surface current verification blockers. The most important one is the restricted runtime import from `@langchain/openai`, which is tracked separately in issue `#6`.

That failure is useful calibration data in Phase 1. Do not treat it as a reason to skip the release-prep steps above.

## Publish Window

As of 2026-04-08, direct `npm publish` is still accepted for community-node submissions until the 2026-05-01 provenance deadline. After 2026-05-01, releases need to move to the GitHub Actions provenance flow planned for issue `#5`.

## Publish And Scan

1. Publish the calibration build:
   `npm publish --access public`
2. Run the official scanner against the published package:
   `npm run scan:published -- n8n-nodes-eurouter@1.1.0`
3. Paste the scanner output into issue `#9` or a linked follow-up issue so the next phase has exact findings.

## Results

- `npm run lint`:
- `npm run release:check`:
- `npm run scan:published -- n8n-nodes-eurouter@1.1.0`:

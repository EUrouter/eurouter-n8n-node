# n8n-nodes-eurouter

This is an n8n community node. It lets you use EUrouter in your n8n workflows.

EUrouter is a European AI router that provides OpenAI-compatible endpoints for chat completions, text completions, embeddings, and model discovery.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- Chat: Create a chat completion
- Completions: Create a completion
- Embeddings: Create embeddings
- Models: Get available models

## Credentials

1. Create an EUrouter account and generate an API key in the EUrouter dashboard.
2. In n8n, create new credentials for **EUrouter API** and paste your API key.

The node sends requests to `https://api.eurouter.ai/api/v1` using `Authorization: Bearer <apiKey>`.

## Compatibility

- Requires n8n v1 or later (community nodes API v1).

## Usage

- **Chat** expects a JSON array of messages. Example:

  ```json
  [
    {"role": "user", "content": "Hello from EUrouter"}
  ]
  ```

- Use **Additional Parameters** to pass any OpenAI-compatible options (for example, `temperature`, `max_tokens`, or `response_format`).
- **Embeddings** input accepts a single string.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [EUrouter documentation](https://www.eurouter.ai/docs)

## Version history

- 0.1.0: Initial release.

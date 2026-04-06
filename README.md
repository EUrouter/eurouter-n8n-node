# n8n-nodes-eurouter

This is an [n8n](https://n8n.io/) community node for [EUrouter](https://www.eurouter.ai) — a European AI gateway providing access to 68+ EU-hosted, GDPR-friendly AI models through a single OpenAI-compatible API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Features

- **68+ AI models** — Claude, DeepSeek, Mistral, Qwen, Llama, GPT, and more
- **Dynamic model list** — Models are fetched live from the EUrouter API
- **EU data residency** — All inference routed through European providers (Scaleway, OVHcloud, Nebius, Mistral AI, etc.)
- **GDPR compliant** — No data leaves the EU
- **OpenAI-compatible** — Standard chat completions API

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-eurouter`
4. Agree to the risks and select **Install**

## Setup

1. Get an API key from [EUrouter](https://www.eurouter.ai)
2. In n8n, create a new **EUrouter** credential and enter your API key
3. Add the **EUrouter Chat Model** node to your workflow
4. Select a model from the dynamic dropdown
5. Connect it to an AI Chain or Agent node

## Nodes

### EUrouter Chat Model

Use any of EUrouter's 68+ models in your AI workflows. Works with AI Chains, Agents, and any node that accepts a Language Model input.

**Default model:** `claude-sonnet-4-6`

**Popular models:**
- `claude-sonnet-4-6` / `claude-opus-4-6` — Anthropic Claude
- `deepseek-r1` / `deepseek-v3` — DeepSeek reasoning and chat
- `mistral-large-3` — Mistral flagship
- `kimi-k2.5` — Moonshot multilingual
- `gpt-oss-120b` — OpenAI open-weight

## Resources

- [EUrouter Website](https://www.eurouter.ai)
- [EUrouter API Docs](https://www.eurouter.ai/docs)
- [Model Catalog](https://www.eurouter.ai/models)
- [n8n Community Nodes Docs](https://docs.n8n.io/integrations/community-nodes/)

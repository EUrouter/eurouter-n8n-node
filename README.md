# n8n-nodes-eurouter

The official [n8n](https://n8n.io/) community node for [EUrouter](https://www.eurouter.ai) — a European AI gateway giving you access to **100+ EU-hosted, GDPR-friendly AI models** through a single OpenAI-compatible API.

One credential. Two nodes. Every major open and proprietary model, served from European infrastructure (Scaleway, OVHcloud, Nebius, Mistral AI, and more) with full data-residency and provider-routing controls.

[![npm version](https://img.shields.io/npm/v/n8n-nodes-eurouter.svg)](https://www.npmjs.com/package/n8n-nodes-eurouter)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Why EUrouter?

- **EU data residency, by default.** All inference is routed through European providers. Optionally restrict to a specific country (DE, FR), the EEA, or providers headquartered in the EEA.
- **GDPR-friendly.** Configurable retention windows, opt-out of training data collection, and per-request provider whitelists.
- **One API, every model.** Claude, DeepSeek, Mistral, Qwen, Llama, GPT-OSS, Kimi — all behind the same OpenAI-compatible interface.
- **Smart routing.** Sort by price, latency, throughput, or EUrouter's default health/price² score. Automatic failover across providers.
- **Drop-in for n8n AI workflows.** Works as a sub-node for AI Agent, Basic LLM Chain, Question and Answer Chain, Summarization Chain, and any vector store.

---

## Nodes

This package ships two nodes and one credential type.

### EUrouter Chat Model

A Chat Model sub-node that plugs into any n8n AI Agent or Chain. Exposes the full EUrouter routing surface.

- **Output:** `AiLanguageModel`
- **Use with:** AI Agent, Basic LLM Chain, Q&A Chain, Summarization Chain, Sentiment Analysis, Information Extractor, anywhere a Chat Model is accepted
- **Default model:** `claude-sonnet-4-6`
- **Dynamic model list** — fetched live from `/models` so new releases appear without an update

### EUrouter Embeddings

An Embeddings sub-node for use with vector stores and RAG workflows. Exposes the **same provider routing and privacy controls** as the chat node — important, because embeddings often touch entire document corpora and are arguably more sensitive than chat from a data-residency standpoint.

- **Output:** `AiEmbedding`
- **Use with:** Pinecone, Qdrant, Supabase, PGVector, Simple Vector Store, and any other vector store node
- **Default model:** `bge-m3`
- **Dimension override** — supported for models like Qwen3 Embedding (32–4096)
- **Full routing controls** — data residency, EU-owned only, retention, training opt-out

### EUrouter API credential

One credential, used by both nodes. Includes optional [App Attribution](#app-attribution) overrides.

---

## Installation

### n8n Cloud / self-hosted UI

1. Open **Settings → Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-eurouter`
4. Acknowledge the risks and click **Install**

### Manual / Docker

```bash
npm install n8n-nodes-eurouter
```

For Docker, mount the package into your custom extensions directory or use the [community-nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

---

## Setup

1. Get an API key at [your dashboard](https://www.eurouter.ai/dashboard/keys)
2. In n8n, create a new credential of type **EUrouter API** and paste your key
3. Add an **EUrouter Chat Model** node to your workflow
4. Connect it to the **Language Model** input of an AI Agent or Chain
5. Pick a model from the dropdown (the list is fetched live)

That's it. The credential test calls `GET /models` and will turn green if your key is valid.

---

## Usage examples

### Chat Model with an AI Agent

```
[Chat Trigger] ──▶ [AI Agent] ──▶ [Response]
                       │
                       ▼
              [EUrouter Chat Model]
              model: claude-sonnet-4-6
```

### Retrieval-Augmented Generation (RAG)

```
[Embed]                       [Query]
   │                             │
   ▼                             ▼
[EUrouter Embeddings] ──▶ [Vector Store] ──▶ [Q&A Chain] ──▶ [Answer]
   model: bge-m3                                  │
                                                  ▼
                                       [EUrouter Chat Model]
                                       model: mistral-large-3
```

### Strict EU-only inference

In the **Routing** options of the Chat Model node:

- **Data Residency:** `EEA`
- **EU-Owned Providers Only:** `true`
- **Max Data Retention (Days):** `0`
- **Data Collection:** `Deny`

Every request is now guaranteed to hit an EEA-headquartered provider, with zero retention and no training-data opt-in.

---

## Chat Model options

### Generation

| Option | Default | Description |
|---|---|---|
| Sampling Temperature | `0.7` | 0–2. Lower is more deterministic. |
| Top P | `1` | Nucleus sampling. Prefer this *or* temperature, not both. |
| Frequency Penalty | `0` | -2 to 2. Discourages repetition. |
| Presence Penalty | `0` | -2 to 2. Encourages new topics. |
| Maximum Number of Tokens | `-1` | Hard cap on output tokens. `-1` for model default. |
| Response Format | `text` | Set to `json_object` for guaranteed-valid JSON. |
| Timeout | `360000` ms | Per-request timeout (6 minutes default — long enough for reasoning models). |
| Max Retries | `2` | Retries on transient failures. |

### Routing

These map to EUrouter's [`provider` request parameters](https://www.eurouter.ai/docs/concepts/routing).

| Option | Description |
|---|---|
| **Sort By** | `price`, `latency`, `throughput`, or default (health / price²) |
| **Provider Order** | Comma-separated provider slugs to try in priority order — e.g. `scaleway,nebius,tensorix` |
| **Only Use Providers** | Whitelist. Comma-separated slugs. |
| **Ignore Providers** | Blacklist. Comma-separated slugs. |
| **Allow Fallbacks** | If `false`, fail instead of trying another provider on error |
| **Data Residency** | `eu`, `eea`, `de`, `fr`, or any-EU (default) |
| **EU-Owned Providers Only** | Restrict to providers headquartered in the EEA |
| **Max Data Retention (Days)** | `0` for zero retention, `-1` for no cap |
| **Data Collection** | `allow` or `deny` providers from using your data for training |

### Model variants

You can append modifiers to any model ID to influence routing:

- `model-name:floor` — cheapest provider available
- `model-name:nitro` — fastest provider available
- `model-name:free` — only free providers (where applicable)

Example: `claude-sonnet-4-6:nitro`.

---

## Embeddings options

| Option | Default | Description |
|---|---|---|
| **Model** | `bge-m3` | Dynamic dropdown of embedding models |
| **Batch Size** | `512` | Documents per request (max 2048) |
| **Dimensions** | `0` | `0` = model default. Some models (e.g. Qwen3 Embedding) accept 32–4096. |
| **Strip New Lines** | `true` | Strip newlines before embedding |
| **Timeout** | `60000` ms | Per-request timeout |

---

## App Attribution

EUrouter tracks usage by application via three optional HTTP headers — see [App Attribution](https://www.eurouter.ai/docs/concepts/app-attribution) in the docs.

**By default, this node attributes all traffic to n8n** so you don't need to do anything. You'll see your usage in EUrouter analytics under the n8n bucket.

If you're embedding n8n inside your own product, agency platform, or SaaS, you can override the attribution per-credential:

| Credential field | Header | Default |
|---|---|---|
| **App URL** | `HTTP-Referer` | `https://n8n.io` |
| **App Title** | `X-EUrouter-Title` | `n8n` |
| **App Categories** | `X-EUrouter-Categories` | `programming-app,cloud-agent` |

App Categories must come from EUrouter's allowed list. Valid values include: `cli-agent`, `ide-extension`, `cloud-agent`, `programming-app`, `native-app-builder`, `creative-writing`, `video-gen`, `image-gen`, `writing-assistant`, `general-chat`, `personal-agent`, `roleplay`, `game`.

Just fill in the fields when you create the credential. Leave them blank to keep the n8n defaults.

---

## Self-hosting EUrouter

The credential's **Base URL** is hidden by default and points at `https://api.eurouter.ai/api/v1`. If you're running a self-hosted EUrouter instance, edit the credential type to expose the field, or set it programmatically.

---

## Troubleshooting

**The model dropdown is empty.**
The dropdown is populated by `GET /models` on the EUrouter base URL. Check the credential is saved with a valid API key, then re-open the node — the dropdown re-fetches on load. Test the credential to confirm.

**Requests time out on long reasoning runs.**
Increase **Timeout** in the node's Options. The default is 6 minutes — reasoning-heavy models (DeepSeek-R1, Claude with thinking enabled) can exceed this.

**An Agent with tool calls behaves oddly on a specific model.**
Try a different provider with the **Provider Order** routing option, or pin a specific provider via **Only Use Providers**. Some providers have known quirks with specific models' tool-calling formats.

**I'm getting rate-limited.**
EUrouter applies per-key and per-provider rate limits. Use **Allow Fallbacks** (on by default) so requests roll over to the next provider, or upgrade your plan at [eurouter.ai](https://www.eurouter.ai).

**My usage isn't showing up in my own app's bucket in EUrouter analytics.**
Check that you've set **App URL** and **App Title** in the credential. Without them, traffic is bucketed under n8n.

---

## Compatibility

- **n8n:** ≥ 1.0
- **Node.js:** ≥ 20.15
- **n8n nodes API version:** 1

This node uses the same `@langchain/openai` ChatOpenAI / OpenAIEmbeddings classes that n8n's native OpenAI, OpenRouter, DeepSeek, Mistral, and Groq nodes use, so behavior in Agents and Chains is identical to those nodes.

---

## Resources

- [EUrouter homepage](https://www.eurouter.ai)
- [EUrouter API docs](https://www.eurouter.ai/docs)
- [Model catalog](https://www.eurouter.ai/models)
- [Provider routing](https://www.eurouter.ai/docs/concepts/routing)
- [App attribution](https://www.eurouter.ai/docs/concepts/app-attribution)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

---

## License

[MIT](LICENSE) © EUrouter

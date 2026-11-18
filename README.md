# SEO Agent + existing n8n adapters — tested mock package, NOT production complete

## What works
- Python SEO agent with **exact full 6-provider outline sequence O1–O6 and 5-draft / 15-judge article sequence A1–A6**.
- Provider HTTP adapters for OpenAI, Anthropic, Gemini, Grok, DeepSeek and Perplexity (live endpoints/models must be verified with each account; no live credentials tested).
- Deterministic mock provider for validating stage routing and full 37-call trace.
- Approval gate: output always `awaiting_human_approval`, never auto-published.
- Original 36 n8n JSON adapter workflows included in `n8n_existing/` **unchanged**. They still require the missing Control API; they are NOT wired to this Python agent.

## Run
Python 3.11+; `pip install httpx`.
`python agent/seo_agent.py --input example_request.json --output result.json --profile full --mock`
`python -m unittest discover -s tests -v` (run from package root)
For live providers, omit `--mock` and inject the corresponding API keys as environment variables. Set `SEO_MODEL_<PROVIDER>` to supported model IDs for your account. **This will incur charges.**

## NOT IMPLEMENTED / NOT TESTED
- Real n8n import and execution (n8n/Docker unavailable in test environment).
- Control API backend, PostgreSQL state machine, Redis queues, S3, RAG ingestion/retrieval, site settings API, Telegram/email ingestion, YouTube/audio extraction, Google Sheets, DOCX delivery, security hardening and identity-bound tenant isolation.
- Provider live HTTP integrations; availability of default model IDs; token accounting; budget enforcement; semantic/factual quality; full JSON Schema checks; cross-provider context-window limits.
- Mock results are synthetic and NOT suitable for publication.

**Do not deploy as production or expose n8n webhooks until the missing backend and security checks are implemented.**

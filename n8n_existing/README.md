# SEO Automation — n8n Workflow Package (integration skeleton, NOT finished production system)

This package contains **36 real n8n workflow JSON exports** including the full requested stage topology (O1–O6 and A1–A6), input channels, approval and delivery stages. All workflows are disabled by default.

## Important limitation
The workflows are **integration adapters**, not a working end-to-end SEO engine. Their HTTP Request nodes invoke a **control-plane API that is NOT implemented in this package**. Importing workflows alone does not implement the provider calls, six-model consensus, RAG, file conversion, identity verification, scheduling, retries, Google Sheets or WordPress publishing. Never put these workflows on the public internet without authentication and a hardened gateway.

## Required control API contract
POST /v1/internal/intake/{api,telegram,email,whatsapp}
POST /v1/internal/jobs/lease
POST /v1/internal/stages/{stage}/execute
POST /v1/internal/jobs/complete
POST /v1/internal/control/{approve,cancel,status,config,resume}

The control plane must implement: authenticated channel binding, signed webhook verification where supported, durable state machine, ACL, tenant/project scoped RAG, model APIs and configurable model IDs, approval, SSRF protections, HTML sanitization, file storage, export, budget, idempotency and job leases. The site should edit settings through a privileged API; do not directly trust client-provided tenant_id or arbitrary settings.

## Import
1. Pin a tested n8n Docker version. The workflow node typeVersions must be checked against that running version.
2. Configure environment variables SEO_CONTROL_API_URL (trusted internal HTTPS endpoint) and SEO_INTERNAL_TOKEN (secret via secure environment injection; avoid exposing to untrusted Code nodes).
3. Import workflows/*.json one by one using the n8n UI or supported CLI. Keep inactive.
4. Implement and test control API endpoints and secure gateway. Ensure webhook paths are authenticated, especially control actions.
5. Activate only after integration and authorization tests.

## Static checks
JSON syntax, node name references, workflow shape and secrets patterns can be checked with tests/validate.py. These are NOT import tests or end-to-end execution tests.

## Architecture
Site UI → Authenticated API gateway → PostgreSQL job/state machine → n8n stage webhooks → control-plane stage executor → providers/storage → durable completion → approval → delivery.
The control-plane stage executor is missing and must be built before this is a functioning system.

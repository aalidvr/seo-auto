-- Apply to a dedicated PostgreSQL database; app role must not own these tables.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS seo_tenants (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL);
CREATE TABLE IF NOT EXISTS seo_projects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES seo_tenants(id), name text NOT NULL);
CREATE TABLE IF NOT EXISTS seo_sites (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tenant_id uuid NOT NULL REFERENCES seo_tenants(id), project_id uuid NOT NULL REFERENCES seo_projects(id), domain text NOT NULL);
CREATE TABLE IF NOT EXISTS seo_settings (tenant_id uuid NOT NULL,project_id uuid NOT NULL,site_id uuid NOT NULL,version integer NOT NULL DEFAULT 1,settings jsonb NOT NULL,updated_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(tenant_id,project_id,site_id));
CREATE TABLE IF NOT EXISTS seo_requests (id uuid PRIMARY KEY,tenant_id uuid NOT NULL,project_id uuid NOT NULL,site_id uuid NOT NULL,user_id text NOT NULL,channel text NOT NULL,content_type text NOT NULL,profile text NOT NULL CHECK(profile IN ('full','balanced','economy')),payload jsonb NOT NULL,status text NOT NULL DEFAULT 'received',idempotency_key text NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),UNIQUE(tenant_id,project_id,idempotency_key));
CREATE TABLE IF NOT EXISTS seo_jobs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),request_id uuid NOT NULL REFERENCES seo_requests(id),tenant_id uuid NOT NULL,project_id uuid NOT NULL,stage_id text NOT NULL,provider text,attempt integer NOT NULL DEFAULT 0,max_attempts integer NOT NULL DEFAULT 3,status text NOT NULL DEFAULT 'queued',lease_owner text,lease_expires_at timestamptz,deadline timestamptz,output jsonb,error_safe text,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(request_id,stage_id,provider,attempt));
CREATE TABLE IF NOT EXISTS seo_artifacts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),request_id uuid NOT NULL REFERENCES seo_requests(id),tenant_id uuid NOT NULL,project_id uuid NOT NULL,kind text NOT NULL,object_key text NOT NULL,sha256 text,approved boolean NOT NULL DEFAULT false,created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS seo_approvals (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),request_id uuid NOT NULL REFERENCES seo_requests(id),tenant_id uuid NOT NULL,project_id uuid NOT NULL,actor_id text NOT NULL,decision text NOT NULL CHECK(decision IN ('approve','reject','revise')),created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS seo_documents (id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL,project_id uuid NOT NULL,site_id uuid NOT NULL,source_key text NOT NULL,source_hash text NOT NULL,trust_level text NOT NULL DEFAULT 'unreviewed',metadata jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(tenant_id,project_id,site_id,source_hash));
CREATE TABLE IF NOT EXISTS seo_events (id bigserial PRIMARY KEY,request_id uuid,tenant_id uuid NOT NULL,project_id uuid NOT NULL,kind text NOT NULL,payload jsonb NOT NULL DEFAULT '{}',created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS seo_jobs_pending_idx ON seo_jobs(status,deadline,created_at);
CREATE INDEX IF NOT EXISTS seo_requests_tenant_idx ON seo_requests(tenant_id,project_id,site_id,status);
-- Enable RLS and configure FORCE ROW LEVEL SECURITY + policies for each application role before granting access.
ALTER TABLE seo_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_approvals ENABLE ROW LEVEL SECURITY;
-- No broad SELECT policies intentionally supplied: deny by default until identity-bound policies are installed.

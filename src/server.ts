import fs from 'node:fs';
import path from 'node:path';
import express, { NextFunction, Request, Response } from 'express';
import {
  AgentError,
  DEFAULT_MODELS,
  KEY_NAMES,
  PROVIDERS,
  Profile,
  SeoRequestInput,
} from './seoAgent.js';
import { controlStore } from './store.js';

const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const ROOT_DIR = process.cwd();

function readJsonFile<T>(relPath: string, fallback: T): T {
  try {
    const full = path.join(ROOT_DIR, relPath);
    return JSON.parse(fs.readFileSync(full, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function seedInitialExample(): void {
  const exampleReq = readJsonFile<SeoRequestInput | null>('example_request.json', null);
  const mockResult = readJsonFile<Record<string, unknown> | null>('mock_result.json', null);
  if (exampleReq && exampleReq.request_id) {
    const record = controlStore.intake('api', exampleReq, 'full');
    if (mockResult) {
      record.result = mockResult as unknown as typeof record.result;
      record.status = 'awaiting_human_approval';
      record.publish_allowed = false;
    }
  }
}

seedInitialExample();

const app = express();
app.use(express.json({ limit: '2mb' }));

// Internal token middleware for n8n control-plane endpoints when SEO_INTERNAL_TOKEN is configured
function checkInternalToken(req: Request, res: Response, next: NextFunction): void {
  const expected = process.env.SEO_INTERNAL_TOKEN;
  if (!expected) {
    next();
    return;
  }
  const provided = req.header('X-Internal-Token') || req.header('x-internal-token');
  if (provided !== expected) {
    res.status(401).json({ error: 'Unauthorized internal token' });
    return;
  }
  next();
}

function getProviderStatus() {
  return PROVIDERS.map((provider) => ({
    provider,
    envVar: KEY_NAMES[provider],
    configured: Boolean(process.env[KEY_NAMES[provider]]),
    model:
      process.env[`SEO_MODEL_${provider.toUpperCase()}`] || DEFAULT_MODELS[provider],
  }));
}

app.get(['/health', '/api/health'], (_req: Request, res: Response) => {
  res.json({
    ok: true,
    service: 'seo-auto',
    runtime: 'nodejs',
    port: PORT,
    providers: getProviderStatus(),
  });
});

app.get('/api/example', (_req: Request, res: Response) => {
  const exampleRequest = readJsonFile('example_request.json', {
    request_id: 'example-001',
    content_type: 'blog',
    primary_keyword: 'راهنمای سئو محلی',
    language: 'fa',
    locale: 'fa-IR',
    human_approval_required: true,
    user_instructions: 'محتوای فارسی با منابع قابل بررسی',
  });
  const controlConfig = readJsonFile('n8n_existing/config/control-plane.example.json', {});
  const n8nManifest = readJsonFile('n8n_existing/manifest.json', { workflows: [] });
  res.json({
    exampleRequest,
    controlConfig,
    n8nManifest,
  });
});

app.get('/api/requests', (_req: Request, res: Response) => {
  const items = Array.from(controlStore.requests.values()).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at)
  );
  res.json({ requests: items });
});

app.get('/api/requests/:id', (req: Request, res: Response) => {
  const item = controlStore.requests.get(String(req.params.id));
  if (!item) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(item);
});

app.post('/api/agent/run', async (req: Request, res: Response) => {
  try {
    const body = req.body as {
      request?: SeoRequestInput;
      profile?: Profile;
      mock?: boolean;
    };
    const requestPayload = (body.request ?? req.body) as SeoRequestInput;
    const profile: Profile = body.profile ?? 'full';
    const mock = body.mock ?? true;

    const record = await controlStore.runPipeline(requestPayload, {
      profile,
      mock,
      channel: 'api',
    });

    res.json({
      request_id: record.request_id,
      record,
      ...record.result,
    });
  } catch (err) {
    const status = err instanceof AgentError ? 400 : 500;
    res.status(status).json({
      error: err instanceof Error ? err.message : 'Execution failed',
    });
  }
});

// --- n8n Control-Plane API Contract (/v1/internal/*) ---

app.post('/v1/internal/intake/:channel', checkInternalToken, (req: Request, res: Response) => {
  const channel = String(req.params.channel);
  if (!['api', 'telegram', 'email', 'whatsapp'].includes(channel)) {
    res.status(400).json({ error: 'Unsupported intake channel' });
    return;
  }
  const payload = req.body as SeoRequestInput;
  if (!payload || !payload.primary_keyword || !payload.content_type) {
    res.status(400).json({ error: 'Missing primary_keyword/content_type' });
    return;
  }
  if (payload.human_approval_required === false) {
    res.status(400).json({ error: 'Human approval cannot be bypassed' });
    return;
  }
  const profile =
    (payload.budget_profile === 'full_consensus'
      ? 'full'
      : (payload.budget_profile as Profile | undefined)) || 'full';
  const record = controlStore.intake(channel, payload, profile);
  res.status(202).json({
    accepted: true,
    request_id: record.request_id,
    status: record.status,
    publish_allowed: record.publish_allowed,
  });
});

app.post('/v1/internal/jobs/lease', checkInternalToken, (req: Request, res: Response) => {
  const { request_id, stage_id, lease_owner } = req.body as {
    request_id?: string;
    stage_id?: string;
    lease_owner?: string;
  };
  if (!request_id || !stage_id) {
    res.status(400).json({ error: 'Missing request_id or stage_id' });
    return;
  }
  const lease = {
    lease_owner: lease_owner || 'node-control-plane',
    stage_id,
    leased_at: new Date().toISOString(),
  };
  controlStore.leases.set(`${request_id}:${stage_id}`, lease);
  res.json({ ok: true, request_id, ...lease });
});

app.post('/v1/internal/stages/:stage/execute', checkInternalToken, async (req: Request, res: Response) => {
  try {
    const stage = String(req.params.stage);
    const { request_id, request, profile, mock } = req.body as {
      request_id?: string;
      request?: SeoRequestInput;
      profile?: Profile;
      mock?: boolean;
    };
    const existing = request_id ? controlStore.requests.get(request_id) : undefined;
    const payload = request ?? existing?.request;
    if (!payload) {
      res.status(404).json({ error: 'Request not found for stage execution' });
      return;
    }
    const record = await controlStore.runPipeline(payload, {
      profile: profile ?? existing?.profile ?? 'full',
      mock: mock ?? true,
      channel: existing?.channel ?? 'api',
    });
    res.json({
      ok: true,
      stage,
      request_id: record.request_id,
      status: record.status,
      publish_allowed: record.publish_allowed,
      result: record.result,
    });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Stage execution error' });
  }
});

app.post('/v1/internal/jobs/complete', checkInternalToken, (req: Request, res: Response) => {
  const { request_id } = req.body as { request_id?: string };
  if (!request_id) {
    res.status(400).json({ error: 'Missing request_id' });
    return;
  }
  const record = controlStore.requests.get(request_id);
  if (!record) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json({ ok: true, request_id, status: record.status, publish_allowed: record.publish_allowed });
});

app.post('/v1/internal/control/approve', checkInternalToken, (req: Request, res: Response) => {
  const { request_id, decision, actor_id, notes } = req.body as {
    request_id?: string;
    decision?: 'approve' | 'reject' | 'revise';
    actor_id?: string;
    notes?: string;
  };
  if (!request_id || !decision || !['approve', 'reject', 'revise'].includes(decision)) {
    res.status(400).json({ error: 'Valid request_id and decision (approve|reject|revise) required' });
    return;
  }
  const updated = controlStore.decideApproval(request_id, decision, actor_id, notes);
  if (!updated) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(updated);
});

app.post('/v1/internal/control/cancel', checkInternalToken, (req: Request, res: Response) => {
  const { request_id } = req.body as { request_id?: string };
  if (!request_id) {
    res.status(400).json({ error: 'Missing request_id' });
    return;
  }
  const updated = controlStore.cancel(request_id);
  if (!updated) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(updated);
});

app.post('/v1/internal/control/status', checkInternalToken, (req: Request, res: Response) => {
  const { request_id } = req.body as { request_id?: string };
  if (!request_id) {
    res.status(400).json({ error: 'Missing request_id' });
    return;
  }
  const record = controlStore.requests.get(request_id);
  if (!record) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(record);
});

app.post('/v1/internal/control/config', checkInternalToken, (req: Request, res: Response) => {
  const { site_id, settings } = req.body as {
    site_id?: string;
    settings?: Record<string, unknown>;
  };
  const key = site_id || 'default-site';
  const saved = controlStore.updateConfig(key, settings ?? {});
  res.json({ ok: true, site_id: key, settings: saved });
});

app.post('/v1/internal/control/resume', checkInternalToken, (req: Request, res: Response) => {
  const { request_id, notes } = req.body as { request_id?: string; notes?: string };
  if (!request_id) {
    res.status(400).json({ error: 'Missing request_id' });
    return;
  }
  const updated = controlStore.resume(request_id, notes);
  if (!updated) {
    res.status(404).json({ error: 'Request not found' });
    return;
  }
  res.json(updated);
});

// Serve static frontend console
const publicDir = path.join(ROOT_DIR, 'public');
app.use(express.static(publicDir));
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`SEO Auto control-plane server listening on http://${HOST}:${PORT}`);
});

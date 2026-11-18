import fs from 'node:fs';
import path from 'node:path';
import express, { NextFunction, Request, Response } from 'express';
import {
  AgentError,
  DEFAULT_MODELS,
  KEY_NAMES,
  PROVIDERS,
  Profile,
  SeoAgentResult,
  SeoRequestInput,
} from './seoAgent.js';
import {
  ExecutionMode,
  InputMode,
  SourceAssetItem,
  controlStore,
} from './store.js';
import {
  loadAllN8nWorkflows,
  loadAllSeoSkills,
  loadControlPlaneArtifacts,
} from './n8nRegistry.js';
import {
  extractStructuredAsset,
  isGeminiConfigured,
  transcribeAudioAsset,
} from './geminiService.js';
import { buildCmsHtml, buildSheetsRow, runSeoQa } from './seoQa.js';

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
  const mockResult = readJsonFile<SeoAgentResult | null>('mock_result.json', null);
  if (exampleReq && exampleReq.request_id) {
    const record = controlStore.intake('api', exampleReq, 'full', 'keyword', []);
    if (mockResult) {
      const html = buildCmsHtml(exampleReq, mockResult);
      const qa = runSeoQa(html, {
        keyword: exampleReq.primary_keyword,
        locale: exampleReq.locale || exampleReq.language,
        contentType: exampleReq.content_type,
      });
      record.result = mockResult;
      record.generated_html = html;
      record.qa_report = qa;
      record.sheets_csv = buildSheetsRow(exampleReq.request_id, exampleReq, 'awaiting_human_approval', qa);
      record.status = 'awaiting_human_approval';
      record.publish_allowed = false;
      const now = record.updated_at;
      record.stage_executions = [
        { stageId: 'normalize', workflowFile: '10_stage_normalize.json', label: 'Normalize & Validate', status: 'completed', summary: 'Seeded from example_request.json', timestamp: now },
        { stageId: 'outline_o1', workflowFile: '16_stage_outline_o1.json', label: 'Outline O1 Candidates', status: 'completed', summary: '6 provider candidates', timestamp: now },
        { stageId: 'outline_o6', workflowFile: '21_stage_outline_o6.json', label: 'Outline O6 Final', status: 'completed', summary: 'Final outline locked', timestamp: now },
        { stageId: 'article_a1', workflowFile: '22_stage_article_a1.json', label: 'Article A1 Independent Drafts', status: 'completed', summary: '5 provider drafts', timestamp: now },
        { stageId: 'article_a2', workflowFile: '23_stage_article_a2.json', label: 'Article A2 Judge Matrix', status: 'completed', summary: '15 judge evaluations', timestamp: now },
        { stageId: 'article_a6', workflowFile: '27_stage_article_a6.json', label: 'Article A6 Final Edit', status: 'completed', summary: '37 total model calls', timestamp: now },
        { stageId: 'factcheck', workflowFile: '28_stage_factcheck.json', label: 'Fact Check & SEO QA', status: 'completed', summary: `${qa.fails.length} fail(s), ${qa.warnings.length} warning(s)`, timestamp: now },
        { stageId: 'html', workflowFile: '30_stage_html.json', label: 'HTML & JSON-LD', status: 'completed', summary: 'Semantic HTML ready', timestamp: now },
        { stageId: 'approval', workflowFile: '31_stage_approval.json', label: 'Human Review Gate', status: 'awaiting_approval', summary: 'Waiting for human approval', timestamp: now },
      ];
    }
  }
}

seedInitialExample();

const app = express();
app.use(express.json({ limit: '25mb' }));

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
    geminiReady: isGeminiConfigured(),
    providers: getProviderStatus(),
  });
});

app.get('/api/example', (_req: Request, res: Response) => {
  const artifacts = loadControlPlaneArtifacts();
  res.json({
    exampleRequest: artifacts.exampleRequest,
    controlConfig: artifacts.controlConfig,
    n8nManifest: artifacts.manifest,
    requestSchema: artifacts.requestSchema,
  });
});

// --- n8n Workflow & Skill Inspection + Trigger API ---

app.get('/api/n8n/workflows', (_req: Request, res: Response) => {
  const workflows = loadAllN8nWorkflows();
  res.json({
    count: workflows.length,
    workflows,
    recentTriggers: controlStore.workflowTriggers.slice(0, 20),
  });
});

app.get('/api/n8n/skills', (_req: Request, res: Response) => {
  res.json({
    skills: loadAllSeoSkills(),
  });
});

app.post('/api/n8n/trigger', (req: Request, res: Response) => {
  const { workflowFile, payload } = req.body as {
    workflowFile?: string;
    payload?: Record<string, unknown>;
  };
  const workflows = loadAllN8nWorkflows();
  const wf = workflows.find((w) => w.file === workflowFile);
  if (!wf) {
    res.status(404).json({ error: 'Workflow file not found' });
    return;
  }

  const entry = {
    id: crypto.randomUUID(),
    workflowFile: wf.file,
    webhookPath: wf.webhookPath || '',
    status: 200,
    timestamp: new Date().toISOString(),
    payload: {
      workflow: wf.name,
      webhook: wf.webhookPath ? `/webhook/${wf.webhookPath}` : null,
      internalEndpoints: wf.internalEndpoints,
      input: payload ?? {},
      note: 'Validated envelope and routed to Node.js control-plane handler.',
    },
  };
  controlStore.workflowTriggers.unshift(entry);
  res.json(entry);
});

// --- Multi-Modal Asset Processing (Voice Recording, YouTube, Video, Docs) ---

app.post('/api/assets/transcribe', async (req: Request, res: Response) => {
  try {
    const { base64Audio, mimeType, languageHint } = req.body as {
      base64Audio?: string;
      mimeType?: string;
      languageHint?: string;
    };
    if (!base64Audio) {
      res.status(400).json({ error: 'Audio payload (base64Audio) is required.' });
      return;
    }
    const result = await transcribeAudioAsset({
      base64Audio,
      mimeType: mimeType || 'audio/webm',
      languageHint,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Audio transcription failed',
    });
  }
});

app.post('/api/assets/extract', async (req: Request, res: Response) => {
  try {
    const { kind, title, url, rawText, language } = req.body as {
      kind?: 'youtube' | 'video' | 'document' | 'text';
      title?: string;
      url?: string;
      rawText?: string;
      language?: string;
    };
    if (!kind || (!url && !rawText)) {
      res.status(400).json({ error: 'Provide kind plus url or rawText.' });
      return;
    }
    const extracted = await extractStructuredAsset({
      kind,
      title,
      url,
      rawText,
      language,
    });
    res.json(extracted);
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Asset extraction failed',
    });
  }
});

// --- Requests & Agent Pipeline ---

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
      executionMode?: ExecutionMode;
      channel?: string;
      inputMode?: InputMode;
      sourceAssets?: SourceAssetItem[];
    };
    const requestPayload = (body.request ?? req.body) as SeoRequestInput;
    const profile: Profile = body.profile ?? 'full';
    const executionMode: ExecutionMode =
      body.executionMode ?? (body.mock === false ? 'multi_provider_live' : 'mock');

    const record = await controlStore.runPipeline(requestPayload, {
      profile,
      executionMode,
      channel: body.channel ?? 'api',
      inputMode: body.inputMode ?? ((requestPayload.input_mode as InputMode | undefined) || 'keyword'),
      sourceAssets: body.sourceAssets ?? [],
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

// --- Site Config ---

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    site_id: 'default-site',
    settings: controlStore.siteConfigs.get('default-site') ?? {},
  });
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
  const inputMode = (payload.input_mode as InputMode | undefined) || 'keyword';
  const record = controlStore.intake(channel, payload, profile, inputMode);
  res.status(202).json({
    accepted: true,
    request_id: record.request_id,
    channel,
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
    const { request_id, request, profile, mock, executionMode } = req.body as {
      request_id?: string;
      request?: SeoRequestInput;
      profile?: Profile;
      mock?: boolean;
      executionMode?: ExecutionMode;
    };
    const existing = request_id ? controlStore.requests.get(request_id) : undefined;
    const payload = request ?? existing?.request;
    if (!payload) {
      res.status(404).json({ error: 'Request not found for stage execution' });
      return;
    }
    const record = await controlStore.runPipeline(payload, {
      profile: profile ?? existing?.profile ?? 'full',
      executionMode: executionMode ?? (mock === false ? 'multi_provider_live' : 'mock'),
      channel: existing?.channel ?? 'api',
      inputMode: existing?.input_mode ?? 'keyword',
      sourceAssets: existing?.source_assets ?? [],
    });
    res.json({
      ok: true,
      stage,
      request_id: record.request_id,
      status: record.status,
      publish_allowed: record.publish_allowed,
      result: record.result,
      record,
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

// Serve built Vite React frontend from dist/client
const clientDistDir = path.join(ROOT_DIR, 'dist', 'client');
app.use(express.static(clientDistDir));
app.use((_req: Request, res: Response) => {
  res.sendFile(path.join(clientDistDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`SEO Auto control-plane server listening on http://${HOST}:${PORT}`);
});

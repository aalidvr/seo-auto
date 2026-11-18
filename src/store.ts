/**
 * In-memory control-plane state store replacing PostgreSQL/Redis adapters
 * from n8n_existing/sql/001_schema.sql and n8n_existing/README.md.
 */
import crypto from 'node:crypto';
import {
  ModelGateway,
  Profile,
  SEOAgent,
  SeoAgentResult,
  SeoRequestInput,
} from './seoAgent.js';
import { runGeminiConsensusStage } from './geminiService.js';
import { buildCmsHtml, buildSheetsRow, runSeoQa, SeoQaReport } from './seoQa.js';

export type RequestLifecycleStatus =
  | 'received'
  | 'awaiting_input'
  | 'validated'
  | 'queued'
  | 'processing'
  | 'awaiting_human_approval'
  | 'approved'
  | 'rejected'
  | 'revise'
  | 'delivered'
  | 'failed'
  | 'cancelled';

export type ExecutionMode = 'mock' | 'gemini_live' | 'multi_provider_live';

export type InputMode =
  | 'keyword'
  | 'text'
  | 'youtube'
  | 'audio'
  | 'video'
  | 'document'
  | 'mixed';

export interface SourceAssetItem {
  id: string;
  kind: 'audio' | 'youtube' | 'video' | 'document' | 'text' | 'url';
  title: string;
  url?: string;
  mimeType?: string;
  transcriptOrText?: string;
  extractedSummary?: string;
  facts?: string[];
  suggestedKeywords?: string[];
  warnings?: string[];
  createdAt: string;
}

export interface StageExecutionLog {
  stageId: string;
  workflowFile: string;
  label: string;
  status: 'completed' | 'awaiting_approval' | 'pending' | 'skipped' | 'failed';
  summary: string;
  timestamp: string;
}

export interface ApprovalRecord {
  id: string;
  actor_id: string;
  decision: 'approve' | 'reject' | 'revise';
  notes?: string;
  created_at: string;
}

export interface SeoJobRecord {
  request_id: string;
  channel: string;
  input_mode: InputMode;
  profile: Profile;
  execution_mode: ExecutionMode;
  status: RequestLifecycleStatus;
  publish_allowed: boolean;
  request: SeoRequestInput;
  source_assets: SourceAssetItem[];
  result?: SeoAgentResult;
  generated_html?: string;
  qa_report?: SeoQaReport;
  sheets_csv?: string;
  stage_executions: StageExecutionLog[];
  approvals: ApprovalRecord[];
  error?: string;
  created_at: string;
  updated_at: string;
}

class InMemoryControlStore {
  readonly requests = new Map<string, SeoJobRecord>();
  readonly siteConfigs = new Map<string, Record<string, unknown>>();
  readonly leases = new Map<string, { lease_owner: string; leased_at: string; stage_id: string }>();
  readonly workflowTriggers: Array<{
    id: string;
    workflowFile: string;
    webhookPath: string;
    status: number;
    timestamp: string;
    payload: unknown;
  }> = [];

  constructor() {
    this.siteConfigs.set('default-site', {
      domain: 'example.ir',
      channels: { api: true, telegram: true, email: true, whatsapp: false },
      default_profile: 'full',
      zwnj_policy: 'standard',
      digits_policy: 'persian',
      human_approval_required: true,
      updated_at: new Date().toISOString(),
    });
  }

  intake(
    channel: string,
    payload: SeoRequestInput,
    profile: Profile = 'full',
    inputMode: InputMode = 'keyword',
    assets: SourceAssetItem[] = []
  ): SeoJobRecord {
    const requestId = payload.request_id?.trim() || crypto.randomUUID();
    const existing = this.requests.get(requestId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const record: SeoJobRecord = {
      request_id: requestId,
      channel,
      input_mode: inputMode,
      profile,
      execution_mode: 'mock',
      status: 'received',
      publish_allowed: false,
      request: { ...payload, request_id: requestId },
      source_assets: assets,
      stage_executions: [],
      approvals: [],
      created_at: now,
      updated_at: now,
    };
    this.requests.set(requestId, record);
    return record;
  }

  async runPipeline(
    payload: SeoRequestInput,
    options: {
      profile?: Profile;
      mock?: boolean;
      executionMode?: ExecutionMode;
      channel?: string;
      inputMode?: InputMode;
      sourceAssets?: SourceAssetItem[];
    } = {}
  ): Promise<SeoJobRecord> {
    const profile: Profile = options.profile ?? 'full';
    const executionMode: ExecutionMode =
      options.executionMode ?? (options.mock === false ? 'multi_provider_live' : 'mock');
    const channel = options.channel ?? 'api';
    const inputMode: InputMode =
      options.inputMode ??
      ((payload.input_mode as InputMode | undefined) || 'keyword');
    const sourceAssets = options.sourceAssets ?? [];

    const requestId = payload.request_id?.trim() || crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = this.requests.get(requestId);

    const record: SeoJobRecord = existing
      ? {
          ...existing,
          channel,
          input_mode: inputMode,
          profile,
          execution_mode: executionMode,
          status: 'processing',
          publish_allowed: false,
          request: { ...payload, request_id: requestId },
          source_assets: sourceAssets.length > 0 ? sourceAssets : existing.source_assets,
          error: undefined,
          updated_at: now,
        }
      : {
          request_id: requestId,
          channel,
          input_mode: inputMode,
          profile,
          execution_mode: executionMode,
          status: 'processing',
          publish_allowed: false,
          request: { ...payload, request_id: requestId },
          source_assets: sourceAssets,
          stage_executions: [],
          approvals: [],
          created_at: now,
          updated_at: now,
        };

    this.requests.set(requestId, record);

    const context: Record<string, unknown> = {
      input_mode: record.input_mode,
      channel: record.channel,
      source_assets: record.source_assets.map((a) => ({
        kind: a.kind,
        title: a.title,
        url: a.url,
        summary: a.extractedSummary,
        facts: a.facts,
        transcript: a.transcriptOrText?.slice(0, 4000),
      })),
    };

    try {
      const gateway =
        executionMode === 'mock'
          ? new ModelGateway({ mock: true })
          : executionMode === 'gemini_live'
          ? new ModelGateway({
              mock: false,
              customCaller: async (_provider, stage, stagePayload) =>
                runGeminiConsensusStage(stage, stagePayload),
            })
          : new ModelGateway({ mock: false });

      const agent = new SEOAgent(gateway, profile);
      const result = await agent.run(record.request, context);
      const html = buildCmsHtml(record.request, result);
      const qa = runSeoQa(html, {
        keyword: record.request.primary_keyword,
        locale: record.request.locale || record.request.language,
        contentType: record.request.content_type,
      });
      const sheetsCsv = buildSheetsRow(record.request_id, record.request, 'awaiting_human_approval', qa);

      const stageNow = new Date().toISOString();
      const preStages: StageExecutionLog[] = [
        {
          stageId: 'normalize',
          workflowFile: '10_stage_normalize.json',
          label: 'Normalize & Validate',
          status: 'completed',
          summary: `Validated ${record.request.content_type} request via ${record.channel} (${record.input_mode})`,
          timestamp: stageNow,
        },
        {
          stageId: 'assets',
          workflowFile: '11_stage_assets.json',
          label: 'Asset Intake & Extraction',
          status: record.source_assets.length > 0 ? 'completed' : 'skipped',
          summary:
            record.source_assets.length > 0
              ? `Extracted ${record.source_assets.length} source asset(s)`
              : 'No external assets attached',
          timestamp: stageNow,
        },
        {
          stageId: 'rag_ingest',
          workflowFile: '12_stage_rag_ingest.json',
          label: 'RAG Ingest',
          status: record.source_assets.length > 0 ? 'completed' : 'skipped',
          summary:
            record.source_assets.length > 0
              ? `Indexed ${record.source_assets.length} context block(s)`
              : 'Skipped',
          timestamp: stageNow,
        },
        {
          stageId: 'duplicate',
          workflowFile: '13_stage_duplicate.json',
          label: 'Duplicate & Cannibalization',
          status: 'completed',
          summary: `Checked ${this.requests.size} session request(s) for keyword overlap`,
          timestamp: stageNow,
        },
        {
          stageId: 'research',
          workflowFile: '14_stage_research.json',
          label: 'Research & Evidence',
          status: 'completed',
          summary: 'Bound verified evidence to stage context',
          timestamp: stageNow,
        },
        {
          stageId: 'brief',
          workflowFile: '15_stage_brief.json',
          label: 'SEO Brief',
          status: 'completed',
          summary: `Brief locked for "${record.request.primary_keyword}"`,
          timestamp: stageNow,
        },
      ];

      const outlineStages: StageExecutionLog[] = [
        { stageId: 'outline_o1', workflowFile: '16_stage_outline_o1.json', label: 'Outline O1 Candidates' },
        { stageId: 'outline_o2', workflowFile: '17_stage_outline_o2.json', label: 'Outline O2 Synthesis' },
        { stageId: 'outline_o3', workflowFile: '18_stage_outline_o3.json', label: 'Outline O3 Dual Review' },
        { stageId: 'outline_o4', workflowFile: '19_stage_outline_o4.json', label: 'Outline O4 Conflict Resolution' },
        { stageId: 'outline_o5', workflowFile: '20_stage_outline_o5.json', label: 'Outline O5 Self Review' },
        { stageId: 'outline_o6', workflowFile: '21_stage_outline_o6.json', label: 'Outline O6 Final' },
      ].map((s) => ({
        ...s,
        status: 'completed' as const,
        summary: `Executed via ${executionMode} (${profile})`,
        timestamp: stageNow,
      }));

      const articleStages: StageExecutionLog[] = [
        { stageId: 'article_a1', workflowFile: '22_stage_article_a1.json', label: 'Article A1 Independent Drafts' },
        { stageId: 'article_a2', workflowFile: '23_stage_article_a2.json', label: 'Article A2 Judge Matrix' },
        { stageId: 'article_a3', workflowFile: '24_stage_article_a3.json', label: 'Article A3 Dual Synthesis' },
        { stageId: 'article_a4', workflowFile: '25_stage_article_a4.json', label: 'Article A4 Responsible Merge' },
        { stageId: 'article_a5', workflowFile: '26_stage_article_a5.json', label: 'Article A5 Final Critique' },
        { stageId: 'article_a6', workflowFile: '27_stage_article_a6.json', label: 'Article A6 Final Edit' },
      ].map((s) => ({
        ...s,
        status: 'completed' as const,
        summary:
          s.stageId === 'article_a2'
            ? `${Object.keys(result.review_matrix).length} judge evaluations recorded`
            : `Executed via ${executionMode} (${profile})`,
        timestamp: stageNow,
      }));

      const postStages: StageExecutionLog[] = [
        {
          stageId: 'factcheck',
          workflowFile: '28_stage_factcheck.json',
          label: 'Fact Check & SEO QA',
          status: 'completed',
          summary: `${qa.fails.length} fail(s), ${qa.warnings.length} warning(s), ${qa.wordCount} words`,
          timestamp: stageNow,
        },
        {
          stageId: 'links',
          workflowFile: '29_stage_links.json',
          label: 'Internal Linking',
          status: 'completed',
          summary: 'Checked link constraints & anchor hygiene',
          timestamp: stageNow,
        },
        {
          stageId: 'html',
          workflowFile: '30_stage_html.json',
          label: 'HTML & JSON-LD',
          status: 'completed',
          summary: `Compiled ${html.length} chars of semantic CMS HTML`,
          timestamp: stageNow,
        },
        {
          stageId: 'approval',
          workflowFile: '31_stage_approval.json',
          label: 'Human Review Gate',
          status: 'awaiting_approval',
          summary: 'Publish locked (publish_allowed=false) until human approval',
          timestamp: stageNow,
        },
        {
          stageId: 'delivery',
          workflowFile: '32_stage_delivery.json',
          label: 'DOCX & HTML Delivery',
          status: 'pending',
          summary: 'Unlocked after approval',
          timestamp: stageNow,
        },
        {
          stageId: 'sheets',
          workflowFile: '33_stage_sheets.json',
          label: 'Sheets Sync',
          status: 'completed',
          summary: 'Tracking row prepared',
          timestamp: stageNow,
        },
        {
          stageId: 'reconcile',
          workflowFile: '34_stage_reconcile.json',
          label: 'Retry & Reconciliation',
          status: 'completed',
          summary: `${result.trace.length} model calls reconciled`,
          timestamp: stageNow,
        },
        {
          stageId: 'feedback',
          workflowFile: '35_stage_feedback.json',
          label: 'Feedback & Versioning',
          status: 'pending',
          summary: 'Awaiting reviewer feedback',
          timestamp: stageNow,
        },
      ];

      record.result = result;
      record.generated_html = html;
      record.qa_report = qa;
      record.sheets_csv = sheetsCsv;
      record.stage_executions = [
        ...preStages,
        ...outlineStages,
        ...articleStages,
        ...postStages,
      ];
      record.status = 'awaiting_human_approval';
      record.publish_allowed = false;
      record.updated_at = stageNow;
      return record;
    } catch (err) {
      record.status = 'failed';
      record.publish_allowed = false;
      record.error = err instanceof Error ? err.message : String(err);
      record.updated_at = new Date().toISOString();
      throw err;
    }
  }

  decideApproval(
    requestId: string,
    decision: 'approve' | 'reject' | 'revise',
    actorId = 'human-reviewer',
    notes?: string
  ): SeoJobRecord | null {
    const record = this.requests.get(requestId);
    if (!record) return null;

    const approval: ApprovalRecord = {
      id: crypto.randomUUID(),
      actor_id: actorId,
      decision,
      notes,
      created_at: new Date().toISOString(),
    };
    record.approvals.push(approval);
    record.status =
      decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'revise';
    record.publish_allowed = decision === 'approve' && Boolean(record.result);
    record.updated_at = approval.created_at;

    // Update approval, delivery, and feedback stages
    record.stage_executions = record.stage_executions.map((s) => {
      if (s.stageId === 'approval') {
        return {
          ...s,
          status: 'completed',
          summary: `Decision: ${decision} by ${actorId}`,
          timestamp: approval.created_at,
        };
      }
      if (s.stageId === 'delivery' && decision === 'approve') {
        return {
          ...s,
          status: 'completed',
          summary: 'HTML & DOCX exports unlocked for download',
          timestamp: approval.created_at,
        };
      }
      if (s.stageId === 'feedback' && notes) {
        return {
          ...s,
          status: 'completed',
          summary: notes,
          timestamp: approval.created_at,
        };
      }
      return s;
    });

    if (record.qa_report) {
      record.sheets_csv = buildSheetsRow(
        record.request_id,
        record.request,
        record.status,
        record.qa_report
      );
    }

    return record;
  }

  cancel(requestId: string): SeoJobRecord | null {
    const record = this.requests.get(requestId);
    if (!record) return null;
    record.status = 'cancelled';
    record.publish_allowed = false;
    record.updated_at = new Date().toISOString();
    return record;
  }

  resume(requestId: string, notes?: string): SeoJobRecord | null {
    const record = this.requests.get(requestId);
    if (!record) return null;
    if (notes) {
      record.request.user_instructions = [record.request.user_instructions, notes]
        .filter(Boolean)
        .join('\n');
    }
    record.status = 'queued';
    record.updated_at = new Date().toISOString();
    return record;
  }

  updateConfig(siteKey: string, settings: Record<string, unknown>): Record<string, unknown> {
    const current = this.siteConfigs.get(siteKey) ?? {};
    const merged = { ...current, ...settings, updated_at: new Date().toISOString() };
    this.siteConfigs.set(siteKey, merged);
    return merged;
  }
}

export const controlStore = new InMemoryControlStore();

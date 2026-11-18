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
  profile: Profile;
  status: RequestLifecycleStatus;
  publish_allowed: boolean;
  request: SeoRequestInput;
  result?: SeoAgentResult;
  approvals: ApprovalRecord[];
  error?: string;
  created_at: string;
  updated_at: string;
}

class InMemoryControlStore {
  readonly requests = new Map<string, SeoJobRecord>();
  readonly siteConfigs = new Map<string, Record<string, unknown>>();
  readonly leases = new Map<string, { lease_owner: string; leased_at: string; stage_id: string }>();

  intake(channel: string, payload: SeoRequestInput, profile: Profile = 'full'): SeoJobRecord {
    const requestId = payload.request_id?.trim() || crypto.randomUUID();
    const existing = this.requests.get(requestId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const record: SeoJobRecord = {
      request_id: requestId,
      channel,
      profile,
      status: 'received',
      publish_allowed: false,
      request: { ...payload, request_id: requestId },
      approvals: [],
      created_at: now,
      updated_at: now,
    };
    this.requests.set(requestId, record);
    return record;
  }

  async runPipeline(
    payload: SeoRequestInput,
    options: { profile?: Profile; mock?: boolean; channel?: string } = {}
  ): Promise<SeoJobRecord> {
    const profile: Profile = options.profile ?? 'full';
    const mock = options.mock ?? true;
    const channel = options.channel ?? 'api';

    const requestId = payload.request_id?.trim() || crypto.randomUUID();
    const now = new Date().toISOString();
    const existing = this.requests.get(requestId);

    const record: SeoJobRecord = existing
      ? {
          ...existing,
          profile,
          status: 'processing',
          publish_allowed: false,
          request: { ...payload, request_id: requestId },
          error: undefined,
          updated_at: now,
        }
      : {
          request_id: requestId,
          channel,
          profile,
          status: 'processing',
          publish_allowed: false,
          request: { ...payload, request_id: requestId },
          approvals: [],
          created_at: now,
          updated_at: now,
        };

    this.requests.set(requestId, record);

    try {
      const agent = new SEOAgent(new ModelGateway({ mock }), profile);
      const result = await agent.run(record.request);
      record.result = result;
      record.status = 'awaiting_human_approval';
      record.publish_allowed = false;
      record.updated_at = new Date().toISOString();
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

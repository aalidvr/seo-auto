export type Profile = 'full' | 'balanced' | 'economy';
export type ExecutionMode = 'mock' | 'gemini_live' | 'multi_provider_live';
export type InputMode = 'keyword' | 'text' | 'youtube' | 'audio' | 'video' | 'document' | 'mixed';
export type ChannelType = 'api' | 'telegram' | 'email' | 'whatsapp';
export type ContentType = 'blog' | 'product' | 'advertorial' | 'local_seo' | 'landing';

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

export interface SeoQaReport {
  pass: boolean;
  wordCount: number;
  info: string[];
  warnings: string[];
  fails: string[];
}

export interface ApprovalRecord {
  id: string;
  actor_id: string;
  decision: 'approve' | 'reject' | 'revise';
  notes?: string;
  created_at: string;
}

export interface TraceEntry {
  stage: string;
  provider: string;
  sha256: string;
}

export interface SeoArticleOutput {
  stage?: string;
  provider?: string;
  id?: string;
  title?: string;
  meta_title?: string;
  meta_description?: string;
  sections?: Array<{ heading?: string; purpose?: string; content?: string }>;
  body?: string;
  faq?: Array<{ question?: string; answer?: string }>;
  issues?: string[];
  score?: number;
  decision?: string;
}

export interface SeoJobRecord {
  request_id: string;
  channel: string;
  input_mode: InputMode;
  profile: Profile;
  execution_mode: ExecutionMode;
  status: string;
  publish_allowed: boolean;
  request: {
    request_id?: string;
    primary_keyword: string;
    secondary_keywords?: string[];
    content_type: ContentType;
    input_mode?: InputMode;
    language?: string;
    locale?: string;
    target_location?: string | null;
    audience?: string;
    search_intent?: string;
    human_approval_required?: boolean;
    user_instructions?: string;
  };
  source_assets: SourceAssetItem[];
  result?: {
    status: string;
    profile: Profile;
    outline: SeoArticleOutput;
    article: SeoArticleOutput;
    review_matrix: Record<string, SeoArticleOutput>;
    trace: TraceEntry[];
    mock: boolean;
    publish_allowed: boolean;
  };
  generated_html?: string;
  qa_report?: SeoQaReport;
  sheets_csv?: string;
  stage_executions: StageExecutionLog[];
  approvals: ApprovalRecord[];
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface ProviderStatus {
  provider: string;
  envVar: string;
  configured: boolean;
  model: string;
}

export interface HealthResponse {
  ok: boolean;
  service: string;
  runtime: string;
  port: number;
  geminiReady: boolean;
  providers: ProviderStatus[];
}

export interface N8nNodeSummary {
  id: string;
  name: string;
  type: string;
  httpMethod?: string;
  webhookPath?: string;
  targetUrl?: string;
  jsCode?: string;
}

export interface N8nWorkflowDetail {
  file: string;
  name: string;
  category:
    | 'health'
    | 'ingress'
    | 'pre_pipeline'
    | 'outline_consensus'
    | 'article_consensus'
    | 'post_pipeline'
    | 'control';
  active: boolean;
  notes: string;
  nodeCount: number;
  webhookPath: string | null;
  httpMethod: string | null;
  internalEndpoints: string[];
  nodes: N8nNodeSummary[];
  connections: Record<string, unknown>;
}

export interface SeoSkillDetail {
  id: string;
  contentType: ContentType;
  title: string;
  description: string;
  hasTemplates: boolean;
  hasEvalCases: boolean;
  excerpt: string;
}

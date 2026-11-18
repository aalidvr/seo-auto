/**
 * Live inspector for all 36 n8n workflow JSON exports, skills, schemas,
 * and control-plane configuration in n8n_existing/.
 */
import fs from 'node:fs';
import path from 'node:path';

export type WorkflowCategory =
  | 'health'
  | 'ingress'
  | 'pre_pipeline'
  | 'outline_consensus'
  | 'article_consensus'
  | 'post_pipeline'
  | 'control';

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
  category: WorkflowCategory;
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
  contentType: 'blog' | 'product' | 'advertorial' | 'local_seo' | 'landing';
  title: string;
  description: string;
  hasTemplates: boolean;
  hasEvalCases: boolean;
  excerpt: string;
}

const ROOT_DIR = process.cwd();

function classifyWorkflow(file: string): WorkflowCategory {
  if (file.startsWith('00_')) return 'health';
  if (file.startsWith('01_')) return 'ingress';
  const num = Number(file.slice(0, 2));
  if (num >= 10 && num <= 15) return 'pre_pipeline';
  if (num >= 16 && num <= 21) return 'outline_consensus';
  if (num >= 22 && num <= 27) return 'article_consensus';
  if (num >= 28 && num <= 35) return 'post_pipeline';
  return 'control';
}

function cleanExpressionUrl(raw?: string): string | null {
  if (!raw) return null;
  const match = raw.match(/\/v1\/internal\/[^"'\s}]+/);
  return match ? match[0] : raw;
}

export function loadAllN8nWorkflows(): N8nWorkflowDetail[] {
  const dir = path.join(ROOT_DIR, 'n8n_existing', 'workflows');
  if (!fs.existsSync(dir)) return [];

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort();

  return files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) as {
      name?: string;
      active?: boolean;
      notes?: string;
      nodes?: Array<{
        id?: string;
        name?: string;
        type?: string;
        parameters?: {
          httpMethod?: string;
          path?: string;
          url?: string;
          jsCode?: string;
        };
      }>;
      connections?: Record<string, unknown>;
    };

    const nodes = (raw.nodes ?? []).map((n): N8nNodeSummary => ({
      id: n.id ?? '',
      name: n.name ?? '',
      type: n.type ?? '',
      httpMethod: n.parameters?.httpMethod,
      webhookPath: n.parameters?.path,
      targetUrl: cleanExpressionUrl(n.parameters?.url) ?? undefined,
      jsCode: n.parameters?.jsCode,
    }));

    const webhookNode = nodes.find((n) => n.type === 'n8n-nodes-base.webhook');
    const internalEndpoints = nodes
      .map((n) => n.targetUrl)
      .filter((u): u is string => Boolean(u));

    return {
      file,
      name: raw.name ?? file,
      category: classifyWorkflow(file),
      active: Boolean(raw.active),
      notes: raw.notes ?? '',
      nodeCount: nodes.length,
      webhookPath: webhookNode?.webhookPath ?? null,
      httpMethod: webhookNode?.httpMethod ?? null,
      internalEndpoints,
      nodes,
      connections: raw.connections ?? {},
    };
  });
}

const SKILL_MAP: Array<{
  dir: string;
  contentType: SeoSkillDetail['contentType'];
}> = [
  { dir: 'seo-blog-guide', contentType: 'blog' },
  { dir: 'product-page-content', contentType: 'product' },
  { dir: 'advertorial-content', contentType: 'advertorial' },
  { dir: 'gzlocation', contentType: 'local_seo' },
  { dir: 'landing-page-content', contentType: 'landing' },
];

export function loadAllSeoSkills(): SeoSkillDetail[] {
  const skillsRoot = path.join(ROOT_DIR, 'n8n_existing', 'skills');
  return SKILL_MAP.map(({ dir, contentType }) => {
    const skillDir = path.join(skillsRoot, dir);
    const mdPath = path.join(skillDir, 'SKILL.md');
    let raw = '';
    try {
      raw = fs.readFileSync(mdPath, 'utf8');
    } catch {
      raw = '';
    }

    const descMatch = raw.match(/description:\s*>-\s*\n([\s\S]*?)\n---/);
    const description = descMatch
      ? descMatch[1]
          .split('\n')
          .map((l) => l.trim())
          .join(' ')
      : '';
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const bodyWithoutFm = raw.replace(/^---[\s\S]*?---\s*/, '');

    return {
      id: dir,
      contentType,
      title: titleMatch?.[1] ?? dir,
      description,
      hasTemplates: fs.existsSync(path.join(skillDir, 'references', 'templates.md')),
      hasEvalCases: fs.existsSync(path.join(skillDir, 'evals')),
      excerpt: bodyWithoutFm.slice(0, 1400),
    };
  });
}

export function loadControlPlaneArtifacts() {
  const read = (rel: string) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8')) as Record<string, unknown>;
    } catch {
      return {};
    }
  };

  return {
    manifest: read('n8n_existing/manifest.json'),
    controlConfig: read('n8n_existing/config/control-plane.example.json'),
    requestSchema: read('n8n_existing/schemas/request.schema.json'),
    exampleRequest: read('example_request.json'),
  };
}

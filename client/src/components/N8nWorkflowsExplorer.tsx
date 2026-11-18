import React, { useMemo, useState } from 'react';
import { ArrowLeft, Play, Search } from 'lucide-react';
import type { N8nWorkflowDetail } from '../types';

interface Props {
  workflows: N8nWorkflowDetail[];
}

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'all', label: 'همه (۳۶)' },
  { id: 'ingress', label: 'ورودی کانال‌ها (۴)' },
  { id: 'pre_pipeline', label: 'آماده‌سازی ۱۰–۱۵ (۶)' },
  { id: 'outline_consensus', label: 'سرفصل O1–O6 (۶)' },
  { id: 'article_consensus', label: 'مقاله A1–A6 (۶)' },
  { id: 'post_pipeline', label: 'QA و تحویل ۲۸–۳۵ (۸)' },
  { id: 'control', label: 'کنترل ۵۰ (۵)' },
  { id: 'health', label: 'سلامت (۱)' },
];

export const N8nWorkflowsExplorer: React.FC<Props> = ({ workflows }) => {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<string>(workflows[0]?.file ?? '');
  const [triggerBusy, setTriggerBusy] = useState(false);
  const [triggerResult, setTriggerResult] = useState<Record<string, unknown> | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return workflows.filter((w) => {
      if (category !== 'all' && w.category !== category) return false;
      if (!q) return true;
      return (
        w.file.toLowerCase().includes(q) ||
        w.name.toLowerCase().includes(q) ||
        (w.webhookPath ?? '').toLowerCase().includes(q) ||
        w.internalEndpoints.some((e) => e.toLowerCase().includes(q))
      );
    });
  }, [workflows, category, search]);

  const selected =
    workflows.find((w) => w.file === selectedFile) || filtered[0] || workflows[0] || null;

  async function testTrigger(wf: N8nWorkflowDetail) {
    setTriggerBusy(true);
    setTriggerResult(null);
    try {
      const res = await fetch('/api/n8n/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowFile: wf.file,
          payload: {
            request_id: 'example-001',
            tenant_id: 'tenant-demo',
            project_id: 'project-demo',
            stage_id: wf.file.replace('.json', ''),
            job_id: 'job-test-01',
          },
        }),
      });
      const data = (await res.json()) as Record<string, unknown>;
      setTriggerResult(data);
    } finally {
      setTriggerBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              بازرس کامل ورک‌فلوهای n8n (۳۶ آداپتور JSON)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              تمامی فایل‌های پوشه <span className="font-mono">n8n_existing/workflows/</span> به صورت زنده خوانده شده و به اندپوینت‌های{' '}
              <span className="font-mono">/v1/internal/*</span> بک‌اند متصل شده‌اند.
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در نام، فایل یا وب‌هوک..."
              className="w-full rounded-md border border-slate-300 bg-slate-50 pr-8 pl-3 py-1.5 text-xs text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === c.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Workflow List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-100">
            {filtered.map((wf) => {
              const isSel = selected?.file === wf.file;
              return (
                <button
                  key={wf.file}
                  type="button"
                  onClick={() => {
                    setSelectedFile(wf.file);
                    setTriggerResult(null);
                  }}
                  className={`w-full text-right p-3.5 transition-colors cursor-pointer block ${
                    isSel ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">{wf.name}</span>
                    <span className="font-mono text-[11px] text-slate-500 tabular-nums shrink-0">
                      {wf.nodeCount} nodes
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-mono text-slate-500">
                    <span>{wf.file}</span>
                    {wf.webhookPath && (
                      <>
                        <span>·</span>
                        <span className="text-blue-700 truncate">/{wf.webhookPath}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">ورک‌فلویی یافت نشد.</div>
            )}
          </div>
        </div>

        {/* Selected Workflow Detail */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg p-5 space-y-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-slate-500">{selected.file}</div>
                  <h3 className="text-base font-semibold text-slate-900">{selected.name}</h3>
                  <p className="text-xs text-slate-600">{selected.notes}</p>
                </div>
                <button
                  type="button"
                  disabled={triggerBusy}
                  onClick={() => testTrigger(selected)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>تست وب‌هوک روی بک‌اند</span>
                </button>
              </div>

              {/* Node Chain */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-slate-700">
                  زنجیره نودهای ورک‌فلو ({selected.nodes.length})
                </div>
                <div className="flex flex-wrap items-center gap-2" dir="ltr">
                  {selected.nodes.map((node, i) => (
                    <React.Fragment key={node.id || i}>
                      <div className="px-3 py-2 rounded-md border border-slate-200 bg-slate-50 text-xs">
                        <div className="font-semibold text-slate-900">{node.name}</div>
                        <div className="font-mono text-[10px] text-slate-500 mt-0.5">
                          {node.type.replace('n8n-nodes-base.', '')}
                        </div>
                        {node.webhookPath && (
                          <div className="font-mono text-[10px] text-blue-700 mt-0.5">
                            {node.httpMethod} /{node.webhookPath}
                          </div>
                        )}
                        {node.targetUrl && (
                          <div className="font-mono text-[10px] text-emerald-700 mt-0.5">
                            → {node.targetUrl}
                          </div>
                        )}
                      </div>
                      {i < selected.nodes.length - 1 && (
                        <ArrowLeft className="w-3.5 h-3.5 text-slate-400 rotate-180 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Code Nodes */}
              {selected.nodes.some((n) => n.jsCode) && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700">کد اعتبارسنجی نود n8n</div>
                  {selected.nodes
                    .filter((n) => n.jsCode)
                    .map((n) => (
                      <pre
                        key={n.id}
                        dir="ltr"
                        className="p-3 rounded-md border border-slate-200 bg-slate-950 text-slate-100 text-xs overflow-x-auto"
                      >
                        {n.jsCode}
                      </pre>
                    ))}
                </div>
              )}

              {/* Live Trigger Receipt */}
              {triggerResult && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-700">
                    پاسخ زنده بک‌اند به شبیه‌سازی وب‌هوک:
                  </div>
                  <pre
                    dir="ltr"
                    className="p-3 rounded-md border border-emerald-200 bg-slate-950 text-emerald-300 text-xs overflow-x-auto"
                  >
                    {JSON.stringify(triggerResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="text-xs text-slate-500">یک ورک‌فلو را انتخاب کنید.</div>
          )}
        </div>
      </div>
    </div>
  );
};

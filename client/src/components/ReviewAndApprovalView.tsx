import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileCode2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { SeoJobRecord } from '../types';

interface Props {
  record: SeoJobRecord | null;
  onDecision: (
    requestId: string,
    decision: 'approve' | 'reject' | 'revise',
    notes?: string
  ) => Promise<void>;
  onCancel: (requestId: string) => Promise<void>;
  onResume: (requestId: string, notes?: string) => Promise<void>;
}

type ResultTab = 'content' | 'qa_html' | 'matrix' | 'stages' | 'trace' | 'raw';

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_LABELS: Record<string, string> = {
  awaiting_human_approval: 'در انتظار تایید انسانی',
  approved: 'تایید شده (مجاز برای انتشار)',
  rejected: 'رد شده',
  revise: 'نیاز به بازنگری',
  cancelled: 'لغو شده',
  queued: 'در صف اجرا',
  processing: 'در حال اجرا',
  failed: 'خطا',
  received: 'دریافت شده',
};

export const ReviewAndApprovalView: React.FC<Props> = ({
  record,
  onDecision,
  onCancel,
  onResume,
}) => {
  const [tab, setTab] = useState<ResultTab>('content');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  if (!record) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center space-y-2">
        <h2 className="text-base font-semibold text-slate-900">هنوز خروجی فعالی انتخاب نشده است</h2>
        <p className="text-sm text-slate-500">
          از منوی کناری یک درخواست را انتخاب کنید یا در استودیوی تولید محتوا یک پایپ‌لاین جدید اجرا نمایید.
        </p>
      </div>
    );
  }

  const res = record.result;
  const outline = res?.outline ?? {};
  const article = res?.article ?? {};
  const matrix = res?.review_matrix ?? {};
  const trace = res?.trace ?? [];
  const qa = record.qa_report;
  const isRtl = ['fa', 'ar', 'he', 'ur'].includes((record.request.language || '').toLowerCase());

  async function handleAction(fn: () => Promise<void>) {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  function exportDocxCompatible() {
    if (!record?.generated_html) return;
    const wordDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'></head><body>${record.generated_html}</body></html>`;
    downloadTextFile(`${record.request_id}.doc`, wordDoc, 'application/msword;charset=utf-8');
  }

  return (
    <div className="space-y-6">
      {/* Human Approval Gate Panel (31_stage_approval) */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono text-slate-800">{record.request_id}</span>
              <span>·</span>
              <span>{record.request.content_type}</span>
              <span>·</span>
              <span>کانال: {record.channel}</span>
              <span>·</span>
              <span>حالت ورودی: {record.input_mode}</span>
              <span>·</span>
              <span>پروفیل: {record.profile}</span>
              <span>·</span>
              <span>موتور: {record.execution_mode}</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {record.request.primary_keyword}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  record.status === 'approved'
                    ? 'text-emerald-700'
                    : record.status === 'rejected' || record.status === 'failed'
                    ? 'text-red-700'
                    : 'text-amber-700'
                }`}
              >
                {record.status === 'approved' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : record.status === 'rejected' || record.status === 'failed' ? (
                  <XCircle className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span>{STATUS_LABELS[record.status] || record.status}</span>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-700">
                مجوز انتشار:{' '}
                <strong className="font-mono">{record.publish_allowed ? 'true' : 'false'}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-700 tabular-nums">
                فراخوانی مدل‌ها: <strong className="font-mono">{trace.length}</strong>
              </span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-700 tabular-nums">
                ماتریس داوری: <strong className="font-mono">{Object.keys(matrix).length}</strong>
              </span>
            </div>
          </div>

          {/* Delivery Exports (32_delivery & 33_sheets) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={!record.generated_html}
              onClick={() =>
                record.generated_html &&
                downloadTextFile(`${record.request_id}.html`, record.generated_html, 'text/html;charset=utf-8')
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>دانلود HTML</span>
            </button>
            <button
              type="button"
              disabled={!record.generated_html || !record.publish_allowed}
              onClick={exportDocxCompatible}
              title={!record.publish_allowed ? 'پس از تایید انسانی فعال می‌شود' : ''}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی Word</span>
            </button>
            <button
              type="button"
              disabled={!record.sheets_csv}
              onClick={() =>
                record.sheets_csv &&
                downloadTextFile(`${record.request_id}-sheets.csv`, record.sheets_csv, 'text/csv;charset=utf-8')
              }
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>خروجی Sheets CSV</span>
            </button>
          </div>
        </div>

        {/* Reviewer Feedback & Approval Controls */}
        <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="یادداشت بازبین انسانی برای لاگ کنترل یا اصلاح (Stage 35 Feedback)..."
            className="flex-1 rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/30"
          />
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(() => onDecision(record.request_id, 'approve', notes))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>تایید و مجوز انتشار</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(() => onDecision(record.request_id, 'revise', notes))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium hover:bg-amber-100 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>درخواست اصلاح</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(() => onDecision(record.request_id, 'reject', notes))}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-red-300 bg-red-50 text-red-800 text-xs font-medium hover:bg-red-100 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>رد کردن</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(() => onResume(record.request_id, notes))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازگشایی</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => handleAction(() => onCancel(record.request_id))}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-200 bg-white text-slate-500 text-xs font-medium hover:text-red-700 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>لغو</span>
            </button>
          </div>
        </div>
      </div>

      {/* Output Tabs */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-slate-200 px-4 pt-3 bg-slate-50/70">
          {[
            { id: 'content', label: 'مقاله (A6) و سرفصل (O6)' },
            { id: 'qa_html', label: `سئو QA و HTML (${qa ? (qa.pass ? 'Pass' : 'Fail') : '—'})` },
            { id: 'matrix', label: `ماتریس داوری (${Object.keys(matrix).length})` },
            { id: 'stages', label: `مراحل n8n (${record.stage_executions.length})` },
            { id: 'trace', label: `ردپای مدل‌ها (${trace.length})` },
            { id: 'raw', label: 'JSON خام' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as ResultTab)}
              className={`px-3.5 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === t.id
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-md'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Final Outline O6 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-semibold text-slate-900">ساختار نهایی (Stage O6)</h3>
                  <span className="text-xs font-mono text-slate-500">{outline.provider || '—'}</span>
                </div>
                <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-3 text-sm">
                  <div className="font-semibold text-slate-900">{outline.title || '—'}</div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {(outline.sections ?? []).map((sec, idx) => (
                      <li key={idx} className="p-2.5 rounded-md bg-slate-50 border border-slate-200">
                        <div className="font-semibold text-slate-900">{sec.heading}</div>
                        {sec.purpose && <div className="text-slate-600 mt-1">{sec.purpose}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Final Article A6 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-sm font-semibold text-slate-900">مقاله نهایی (Stage A6)</h3>
                  <span className="text-xs font-mono text-slate-500">
                    {article.provider || '—'} · امتیاز: {article.score ?? '—'}
                  </span>
                </div>
                <div dir={isRtl ? 'rtl' : 'ltr'} className="space-y-3">
                  {article.meta_title && (
                    <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <div>
                        <span className="text-slate-500">Meta Title: </span>
                        <span className="font-medium text-slate-900">{article.meta_title}</span>
                      </div>
                      {article.meta_description && (
                        <div>
                          <span className="text-slate-500">Meta Description: </span>
                          <span className="text-slate-700">{article.meta_description}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <h4 className="text-base font-bold text-slate-900">{article.title || '—'}</h4>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {article.body || 'محتوایی تولید نشده است.'}
                  </p>
                  {(article.sections ?? []).map((sec, idx) => (
                    <div key={idx} className="pt-2 border-t border-slate-100 space-y-1">
                      <h5 className="text-sm font-semibold text-slate-900">{sec.heading}</h5>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {sec.content || sec.purpose}
                      </p>
                    </div>
                  ))}
                  {(article.faq ?? []).length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <h5 className="text-sm font-semibold text-slate-900">پرسش‌های متداول</h5>
                      {(article.faq ?? []).map((item, i) => (
                        <div key={i} className="text-xs space-y-0.5">
                          <div className="font-semibold text-slate-900">{item.question}</div>
                          <div className="text-slate-600">{item.answer}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === 'qa_html' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  گزارش کنترل کیفیت سئو (Stage 28 Fact Check &amp; SEO QA)
                </h3>
                {qa ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-4 p-3 rounded-md border border-slate-200 bg-slate-50 tabular-nums">
                      <span>وضعیت: <strong>{qa.pass ? 'تایید QA' : 'دارای خطا'}</strong></span>
                      <span>·</span>
                      <span>تعداد کلمات: <strong className="font-mono">{qa.wordCount}</strong></span>
                      <span>·</span>
                      <span>خطاها: <strong className="font-mono text-red-700">{qa.fails.length}</strong></span>
                      <span>·</span>
                      <span>هشدارها: <strong className="font-mono text-amber-700">{qa.warnings.length}</strong></span>
                    </div>
                    {qa.fails.length > 0 && (
                      <div className="p-3 rounded-md border border-red-200 bg-red-50 text-red-800 space-y-1">
                        <div className="font-semibold">خطاهای مسدودکننده (FAIL):</div>
                        {qa.fails.map((f, i) => (
                          <div key={i}>• {f}</div>
                        ))}
                      </div>
                    )}
                    {qa.warnings.length > 0 && (
                      <div className="p-3 rounded-md border border-amber-200 bg-amber-50 text-amber-900 space-y-1">
                        <div className="font-semibold">هشدارهای ویراستاری (WARN):</div>
                        {qa.warnings.map((w, i) => (
                          <div key={i}>• {w}</div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-md border border-slate-200 bg-white space-y-1 text-slate-600">
                      <div className="font-semibold text-slate-800">جزئیات بررسی:</div>
                      {qa.info.map((inf, i) => (
                        <div key={i} className="font-mono text-[11px]">{inf}</div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">گزارش QA موجود نیست.</div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  خروجی HTML و JSON-LD آماده CMS (Stage 30)
                </h3>
                <pre
                  dir="ltr"
                  className="p-3 rounded-lg border border-slate-200 bg-slate-950 text-slate-100 text-xs overflow-auto max-h-[420px]"
                >
                  {record.generated_html || '—'}
                </pre>
              </div>
            </div>
          )}

          {tab === 'matrix' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 text-right font-semibold">پیش‌نویس : داور</th>
                    <th className="py-2.5 px-3 text-right font-semibold">امتیاز</th>
                    <th className="py-2.5 px-3 text-right font-semibold">تصمیم</th>
                    <th className="py-2.5 px-3 text-right font-semibold">شناسه Digest</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(matrix).map(([pair, val]) => (
                    <tr key={pair} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-slate-900">{pair}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums">{val.score ?? '—'}</td>
                      <td className="py-2.5 px-3">{val.decision ?? '—'}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{val.id ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'stages' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 text-right font-semibold">مرحله</th>
                    <th className="py-2.5 px-3 text-right font-semibold">ورک‌فلو n8n</th>
                    <th className="py-2.5 px-3 text-right font-semibold">وضعیت</th>
                    <th className="py-2.5 px-3 text-right font-semibold">خلاصه اجرا</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.stage_executions.map((s) => (
                    <tr key={s.stageId} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">{s.label}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{s.workflowFile}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={
                            s.status === 'completed'
                              ? 'text-emerald-700 font-medium'
                              : s.status === 'awaiting_approval'
                              ? 'text-amber-700 font-medium'
                              : 'text-slate-500'
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{s.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'trace' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 text-right font-semibold">#</th>
                    <th className="py-2.5 px-3 text-right font-semibold">مرحله اجماع</th>
                    <th className="py-2.5 px-3 text-right font-semibold">ارائه‌دهنده</th>
                    <th className="py-2.5 px-3 text-right font-semibold">امضای SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trace.map((t, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono tabular-nums text-slate-500">{i + 1}</td>
                      <td className="py-2 px-3 font-mono text-slate-900">{t.stage}</td>
                      <td className="py-2 px-3 font-medium text-slate-800">{t.provider}</td>
                      <td className="py-2 px-3 font-mono text-slate-500">{t.sha256}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'raw' && (
            <pre
              dir="ltr"
              className="p-4 rounded-lg border border-slate-200 bg-slate-950 text-slate-100 text-xs overflow-auto max-h-[480px]"
            >
              {JSON.stringify(record, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Loader2, Play, RotateCcw } from 'lucide-react';
import { MultiModalAssetStudio } from './components/MultiModalAssetStudio';
import { ReviewAndApprovalView } from './components/ReviewAndApprovalView';
import { N8nWorkflowsExplorer } from './components/N8nWorkflowsExplorer';
import { SettingsAndSkillsView } from './components/SettingsAndSkillsView';
import type {
  ChannelType,
  ContentType,
  ExecutionMode,
  HealthResponse,
  InputMode,
  N8nWorkflowDetail,
  Profile,
  SeoJobRecord,
  SeoSkillDetail,
  SourceAssetItem,
} from './types';

type WorkspaceView = 'studio' | 'review' | 'n8n' | 'settings';

export function App() {
  const [view, setView] = useState<WorkspaceView>('studio');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [requests, setRequests] = useState<SeoJobRecord[]>([]);
  const [activeId, setActiveId] = useState<string>('example-001');
  const [workflows, setWorkflows] = useState<N8nWorkflowDetail[]>([]);
  const [skills, setSkills] = useState<SeoSkillDetail[]>([]);
  const [siteConfig, setSiteConfig] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);

  // Studio form state
  const [requestId, setRequestId] = useState('');
  const [channel, setChannel] = useState<ChannelType>('api');
  const [contentType, setContentType] = useState<ContentType>('blog');
  const [inputMode, setInputMode] = useState<InputMode>('keyword');
  const [profile, setProfile] = useState<Profile>('full');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('mock');
  const [primaryKeyword, setPrimaryKeyword] = useState('راهنمای سئو محلی');
  const [secondaryKeywords, setSecondaryKeywords] = useState('');
  const [language, setLanguage] = useState('fa');
  const [locale, setLocale] = useState('fa-IR');
  const [targetLocation, setTargetLocation] = useState('');
  const [audience, setAudience] = useState('');
  const [searchIntent, setSearchIntent] = useState('commercial_investigation');
  const [userInstructions, setUserInstructions] = useState('محتوای فارسی با منابع قابل بررسی');
  const [sourceAssets, setSourceAssets] = useState<SourceAssetItem[]>([]);
  const [runBusy, setRunBusy] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  async function refreshData(selectId?: string) {
    const [hRes, rRes, wRes, sRes, cRes] = await Promise.all([
      fetch('/api/health').then((r) => r.json() as Promise<HealthResponse>),
      fetch('/api/requests').then((r) => r.json() as Promise<{ requests: SeoJobRecord[] }>),
      fetch('/api/n8n/workflows').then((r) => r.json() as Promise<{ workflows: N8nWorkflowDetail[] }>),
      fetch('/api/n8n/skills').then((r) => r.json() as Promise<{ skills: SeoSkillDetail[] }>),
      fetch('/api/config').then((r) => r.json() as Promise<{ settings: Record<string, unknown> }>),
    ]);

    setHealth(hRes);
    setRequests(rRes.requests ?? []);
    setWorkflows(wRes.workflows ?? []);
    setSkills(sRes.skills ?? []);
    setSiteConfig(cRes.settings ?? {});

    if (selectId) {
      setActiveId(selectId);
    } else if (rRes.requests?.length && !rRes.requests.some((x) => x.request_id === activeId)) {
      setActiveId(rRes.requests[0].request_id);
    }
  }

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, []);

  const activeRecord = requests.find((r) => r.request_id === activeId) ?? requests[0] ?? null;

  function resetNewRequest() {
    setRequestId(`req-${Date.now().toString(36)}`);
    setPrimaryKeyword('');
    setSecondaryKeywords('');
    setUserInstructions('');
    setSourceAssets([]);
    setRunError(null);
    setView('studio');
  }

  async function loadExamplePreset() {
    const ex = await fetch('/api/example').then(
      (r) => r.json() as Promise<{ exampleRequest?: Record<string, unknown> }>
    );
    const req = ex.exampleRequest ?? {};
    setRequestId(String(req.request_id ?? 'example-001'));
    setContentType((req.content_type as ContentType) || 'blog');
    setPrimaryKeyword(String(req.primary_keyword ?? 'راهنمای سئو محلی'));
    setLanguage(String(req.language ?? 'fa'));
    setLocale(String(req.locale ?? 'fa-IR'));
    setUserInstructions(String(req.user_instructions ?? ''));
    setInputMode('keyword');
    setSourceAssets([]);
    setRunError(null);
  }

  async function handleRunPipeline(e: React.FormEvent) {
    e.preventDefault();
    if (!primaryKeyword.trim()) {
      setRunError('کلمه کلیدی اصلی الزامی است.');
      return;
    }

    setRunBusy(true);
    setRunError(null);
    try {
      const id = requestId.trim() || `req-${Date.now().toString(36)}`;
      const secList = secondaryKeywords
        .split(/[،,]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 30);

      const res = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: {
            request_id: id,
            content_type: contentType,
            input_mode: inputMode,
            primary_keyword: primaryKeyword.trim(),
            secondary_keywords: secList,
            language: language.trim() || 'fa',
            locale: locale.trim() || 'fa-IR',
            target_location: targetLocation.trim() || null,
            audience: audience.trim() || undefined,
            search_intent: searchIntent.trim() || undefined,
            user_instructions: userInstructions.trim(),
            human_approval_required: true,
          },
          profile,
          executionMode,
          channel,
          inputMode,
          sourceAssets,
        }),
      });

      const data = (await res.json()) as { request_id?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'اجرای پایپ‌لاین با خطا مواجه شد.');
      }

      await refreshData(data.request_id || id);
      setView('review');
    } catch (err) {
      setRunError(err instanceof Error ? err.message : 'خطا در اجرای پایپ‌لاین');
    } finally {
      setRunBusy(false);
    }
  }

  async function handleApprovalDecision(
    id: string,
    decision: 'approve' | 'reject' | 'revise',
    notes?: string
  ) {
    const res = await fetch('/v1/internal/control/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request_id: id,
        decision,
        actor_id: 'editorial-reviewer',
        notes: notes || undefined,
      }),
    });
    if (res.ok) {
      await refreshData(id);
    }
  }

  async function handleCancelRequest(id: string) {
    const res = await fetch('/v1/internal/control/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: id }),
    });
    if (res.ok) {
      await refreshData(id);
    }
  }

  async function handleResumeRequest(id: string, notes?: string) {
    const res = await fetch('/v1/internal/control/resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: id, notes }),
    });
    if (res.ok) {
      await refreshData(id);
    }
  }

  async function handleSaveConfig(settings: Record<string, unknown>) {
    const res = await fetch('/v1/internal/control/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: 'default-site', settings }),
    });
    if (res.ok) {
      await refreshData();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar Contract: Brand wordmark — Nav links — 1 Primary CTA */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between gap-8 sticky top-0 z-20">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setView('studio');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          SEO Auto
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {[
            { id: 'studio', label: 'استودیو تولید' },
            { id: 'review', label: 'خروجی و تایید' },
            { id: 'n8n', label: 'ورک‌فلوهای n8n' },
            { id: 'settings', label: 'تنظیمات و اسکیل‌ها' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id as WorkspaceView)}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === item.id
                  ? 'border-blue-600 text-slate-900'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={resetNewRequest}
            className="px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            درخواست جدید
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2 flex gap-2 overflow-x-auto">
        {[
          { id: 'studio', label: 'استودیو' },
          { id: 'review', label: 'خروجی و تایید' },
          { id: 'n8n', label: 'ورک‌فلوها' },
          { id: 'settings', label: 'تنظیمات' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setView(item.id as WorkspaceView)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 ${
              view === item.id ? 'bg-slate-900 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Canvas: 260px Sidebar + Fluid Main Content */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar: Request Queue & Runtime Overview */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500">صف درخواست‌ها ({requests.length})</h2>
              <span className="text-[11px] font-mono text-slate-500">
                {health?.ok ? 'Online :3000' : '...'}
              </span>
            </div>

            {loading ? (
              <div className="space-y-2">
                <div className="h-10 bg-slate-100 rounded-md" />
                <div className="h-10 bg-slate-100 rounded-md" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center">
                هنوز درخواستی ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                {requests.map((req) => {
                  const isActive = req.request_id === activeRecord?.request_id;
                  return (
                    <button
                      key={req.request_id}
                      type="button"
                      onClick={() => {
                        setActiveId(req.request_id);
                        setView('review');
                      }}
                      className={`w-full text-right py-2.5 px-2.5 rounded-md transition-colors cursor-pointer block ${
                        isActive ? 'bg-blue-50/80' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-semibold text-slate-900 truncate">
                        {req.request.primary_keyword}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                        <span className="font-mono">{req.request_id}</span>
                        <span>·</span>
                        <span>{req.profile}</span>
                        <span>·</span>
                        <span
                          className={
                            req.status === 'approved'
                              ? 'text-emerald-700 font-medium'
                              : req.status === 'rejected' || req.status === 'failed'
                              ? 'text-red-700 font-medium'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          {req.status === 'awaiting_human_approval'
                            ? 'منتظر تایید'
                            : req.status === 'approved'
                            ? 'تایید شد'
                            : req.status}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs">
            <div className="font-semibold text-slate-800">وضعیت اتصال موتورها</div>
            <div className="text-slate-600 flex justify-between">
              <span>Gemini Live (Transcription &amp; AI)</span>
              <span className={health?.geminiReady ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                {health?.geminiReady ? 'متصل' : 'غیرفعال'}
              </span>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>ورک‌فلوهای n8n</span>
              <span className="font-mono tabular-nums text-slate-900">{workflows.length} فایل</span>
            </div>
            <div className="text-slate-600 flex justify-between">
              <span>اسکیل‌های محتوا</span>
              <span className="font-mono tabular-nums text-slate-900">{skills.length} اسکیل</span>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="lg:col-span-9 min-w-0">
          {view === 'studio' && (
            <form onSubmit={handleRunPipeline} className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl font-bold text-slate-900">
                      استودیو ثبت درخواست و پایپ‌لاین چندمدلی سئو
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">
                      ورودی متنی، صوتی (ویس)، یوتیوب، ویدیو یا سند را ثبت کنید تا مراحل ۱۰ تا ۳۵ و اجماع O1–O6 و A1–A6 اجرا شود.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={loadExamplePreset}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>بارگذاری مثال پیش‌فرض</span>
                  </button>
                </div>

                {/* Channel, Content Type/Skill, Execution Mode, Profile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      نوع محتوا / اسکیل
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value as ContentType)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="blog">مقاله و راهنمای خرید (blog)</option>
                      <option value="product">صفحه محصول (product)</option>
                      <option value="advertorial">رپورتاژ خبری (advertorial)</option>
                      <option value="local_seo">سئو محلی و دایرکتوری (local_seo)</option>
                      <option value="landing">صفحه فرود (landing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      کانال ورودی (n8n Ingress)
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value as ChannelType)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="api">وب‌سایت / API</option>
                      <option value="telegram">تلگرام (Telegram)</option>
                      <option value="email">ایمیل (Email)</option>
                      <option value="whatsapp">واتس‌اپ (WhatsApp)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      پروفیل اجماع مدل‌ها
                    </label>
                    <select
                      value={profile}
                      onChange={(e) => setProfile(e.target.value as Profile)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="full">کامل — ۶ مدل / ۳۷ فراخوانی (full)</option>
                      <option value="balanced">متعادل — ۳ مدل / ۱۸ فراخوانی (balanced)</option>
                      <option value="economy">اقتصادی — ۱ مدل / ۱۱ فراخوانی (economy)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      موتور اجرا (Gateway)
                    </label>
                    <select
                      value={executionMode}
                      onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="mock">Mock قطعی (تست سریع و رایگان)</option>
                      <option value="gemini_live" disabled={!health?.geminiReady}>
                        Gemini Live (اجرای واقعی روی Gemini)
                      </option>
                      <option value="multi_provider_live">
                        Multi-Provider Live (۶ کلید API سرور)
                      </option>
                    </select>
                  </div>
                </div>

                {/* Multi-Modal Input Studio (Voice, YouTube, Video, Document, Mixed) */}
                <MultiModalAssetStudio
                  inputMode={inputMode}
                  onChangeInputMode={setInputMode}
                  assets={sourceAssets}
                  onAddAsset={(asset) => setSourceAssets((prev) => [...prev, asset])}
                  onRemoveAsset={(id) =>
                    setSourceAssets((prev) => prev.filter((a) => a.id !== id))
                  }
                  onApplyExtractedBrief={(data) => {
                    if (data.keyword && !primaryKeyword.trim()) {
                      setPrimaryKeyword(data.keyword);
                    }
                    if (data.secondaryKeywords?.length && !secondaryKeywords.trim()) {
                      setSecondaryKeywords(data.secondaryKeywords.join('، '));
                    }
                    if (data.instructions) {
                      setUserInstructions((prev) =>
                        prev ? `${prev}\n${data.instructions}` : data.instructions || ''
                      );
                    }
                  }}
                  language={language}
                />

                {/* Core Brief Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      کلمه کلیدی اصلی *
                    </label>
                    <input
                      type="text"
                      value={primaryKeyword}
                      onChange={(e) => setPrimaryKeyword(e.target.value)}
                      placeholder="مثلاً: راهنمای خرید بهترین تصفیه هوا"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      کلمات کلیدی فرعی (با ویرگول جدا کنید)
                    </label>
                    <input
                      type="text"
                      value={secondaryKeywords}
                      onChange={(e) => setSecondaryKeywords(e.target.value)}
                      placeholder="سئو محلی، بهینه‌سازی نقشه گوگل، ..."
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">شناسه درخواست</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={requestId}
                      onChange={(e) => setRequestId(e.target.value)}
                      placeholder="auto-generated"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">زبان و لوکال</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        dir="ltr"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-16 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-mono"
                      />
                      <input
                        type="text"
                        dir="ltr"
                        value={locale}
                        onChange={(e) => setLocale(e.target.value)}
                        className="flex-1 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">موقعیت هدف (اختیاری)</label>
                    <input
                      type="text"
                      value={targetLocation}
                      onChange={(e) => setTargetLocation(e.target.value)}
                      placeholder="مثلاً: تهران"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">هدف جستجو / مخاطب</label>
                    <input
                      type="text"
                      value={audience || searchIntent}
                      onChange={(e) => {
                        setAudience(e.target.value);
                        setSearchIntent(e.target.value);
                      }}
                      placeholder="مخاطب یا نیت جستجو"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    دستورالعمل و بریف کاربر
                  </label>
                  <textarea
                    rows={3}
                    value={userInstructions}
                    onChange={(e) => setUserInstructions(e.target.value)}
                    placeholder="نکات لحن، لینک‌های داخلی مجاز، محدودیت‌ها و منابع مورد نظر..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                </div>

                {runError && (
                  <div className="p-3 rounded-md border border-red-200 bg-red-50 text-xs text-red-800">
                    {runError}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-500">
                    دروازه تایید انسانی فعال است — هیچ خروجی بدون تایید شما منتشر نمی‌شود.
                  </div>
                  <button
                    type="submit"
                    disabled={runBusy}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {runBusy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    <span>
                      {runBusy ? 'در حال اجرای پایپ‌لاین...' : 'اجرای پایپ‌لاین اجماع سئو'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {view === 'review' && (
            <ReviewAndApprovalView
              record={activeRecord}
              onDecision={handleApprovalDecision}
              onCancel={handleCancelRequest}
              onResume={handleResumeRequest}
            />
          )}

          {view === 'n8n' && <N8nWorkflowsExplorer workflows={workflows} />}

          {view === 'settings' && (
            <SettingsAndSkillsView
              providers={health?.providers ?? []}
              skills={skills}
              initialConfig={siteConfig}
              onSelectSkill={(ct) => {
                setContentType(ct);
                setView('studio');
              }}
              onSaveConfig={handleSaveConfig}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

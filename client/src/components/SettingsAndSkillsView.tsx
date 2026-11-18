import React, { useState } from 'react';
import { Check, Save } from 'lucide-react';
import type { ContentType, ProviderStatus, SeoSkillDetail } from '../types';

interface Props {
  providers: ProviderStatus[];
  skills: SeoSkillDetail[];
  initialConfig: Record<string, unknown>;
  onSelectSkill: (contentType: ContentType) => void;
  onSaveConfig: (settings: Record<string, unknown>) => Promise<void>;
}

export const SettingsAndSkillsView: React.FC<Props> = ({
  providers,
  skills,
  initialConfig,
  onSelectSkill,
  onSaveConfig,
}) => {
  const initialChannels = (initialConfig.channels as Record<string, boolean> | undefined) ?? {
    api: true,
    telegram: true,
    email: true,
    whatsapp: false,
  };

  const [domain, setDomain] = useState(String(initialConfig.domain ?? 'example.ir'));
  const [zwnjPolicy, setZwnjPolicy] = useState(String(initialConfig.zwnj_policy ?? 'standard'));
  const [digitsPolicy, setDigitsPolicy] = useState(String(initialConfig.digits_policy ?? 'persian'));
  const [channels, setChannels] = useState<Record<string, boolean>>(initialChannels);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedNotice(false);
    try {
      await onSaveConfig({
        domain,
        zwnj_policy: zwnjPolicy,
        digits_policy: digitsPolicy,
        channels,
        human_approval_required: true,
      });
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Control-Plane Config (50_control_config) + Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form
          onSubmit={handleSave}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                تنظیمات سایت و کانال‌ها (50_control_config)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مدیریت دامنه، سیاست نگارش فارسی و کانال‌های فعال ورودی
              </p>
            </div>
            {savedNotice && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <Check className="w-3.5 h-3.5" />
                <span>ذخیره شد</span>
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1">دامنه سایت هدف</label>
            <input
              type="text"
              dir="ltr"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">سیاست نیم‌فاصله (ZWNJ)</label>
              <select
                value={zwnjPolicy}
                onChange={(e) => setZwnjPolicy(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="standard">standard (استاندارد)</option>
                <option value="none">none (بدون نیم‌فاصله)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">سیاست ارقام</label>
              <select
                value={digitsPolicy}
                onChange={(e) => setDigitsPolicy(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              >
                <option value="persian">persian (فارسی)</option>
                <option value="latin">latin (لاتین)</option>
                <option value="site">site (مطابق سایت)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-600 mb-2">کانال‌های ورودی n8n</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'api', label: 'وب‌سایت / API' },
                { key: 'telegram', label: 'تلگرام (Telegram)' },
                { key: 'email', label: 'ایمیل (Email)' },
                { key: 'whatsapp', label: 'واتس‌اپ (WhatsApp)' },
              ].map((ch) => (
                <label
                  key={ch.key}
                  className="flex items-center gap-2 p-2.5 rounded-md border border-slate-200 bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(channels[ch.key])}
                    onChange={(e) =>
                      setChannels((prev) => ({ ...prev, [ch.key]: e.target.checked }))
                    }
                    className="rounded border-slate-300"
                  />
                  <span className="text-slate-800">{ch.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره در Control API</span>
            </button>
          </div>
        </form>

        {/* Provider Env Status */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">وضعیت مدل‌ها و کلیدهای سرور</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              کلیدهای API منحصراً از متغیرهای محیطی سرور خوانده می‌شوند و هرگز به مرورگر ارسال نمی‌گردند.
            </p>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2 text-right font-semibold">ارائه‌دهنده</th>
                <th className="py-2 text-right font-semibold">مدل فعال</th>
                <th className="py-2 text-right font-semibold">متغیر محیطی</th>
                <th className="py-2 text-right font-semibold">وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {providers.map((p) => (
                <tr key={p.provider}>
                  <td className="py-2.5 font-medium text-slate-900">{p.provider}</td>
                  <td className="py-2.5 font-mono text-slate-600">{p.model}</td>
                  <td className="py-2.5 font-mono text-slate-500">{p.envVar}</td>
                  <td className="py-2.5">
                    <span
                      className={
                        p.configured ? 'text-emerald-700 font-medium' : 'text-slate-500'
                      }
                    >
                      {p.configured ? 'متصل در سرور' : 'تنظیم‌نشده'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5 SEO Skills */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            اسکیل‌های تخصصی محتوا (n8n_existing/skills)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            هر نوع محتوا دارای قوانین نگارشی، جداول مقایسه‌ای و ساختار JSON-LD اختصاصی است.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-lg border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>{skill.id}</span>
                  <span>{skill.contentType}</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{skill.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {skill.description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-[11px] text-slate-500">
                  {skill.hasTemplates ? 'قالب HTML دارد' : ''}
                  {skill.hasEvalCases ? ' · آزمون ارزیابی دارد' : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectSkill(skill.contentType)}
                  className="text-xs font-medium text-blue-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  انتخاب در استودیو
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import {
  FileText,
  Film,
  KeyRound,
  Layers,
  Mic,
  Square,
  Trash2,
  Upload,
  Tv,
  Loader2,
} from 'lucide-react';
import type { InputMode, SourceAssetItem } from '../types';

interface Props {
  inputMode: InputMode;
  onChangeInputMode: (mode: InputMode) => void;
  assets: SourceAssetItem[];
  onAddAsset: (asset: SourceAssetItem) => void;
  onRemoveAsset: (id: string) => void;
  onApplyExtractedBrief: (data: {
    keyword?: string;
    instructions?: string;
    secondaryKeywords?: string[];
  }) => void;
  language: string;
}

const INPUT_MODES: Array<{ id: InputMode; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'keyword', label: 'کلیدواژه', icon: KeyRound },
  { id: 'text', label: 'متن و بریف', icon: FileText },
  { id: 'audio', label: 'ضبط ویس / صدا', icon: Mic },
  { id: 'youtube', label: 'یوتیوب', icon: Tv },
  { id: 'video', label: 'ویدیو', icon: Film },
  { id: 'document', label: 'سند و فایل', icon: Upload },
  { id: 'mixed', label: 'ترکیبی', icon: Layers },
];

function extractYoutubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

export const MultiModalAssetStudio: React.FC<Props> = ({
  inputMode,
  onChangeInputMode,
  assets,
  onAddAsset,
  onRemoveAsset,
  onApplyExtractedBrief,
  language,
}) => {
  // Voice recorder state
  const [recording, setRecording] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBase64, setRecordedBase64] = useState<string | null>(null);
  const [recordedMime, setRecordedMime] = useState<string>('audio/webm');
  const [audioBusy, setAudioBusy] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [manualAudioTranscript, setManualAudioTranscript] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // YouTube & Video state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeNotes, setYoutubeNotes] = useState('');
  const [videoUrlOrName, setVideoUrlOrName] = useState('');
  const [videoNotes, setVideoNotes] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [extractBusy, setExtractBusy] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close().catch(() => undefined);
    };
  }, []);

  const formatTimer = (sec: number) => {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  async function startRecording() {
    setAudioError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setAudioError('مرورگر شما از ضبط مستقیم میکروفون پشتیبانی نمی‌کند. می‌توانید فایل صوتی آپلود کنید.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      // Real Web Audio level meter
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        rafRef.current = window.requestAnimationFrame(updateLevel);
      };
      updateLevel();

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlobUrl(url);
        setRecordedMime(mimeType);

        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setRecordedBase64(reader.result);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setRecording(true);
      setElapsedSec(0);
      timerRef.current = window.setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setAudioError(
        err instanceof Error
          ? `دسترسی میکروفون برقرار نشد: ${err.message}`
          : 'خطا در دسترسی به میکروفون'
      );
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    if (timerRef.current) window.clearInterval(timerRef.current);
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close().catch(() => undefined);
    setRecording(false);
    setAudioLevel(0);
  }

  function handleAudioFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAudioError(null);
    const url = URL.createObjectURL(file);
    setRecordedBlobUrl(url);
    setRecordedMime(file.type || 'audio/mp3');

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setRecordedBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function transcribeVoiceBrief() {
    if (!recordedBase64) {
      setAudioError('ابتدا ویس ضبط کنید یا یک فایل صوتی انتخاب نمایید.');
      return;
    }
    setAudioBusy(true);
    setAudioError(null);
    try {
      const res = await fetch('/api/assets/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Audio: recordedBase64,
          mimeType: recordedMime,
          languageHint: language,
        }),
      });
      const data = (await res.json()) as {
        transcript?: string;
        suggestedKeyword?: string;
        summary?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'خطا در تبدیل ویس به متن');
      }
      const transcript = data.transcript || '';
      setManualAudioTranscript(transcript);

      const newAsset: SourceAssetItem = {
        id: `audio-${Date.now()}`,
        kind: 'audio',
        title: `ویس صوتی (${recordedMime})`,
        mimeType: recordedMime,
        transcriptOrText: transcript,
        extractedSummary: data.summary,
        suggestedKeywords: data.suggestedKeyword ? [data.suggestedKeyword] : [],
        createdAt: new Date().toISOString(),
      };
      onAddAsset(newAsset);
      onApplyExtractedBrief({
        keyword: data.suggestedKeyword,
        instructions: transcript,
      });
    } catch (err) {
      setAudioError(err instanceof Error ? err.message : 'خطا در پردازش صوت');
    } finally {
      setAudioBusy(false);
    }
  }

  function attachManualTranscript() {
    if (!manualAudioTranscript.trim()) return;
    onAddAsset({
      id: `audio-text-${Date.now()}`,
      kind: 'audio',
      title: 'متن پیاده‌شده ویس',
      transcriptOrText: manualAudioTranscript.trim(),
      extractedSummary: manualAudioTranscript.trim().slice(0, 180),
      createdAt: new Date().toISOString(),
    });
    onApplyExtractedBrief({ instructions: manualAudioTranscript.trim() });
  }

  async function extractAsset(kind: 'youtube' | 'video' | 'document') {
    setExtractBusy(true);
    setExtractError(null);
    try {
      const payload =
        kind === 'youtube'
          ? { kind: 'youtube', url: youtubeUrl.trim(), rawText: youtubeNotes.trim(), language }
          : kind === 'video'
          ? {
              kind: 'video',
              title: videoUrlOrName.trim() || 'فایل ویدیویی',
              url: videoUrlOrName.startsWith('http') ? videoUrlOrName.trim() : undefined,
              rawText: videoNotes.trim(),
              language,
            }
          : {
              kind: 'document',
              title: docTitle.trim() || 'سند متنی',
              rawText: docContent.trim(),
              language,
            };

      const res = await fetch('/api/assets/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        extractedSummary?: string;
        facts?: string[];
        suggestedKeywords?: string[];
        warnings?: string[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || 'خطا در استخراج منبع');
      }

      const asset: SourceAssetItem = {
        id: `${kind}-${Date.now()}`,
        kind,
        title:
          kind === 'youtube'
            ? `ویدیو یوتیوب (${extractYoutubeId(youtubeUrl) || 'لینک'})`
            : kind === 'video'
            ? videoUrlOrName || 'ویدیو'
            : docTitle || 'سند ضمیمه‌شده',
        url: kind === 'youtube' ? youtubeUrl.trim() : undefined,
        transcriptOrText:
          kind === 'youtube' ? youtubeNotes : kind === 'video' ? videoNotes : docContent,
        extractedSummary: data.extractedSummary,
        facts: data.facts ?? [],
        suggestedKeywords: data.suggestedKeywords ?? [],
        warnings: data.warnings ?? [],
        createdAt: new Date().toISOString(),
      };
      onAddAsset(asset);
      onApplyExtractedBrief({
        keyword: data.suggestedKeywords?.[0],
        secondaryKeywords: data.suggestedKeywords?.slice(1),
        instructions: data.extractedSummary,
      });
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'خطا در استخراج');
    } finally {
      setExtractBusy(false);
    }
  }

  function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocTitle(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDocContent(reader.result.slice(0, 40000));
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  function handleVideoFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoUrlOrName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
  }

  const ytId = extractYoutubeId(youtubeUrl);

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-medium text-slate-500 mb-2">
          حالت ورودی درخواست (مطابق اسکیمای n8n)
        </div>
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          {INPUT_MODES.map((m) => {
            const Icon = m.icon;
            const active = inputMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => onChangeInputMode(m.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Recording & Audio Upload */}
      {(inputMode === 'audio' || inputMode === 'mixed') && (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                ضبط ویس یا آپلود فایل صوتی (Stage 11 Assets)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                با میکروفون صحبت کنید یا فایل صوتی آپلود کنید تا به متن و بریف سئو تبدیل شود.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!recording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>شروع ضبط ویس</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>توقف ضبط ({formatTimer(elapsedSec)})</span>
                </button>
              )}

              <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>آپلود صوت</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {recording && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>در حال ضبط صدا...</span>
                <span className="font-mono tabular-nums">{formatTimer(elapsedSec)}</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-transform duration-75"
                  style={{ width: `${Math.max(8, audioLevel)}%` }}
                />
              </div>
            </div>
          )}

          {recordedBlobUrl && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <audio controls src={recordedBlobUrl} className="h-9 flex-1 min-w-[220px]" />
              <button
                type="button"
                onClick={transcribeVoiceBrief}
                disabled={audioBusy}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {audioBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>تبدیل ویس به متن (Gemini Transcribe)</span>
              </button>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-600 mb-1">
              متن پیاده‌شده ویس (قابل ویرایش دستی)
            </label>
            <div className="flex gap-2">
              <textarea
                value={manualAudioTranscript}
                onChange={(e) => setManualAudioTranscript(e.target.value)}
                rows={2}
                placeholder="پس از ضبط ویس، متن اینجا ظاهر می‌شود یا می‌توانید متن صوت را وارد کنید..."
                className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={attachManualTranscript}
                disabled={!manualAudioTranscript.trim()}
                className="px-3 py-2 rounded-md border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap shrink-0 self-end cursor-pointer"
              >
                افزودن به منابع
              </button>
            </div>
          </div>

          {audioError && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {audioError}
            </div>
          )}
        </div>
      )}

      {/* YouTube Input */}
      {(inputMode === 'youtube' || inputMode === 'mixed') && (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">ورودی یوتیوب (YouTube Asset)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              لینک ویدیوی یوتیوب و متن رونوشت یا یادداشت‌های ویدیو را وارد کنید تا بدون ادعای ساختگی تحلیل شود.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">لینک ویدیو یوتیوب</label>
              <input
                type="url"
                dir="ltr"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 font-mono"
              />
              {ytId && (
                <div className="mt-1.5 text-xs text-slate-600 flex items-center gap-2">
                  <span>شناسه ویدیو:</span>
                  <span className="font-mono text-slate-900">{ytId}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                متن رونوشت / نکات کلیدی ویدیو
              </label>
              <textarea
                value={youtubeNotes}
                onChange={(e) => setYoutubeNotes(e.target.value)}
                rows={2}
                placeholder="رونوشت یا تایم‌کدهای مهم ویدیو را اینجا قرار دهید..."
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={extractBusy || (!youtubeUrl.trim() && !youtubeNotes.trim())}
              onClick={() => extractAsset('youtube')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {extractBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>تحلیل و استخراج منبع یوتیوب</span>
            </button>
          </div>
        </div>
      )}

      {/* Video Input */}
      {(inputMode === 'video' || inputMode === 'mixed') && (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">ورودی ویدیو (Video Asset)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                فایل ویدیو را انتخاب کنید یا لینک/شرح محتوای ویدیویی را ضمیمه نمایید.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>انتخاب فایل ویدیو</span>
              <input type="file" accept="video/*" onChange={handleVideoFileSelect} className="hidden" />
            </label>
          </div>
          <input
            type="text"
            value={videoUrlOrName}
            onChange={(e) => setVideoUrlOrName(e.target.value)}
            placeholder="نام فایل یا آدرس ویدیو..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
          <textarea
            value={videoNotes}
            onChange={(e) => setVideoNotes(e.target.value)}
            rows={2}
            placeholder="توضیحات یا متن گفتار ویدیو را وارد کنید..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={extractBusy || (!videoUrlOrName.trim() && !videoNotes.trim())}
              onClick={() => extractAsset('video')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {extractBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>استخراج و اتصال منبع ویدیو</span>
            </button>
          </div>
        </div>
      )}

      {/* Document Input */}
      {(inputMode === 'document' || inputMode === 'mixed') && (
        <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">آپلود سند و دیتاشیت محصول</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                فایل‌های TXT، Markdown، JSON، HTML یا CSV (مانند بریف، facts.txt یا product-data.json) را وارد کنید.
              </p>
            </div>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer whitespace-nowrap shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>انتخاب فایل متنی</span>
              <input
                type="file"
                accept=".txt,.md,.json,.html,.csv"
                onChange={handleDocUpload}
                className="hidden"
              />
            </label>
          </div>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            placeholder="عنوان سند (مثلاً product-data.json یا facts.txt)"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
          <textarea
            value={docContent}
            onChange={(e) => setDocContent(e.target.value)}
            rows={3}
            placeholder="متن سند یا داده‌های فنی تاییدشده را اینجا جای‌گذاری کنید..."
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900"
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={extractBusy || !docContent.trim()}
              onClick={() => extractAsset('document')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {extractBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>استخراج حقایق سند</span>
            </button>
          </div>
        </div>
      )}

      {extractError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {extractError}
        </div>
      )}

      {/* Attached Assets Queue */}
      {assets.length > 0 && (
        <div className="border-t border-slate-200 pt-3 space-y-2">
          <div className="text-xs font-medium text-slate-600">
            منابع و فایل‌های متصل‌شده به این درخواست ({assets.length})
          </div>
          <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg bg-white">
            {assets.map((asset) => (
              <div key={asset.id} className="p-3 flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                    <span>{asset.title}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-mono text-slate-500">{asset.kind}</span>
                  </div>
                  {asset.extractedSummary && (
                    <p className="text-xs text-slate-600 leading-relaxed">{asset.extractedSummary}</p>
                  )}
                  {asset.facts && asset.facts.length > 0 && (
                    <div className="text-[11px] text-slate-500">
                      {asset.facts.length} نکته تاییدشده استخراج شد
                    </div>
                  )}
                  {asset.warnings && asset.warnings.length > 0 && (
                    <div className="text-[11px] text-amber-700">
                      هشدار: {asset.warnings.join(' | ')}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAsset(asset.id)}
                  title="حذف منبع"
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-md cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

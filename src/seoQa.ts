/**
 * TypeScript SEO QA checker (ported from seo_qa.py) & CMS HTML/JSON-LD builder
 * supporting stages 28_factcheck, 29_links, 30_html, 32_delivery, and 33_sheets.
 */
import type { SeoAgentResult, SeoRequestInput } from './seoAgent.js';

export interface SeoQaReport {
  pass: boolean;
  wordCount: number;
  info: string[];
  warnings: string[];
  fails: string[];
}

function normalizeText(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/\u200c/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildCmsHtml(
  request: SeoRequestInput,
  result: SeoAgentResult
): string {
  const article = result.article as {
    title?: string;
    meta_title?: string;
    meta_description?: string;
    sections?: Array<{ heading?: string; purpose?: string; content?: string }>;
    body?: string;
    faq?: Array<{ question?: string; answer?: string }>;
  };

  const outline = result.outline as {
    title?: string;
    sections?: Array<{ heading?: string; purpose?: string }>;
  };

  const lang = (request.language || 'fa').toLowerCase();
  const isRtl = ['fa', 'ar', 'he', 'ur'].includes(lang);
  const title = article.title || outline.title || request.primary_keyword;
  const metaTitle = article.meta_title || `${request.primary_keyword} — راهنمای جامع`;
  const metaDescription =
    article.meta_description ||
    (article.body ? article.body.slice(0, 150) : request.user_instructions || title);
  const handle = request.primary_keyword.trim().replace(/\s+/g, '-');

  const sections: Array<{ heading?: string; purpose?: string; content?: string }> =
    article.sections && article.sections.length > 0
      ? article.sections
      : outline.sections ?? [];

  const sectionHtml = sections
    .map(
      (s) =>
        `  <section>\n    <h2>${escapeHtml(s.heading || 'بخش')}</h2>\n    <p>${escapeHtml(
          s.content || s.purpose || ''
        )}</p>\n  </section>`
    )
    .join('\n');

  const faqItems = article.faq ?? [];
  const faqHtml =
    faqItems.length > 0
      ? `\n  <section>\n    <h2>پرسش‌های متداول</h2>\n${faqItems
          .map(
            (q) =>
              `    <h3>${escapeHtml(q.question || '')}</h3>\n    <p>${escapeHtml(
                q.answer || ''
              )}</p>`
          )
          .join('\n')}\n  </section>`
      : '';

  const jsonLd =
    faqItems.length > 0
      ? `\n<script type="application/ld+json">\n${JSON.stringify(
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((q) => ({
              '@type': 'Question',
              name: q.question || '',
              acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer || '',
              },
            })),
          },
          null,
          2
        )}\n</script>`
      : '';

  return `<!--
Meta title: ${metaTitle}
Meta description: ${metaDescription}
Handle: ${handle}
Content type: ${request.content_type}
Status: awaiting_human_approval
-->
<article lang="${escapeHtml(request.locale || lang)}" dir="${isRtl ? 'rtl' : 'ltr'}">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(article.body || '')}</p>
${sectionHtml}${faqHtml}
</article>${jsonLd}`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function runSeoQa(
  html: string,
  options: {
    keyword?: string;
    locale?: string;
    contentType?: string;
  } = {}
): SeoQaReport {
  const info: string[] = [];
  const warnings: string[] = [];
  const fails: string[] = [];

  const visible = stripTags(html);
  const wordCount = visible ? visible.split(/\s+/).length : 0;
  info.push(`Visible words: ${wordCount}`);

  const mt = html.match(/Meta title:\s*(.+?)\s*(?:-->|\n|$)/);
  const md = html.match(/Meta description:\s*(.+?)\s*(?:-->|\n|$)/);
  if (mt) {
    info.push(`Meta title (${mt[1].length} chars): ${mt[1]}`);
    if (mt[1].length > 60) {
      warnings.push(`Meta title ${mt[1].length} chars (> 60 may truncate)`);
    }
  } else {
    warnings.push("No 'Meta title:' line in the top comment");
  }
  if (md) {
    info.push(`Meta description (${md[1].length} chars)`);
    if (md[1].length > 160) {
      warnings.push(`Meta description ${md[1].length} chars (> 160 may truncate)`);
    }
  } else {
    warnings.push("No 'Meta description:' line in the top comment");
  }

  // Heading checks
  const hMatches = [...html.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi)];
  const h1s = hMatches.filter((m) => m[1] === '1');
  if (h1s.length !== 1) {
    fails.push(`${h1s.length} H1 tags (need exactly 1)`);
  }
  let prev = 0;
  for (const m of hMatches) {
    const lvl = Number(m[1]);
    const txt = stripTags(m[2]);
    if (prev && lvl > prev + 1) {
      fails.push(`Skipped heading level before H${lvl}: ${txt}`);
    }
    prev = lvl;
  }

  // Keyword presence
  if (options.keyword) {
    const kw = normalizeText(options.keyword);
    const nv = normalizeText(visible);
    const exact = kw ? nv.split(kw).length - 1 : 0;
    const inH1 = h1s.length > 0 && normalizeText(h1s[0][2]).includes(kw);
    info.push(`Keyword '${options.keyword}': ${exact}x exact; in H1: ${inH1}`);
    if (exact === 0) {
      warnings.push('Primary keyword does not appear in visible text');
    }
    if (h1s.length > 0 && !inH1) {
      warnings.push('Primary keyword not found in H1');
    }
    if (wordCount > 0 && (exact * kw.split(' ').length) / wordCount > 0.03) {
      warnings.push('Keyword density above 3%');
    }
  }

  // Persian/RTL hygiene
  const lang = (options.locale || '').toLowerCase().split('-')[0];
  if (lang === 'fa') {
    if (/[يك]/.test(visible)) {
      fails.push('Arabic-form letters ي/ك found in Persian text; use ی/ک');
    }
    const zwCount = (html.match(/\u200c/g) ?? []).length;
    info.push(`ZWNJ count: ${zwCount}`);
    const detachedMi = visible.match(/(?<![\w\u200c])می [\u0600-\u06ff]{2,}/g);
    if (detachedMi && detachedMi.length > 0) {
      warnings.push(`Detached verb prefix (${detachedMi.length}x, e.g. '${detachedMi[0]}')`);
    }
  }

  // Script & handler hygiene
  if (/<script(?![^>]*application\/ld\+json)[^>]*>/i.test(html)) {
    fails.push('Non-JSON-LD <script> tag detected in output HTML');
  }
  if (/\son[a-z]+\s*=/i.test(html)) {
    fails.push('Inline event handler attribute detected');
  }

  // JSON-LD validation
  const ldBlocks = [
    ...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  ];
  for (const blk of ldBlocks) {
    try {
      const parsed = JSON.parse(blk[1]) as { '@type'?: string };
      info.push(`Valid JSON-LD block: ${parsed['@type'] || 'Object'}`);
    } catch (e) {
      fails.push(`Invalid JSON-LD block: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  if (options.contentType === 'advertorial') {
    if (!/تبلیغ|رپورتاژ|حمایت[\s\u200c]?شده|sponsored|advertorial/i.test(html)) {
      warnings.push('No sponsored/advertorial disclosure label detected');
    }
  }

  return {
    pass: fails.length === 0,
    wordCount,
    info,
    warnings,
    fails,
  };
}

export function buildSheetsRow(
  requestId: string,
  request: SeoRequestInput,
  status: string,
  qa: SeoQaReport
): string {
  const cols = [
    requestId,
    request.primary_keyword,
    request.content_type,
    request.locale || request.language || '',
    status,
    String(qa.wordCount),
    String(qa.fails.length),
    String(qa.warnings.length),
    new Date().toISOString(),
  ];
  return (
    'request_id,primary_keyword,content_type,locale,status,word_count,qa_fails,qa_warnings,updated_at\n' +
    cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')
  );
}

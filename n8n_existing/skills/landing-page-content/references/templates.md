# Templates — copy these and fill the {placeholders}

Keep markup clean: no wrapper, no heavy inline CSS, no inline `direction`/`text-align` styles on RTL
pages. `<bdi>` is semantic, not a style — it stays, exactly as in `gzlocation`. Localize every visible
label to the page's language. Cut any block below that the brief has no real data for (rule 5) —
these are shapes to fill with real content, not sections every page must contain.

## Table of contents
1. Meta / SEO comment block (top of file)
2. Hero
3. Trust strip (conditional)
4. Problem framing
5. Benefit card
6. How-it-works step
7. Deeper narrative section (150–250 words)
8. Comparison / pricing table (conditional)
9. Testimonial block (conditional — real only)
10. Objection-handling / guarantee block
11. Local-service contact block (conditional, reused from gzlocation)
12. Repeated CTA block
13. FAQ + FAQPage JSON-LD
14. Organization / Service / Product JSON-LD
15. Preview-only style (optional)

---

## 1. Meta / SEO comment block

```html
<!-- ===================================================================
     SEO FIELDS — put these in the CMS "Edit website SEO" section,
     NOT in the visible page body.
     Meta title:        {CTR meta title, keyword-first, ≤ ~60 chars}
     Meta description:  {≤ ~155 chars, ends with a soft CTA}
     Suggested handle:  {primary-keyword-slug}
     ==================================================================== -->
```

## 2. Hero

```html
<h1>{Benefit-led headline for the ONE persona — keyword worked in naturally}</h1>
<p class="hero-sub">{1–2 sentences expanding the promise}</p>
<p><a class="cta-primary" href="{primary CTA target}">{Concrete next step, e.g. "دریافت مشاوره رایگان"}</a>
<!-- secondary CTA only if a lower-commitment path genuinely fits the offer -->
<a class="cta-secondary" href="{secondary CTA target}">{e.g. "مشاهده نمونه کار"}</a></p>
<!-- inline trust signal ONLY if real, e.g. "+2500 مشتری راضی" backed by the brief -->
<!-- [image/icon placeholder] hero visual — note only, do not design it -->
```

## 3. Trust strip (conditional — only with real logos/ratings/stats)

```html
<div class="trust-strip">
  <p>{e.g. "⭐ 4.8/5 از 210 نظر" — only if the brief gives a real number}</p>
  <!-- client logos as plain text/alt names if no real image assets are provided -->
</div>
```

## 4. Problem framing

```html
<h2>{Section heading naming the pain point}</h2>
<p>{2–4 sentences. Name the pain this ONE persona has right now — no long narrative windup.}</p>
```

## 5. Benefit card (30–70 words each; repeat in a grid/list)

```html
<div class="benefit-card">
  <h3>{Benefit stated as an outcome, not a feature name}</h3>
  <p>{30–70 words. What the reader gets, not what the product has. One idea.}</p>
</div>
```

## 6. How-it-works step

```html
<ol class="how-it-works">
  <li><strong>{Step name}</strong> — {short outcome-focused sentence}</li>
  <!-- 3–5 steps total -->
</ol>
```

## 7. Deeper narrative section (max 3 on the page, ~150–250 words each)

```html
<h2>{e.g. "چرا {brand}" / "درباره این خدمت"}</h2>
<p>{150–250-word block — a ceiling, not a target. This is the only place on the page prose is allowed
   to run longer than a card. Still benefit-first, still no filler.}</p>
```

## 8. Comparison / pricing table (conditional — only when the category is mature enough)

```html
<table>
  <thead><tr><th>{Option}</th><th>{Dimension A}</th><th>{Dimension B}</th><th>{Best for}</th></tr></thead>
  <tbody>
    <tr><td>{us}</td><td>…</td><td>…</td><td>…</td></tr>
    <tr><td>{alternative}</td><td>…</td><td>…</td><td>…</td></tr>
  </tbody>
</table>
```

## 9. Testimonial block (conditional — real data only, never invented)

```html
<div class="testimonial">
  <p>"{Verbatim or accurately summarized quote from the brief/user — include a concrete outcome
     where the source gives one, e.g. a % or a time saved.}"</p>
  <p class="attribution"><strong>{Real name}</strong>, {real role/company or at least city}</p>
</div>
<!-- No real testimonial in the brief → omit this whole block, don't write a placeholder-sounding one -->
```

## 10. Objection-handling / guarantee block

```html
<h2>{e.g. "بدون ریسک امتحان کن" / a real objection framed as a heading}</h2>
<p>{Guarantee, risk-reversal, or trial terms — only claims the brief actually backs.}</p>
<!-- optional honest fit-check, only where it suits the vertical -->
<p><strong>{این برای شما نیست اگر…}</strong> {one honest disqualifying line}</p>
```

## 11. Local-service contact block (conditional — reused from gzlocation)

Same rules as `gzlocation`'s per-business contact list: every phone/email/website is a live link
everywhere it appears; on RTL pages, Latin-digit runs sit inside `<bdi>` and phone numbers display
unbroken (`09044818841`, never hyphenated); a verified social handle is a first-class contact field in
markets like Iran/Middle East/LatAm and can stand in for a missing website.

```html
<ul class="contact-block">
  <li><strong>{Phone}:</strong> <a href="tel:{+E164}"><bdi>{unbroken phone}</bdi></a></li>
  <li><strong>{Web}:</strong> <a href="{https://site}" rel="nofollow noopener" target="_blank">{domain}</a></li>
  <li><strong>{Instagram}:</strong> <a href="https://www.instagram.com/{handle}/" rel="nofollow noopener" target="_blank">{handle}@</a></li>
  <li><strong>{Location}:</strong> {service area / address}</li>
</ul>
<!-- Map embed only with verified coordinates: -->
<figure>
  <iframe src="https://www.google.com/maps?q={LAT},{LNG}&hl={lang}&z=16&output=embed"
    width="100%" height="320" style="border:0;" loading="lazy"
    referrerpolicy="no-referrer-when-downgrade" title="{Business/service name}"></iframe>
</figure>
```

## 12. Repeated CTA block (place at hero, mid-page, before FAQ, and at the end — 3+ total)

```html
<div class="cta-block">
  <p><a class="cta-primary" href="{primary CTA target}">{same concrete next-step copy each time}</a></p>
  <!-- risk-reducing microcopy ONLY if true, e.g.: -->
  <p class="cta-microcopy">{"بدون نیاز به کارت اعتباری" / "پاسخ ظرف ۲۴ ساعت"}</p>
</div>
```

## 13. FAQ + FAQPage JSON-LD

Visible FAQ — built from real likely objections for this offer, not generic filler:

```html
<h2>{Frequently Asked Questions / سوالات متداول}</h2>
<h3>{Real question a buyer of this actually asks}?</h3>
<p>{Answer in the first sentence, then 1–3 more if needed.}</p>
<!-- repeat -->
```

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "{Question 1 — must match visible text}",
      "acceptedAnswer": { "@type": "Answer", "text": "{Answer 1 — must match visible text}" } }
  ]
}
</script>
```

## 14. Organization / Service / Product JSON-LD

Pick the type that matches the offer; drop fields you don't have real data for rather than guessing.

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{offer name}",
  "provider": { "@type": "Organization", "name": "{brand}", "url": "{site}" },
  "areaServed": "{only for local-service pages, if real}",
  "description": "{short, matches the page}"
}
</script>
<!-- add "@type": "AggregateRating" nested under the entity ONLY with a real rating value + count -->
```

## 15. Preview-only style (optional)

```html
<style>
  .lp-preview{max-width:760px;margin:2rem auto;padding:0 1.2rem;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#222;line-height:1.6;font-size:17px}
  .lp-preview h1{font-size:2rem;line-height:1.25;margin:.2em 0 .4em}
  .lp-preview h2{font-size:1.4rem;margin:1.6em 0 .5em}
  .lp-preview .cta-primary{display:inline-block;background:#1a7f5a;color:#fff;padding:.7em 1.3em;border-radius:6px;text-decoration:none;font-weight:600;margin-right:.5em}
  .lp-preview .cta-secondary{display:inline-block;color:#1a7f5a;text-decoration:underline;font-weight:500}
  .lp-preview .cta-microcopy{font-size:.85rem;color:#666;margin-top:.4em}
  .lp-preview .benefit-card{border:1px solid #eee;border-radius:8px;padding:1em;margin:.6em 0}
  .lp-preview .testimonial{border-left:3px solid #1a7f5a;padding:.6em 1em;margin:1em 0;background:#f7faf8;font-style:italic}
  .lp-preview table{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:.95rem}
  .lp-preview th,.lp-preview td{border:1px solid #ddd;padding:.55em .7em;text-align:left;vertical-align:top}
</style>
```

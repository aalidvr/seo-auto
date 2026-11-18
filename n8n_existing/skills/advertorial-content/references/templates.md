# Templates — advertorial blocks

Plain semantic HTML; no schema, scripts, iframes. Localise labels. Latin names in `<bdi>` on RTL pages.

## Contents
1. Meta/SEO comment · 2. Headline options · 3. Body skeleton · 4. Quote · 5. Link plan table · 6. Boilerplate and disclosure

## 1. Meta / SEO comment
```html
<!-- PUBLISHER FIELDS
     Headline options (<=70 chars):
       1. {best, used as the H1}
       2. {alternative}
       3. {alternative}
     Meta title:        {about 60 chars, if the publisher uses it}
     Meta description:  {about 155 chars}
     Angle:             {news | educational | story | seasonal}
     Disclosure:        {label text} (publisher sets final label and rel) -->
```

## 2-3. Body skeleton
```html
<h1>{Headline option 1}</h1>
<p>{Lead, 25-60 words: who, what, when/where, why it matters.}</p>
<h2>{Section: context or the useful substance}</h2>
<p>{Value for the reader first; the brand appears naturally.}</p>
<h2>{Section: how it works / what the reader can do}</h2>
<p>{Specific details from the client's facts.}</p>
<!-- optional: <ul> of steps or points when the publisher allows lists -->
<p>{Soft CTA with the link from the plan, e.g. "See how it works on <a href=...>{descriptive anchor}</a>."}</p>
<p><em>{Disclosure label, e.g. محتوای حمایت‌شده}</em></p>
```

## 4. Quote (only if client-supplied, verbatim)
```html
<blockquote>«{exact quote as supplied}»</blockquote>
<p>{Real speaker name}, {real role} at {brand}</p>
```

## 5. Link plan table (delivery note, not in the page)

| Anchor | URL | Type | Section | rel |
|---|---|---|---|---|
| {brand name} | {url} | brand | lead or first mention | sponsored noopener |
| {descriptive phrase} | {url} | partial/descriptive | {section} | sponsored noopener |

Links in the page: `<a href="{url}" rel="sponsored noopener">{anchor}</a>`; add `target="_blank"` only if
the publisher asks.

## 6. Boilerplate and disclosure
```html
<h2>{About {brand}}</h2>
<p>{40-70 words, client facts only.}</p>
```
Plain-text version: same content, headings as lines, links as `anchor (url)`.

# Templates — copy-ready HTML snippets

Use these so every article ships in the same clean, CMS-ready shape. Semantic tags only; the site's
theme restyles on publish. Keep the preview `<style>` optional.

## Table of contents
1. Full document skeleton
2. Meta / SEO comment block (top of file)
3. At-a-glance answer table (opening)
4. Comparison table (any section)
5. Verbatim E-E-A-T citation
6. FAQ block + FAQPage JSON-LD
7. Reader comments block
8. Preview-only style

---

## 1. Full document skeleton

```html
<!DOCTYPE html>
<html lang="LOCALE"><!-- e.g. en-AU -->
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- [2] SEO comment block here -->
<title>CTR META TITLE</title>
<meta name="description" content="CTR META DESCRIPTION">
<!-- [6] FAQ JSON-LD here -->
<!-- [8] optional preview style here -->
</head>
<body>
<!-- ARTICLE BODY: copy everything inside <article> into the Shopify "Content" box.
     Shopify renders the post Title field as the <h1>, so you may delete the <h1> below. -->
<article class="article-preview">
  <h1>BRIEF H1</h1>
  <p>One-sentence answer …</p>
  <!-- [3] at-a-glance table -->
  ... sections, [4] tables, [5] citation, FAQ [6], bottom line, comments [7] ...
</article>
</body>
</html>
```

## 2. Meta / SEO comment block

```html
<!-- ===================================================================
     SEO FIELDS — put these in the CMS "Edit website SEO" section,
     NOT in the visible article body.
     Meta title:        CTR META TITLE
     Meta description:   CTR META DESCRIPTION
     Suggested handle:   primary-keyword-slug
     ==================================================================== -->
```

## 3. At-a-glance answer table (opening)

Contains the *whole* answer. Columns adapt to the topic (decision / best choice / quick rule).

```html
<table>
  <thead><tr><th>Your decision</th><th>The best choice</th><th>Quick rule</th></tr></thead>
  <tbody>
    <tr><td>…</td><td>…</td><td>…</td></tr>
    <tr><td>…</td><td>…</td><td>…</td></tr>
  </tbody>
</table>
```

## 4. Comparison table (any section)

```html
<table>
  <thead><tr><th>Option</th><th>Dimension A</th><th>Dimension B</th><th>Best for</th></tr></thead>
  <tbody>
    <tr><td>…</td><td>…</td><td>…</td><td>…</td></tr>
  </tbody>
</table>
```

## 5. Verbatim E-E-A-T citation

Attribution OUTSIDE the quote; brand linked to the SPECIFIC page; quote copied word-for-word from
`web_fetch`, ≤15 words. Lead a mid-sentence fragment with an ellipsis.

```html
<p>… your own sentence making the claim. According to
   <a href="https://exact-page-url" target="_blank" rel="noopener">Source Brand</a>:</p>
<blockquote cite="https://exact-page-url">"…verbatim quote of fifteen words or fewer"</blockquote>
```

## 6. FAQ block + FAQPage JSON-LD

Visible FAQ:

```html
<h2>Frequently Asked Questions</h2>
<h3>Question one?</h3>
<p>Answer in the first sentence, then 1–3 more.</p>
<h3>Question two?</h3>
<p>…</p>
```

Matching schema (put in `<head>` or end of body). Answers must match the visible text:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Question one?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer one." } },
    { "@type": "Question", "name": "Question two?",
      "acceptedAnswer": { "@type": "Answer", "text": "Answer two." } }
  ]
}
</script>
```

## 7. Reader comments block

Two comments, question-led, different casual tones, imperfect punctuation; polished brand replies.

```html
<h2>From Our Readers</h2>

<div class="comment">
  <p class="q"><strong>Name</strong><br><em>casual question with imperfect punctuation..</em></p>
  <p><strong>Brand Name:</strong> Helpful, specific reply that reuses the article's advice.</p>
</div>

<div class="comment">
  <p class="q"><strong>Other Name</strong><br><em>a differently-toned question??</em></p>
  <p><strong>Brand Name:</strong> …</p>
</div>
```

## 8. Preview-only style (optional)

Makes the file readable in a browser for client preview; the theme overrides it on publish.

```html
<style>
  .article-preview{max-width:760px;margin:2rem auto;padding:0 1.2rem;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#222;line-height:1.65;font-size:17px}
  .article-preview h1{font-size:2rem;line-height:1.25;margin:.2em 0 .6em}
  .article-preview h2{font-size:1.5rem;margin:1.8em 0 .5em;border-bottom:1px solid #eee;padding-bottom:.2em}
  .article-preview h3{font-size:1.2rem;margin:1.4em 0 .4em}
  .article-preview table{width:100%;border-collapse:collapse;margin:1.2em 0;font-size:.95rem}
  .article-preview th,.article-preview td{border:1px solid #ddd;padding:.55em .7em;text-align:left;vertical-align:top}
  .article-preview th{background:#f6f6f6}
  .article-preview blockquote{margin:1.2em 0;padding:.6em 1.1em;border-left:4px solid #b8926a;background:#faf7f2;font-style:italic;color:#444}
  .article-preview .comment{border:1px solid #eee;border-radius:8px;padding:.9em 1.1em;margin:1em 0;background:#fafafa}
  .article-preview .comment .q{color:#555;margin:.2em 0 .7em}
  .article-preview a{color:#9c6b3f}
</style>
```

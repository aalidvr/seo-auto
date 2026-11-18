---
name: seo-blog-guide
description: >-
  Write a complete, publish-ready SEO buying-guide or pillar blog post from a content brief or a
  keyword + outline, for an e-commerce or content site, in ANY language. Use whenever the user gives
  a content brief, a keyword with a heading outline, or says things like "write this blog post",
  "turn this brief into an article", "write an SEO buying guide", "pillar post", "بلاگ بنویس", "این
  بریف رو مقاله کن", "مقاله سئو بنویس" — even without the word "skill". Produces an answer-first
  article (a summary table before any preamble), 4–6 comparison tables, one strict VERBATIM external
  E-E-A-T citation, an FAQ with matching FAQPage JSON-LD, two natural reader comments, and
  CTR-optimized meta, as clean CMS-ready (Shopify) HTML. Goal: follow the brief's outline EXACTLY and
  beat a competing article from the same brief on execution. Do NOT use for directory "listicle of
  businesses" pages — use gzlocation for those.
---

# SEO Blog Guide — buying-guide / pillar-post builder

This skill turns a brief (or keyword + outline) into ONE publish-ready blog article as clean,
CMS-ready HTML. It exists to reproduce, every time, the quality bar that separates a "medium" AI
article from one that outranks a human competitor working from the same brief.

The single most important idea: **the brief owns the structure; you own the execution.** Match the
brief's outline, keyword, and internal links exactly — then win on the things the brief can't
specify: an answer-first opening, high information density, scannable tables, a real authoritative
citation, snippet-ready FAQs, and click-worthy meta. Every factual claim you add on top must be
true; the one external quote must be copied verbatim from a real page — never invented.

## Inputs (the brief)

Extract from the brief (or ask, but don't stall — make a reasonable assumption and state it):

- **Primary keyword** and article **type/intent** (buying guide, pillar, comparison…).
- **Meta title & description** — treat any provided ones as a *starting point to rewrite* (see rule 9).
- **Word-count range** — stay inside it.
- **Tone of voice** and **target audience**.
- **Locale / spelling** — infer from the domain (e.g. an `.com.au` site → Australian English:
  colour, metres, centimetres, cosy). Write the whole article in the site's language and spelling.
- **Internal links** — the exact set of URLs + anchors to use. Use ONLY these; never add internal
  links the brief didn't give, and never link to a competitor.
- **Heading / section outline** — the H1, H2s and H3s. Follow this EXACTLY (see rule 1).

**Replacement vs. differentiation fork.** If an article already exists on the site (or a competitor
wrote one) for this keyword: if the user wants to *replace* it, follow the brief exactly and win on
execution — do NOT restructure or add off-brief sections. If the user explicitly wants to
*differentiate* (new URL, adjacent keyword), you may reangle; surface that decision rather than
guessing.

## The non-negotiables

Each rule below includes *why* it matters — apply the spirit, not just the letter.

### 1. Follow the brief's outline exactly
Use the brief's H1 and every H2/H3 in the same order. Exactly ONE H1; correct H2/H3 hierarchy
(a stray second H1 or a skipped level is a real ranking and accessibility fault). Do not add or drop
top-level sections. A "conclusion" and the additions below (citation, comments) live *inside* the
existing structure — they are execution, not new scope. Use the primary keyword in the H1, the first
sentence, and naturally throughout, plus natural variants; never keyword-stuff.

### 2. Answer-first (the highest-impact rule)
Open with ONE short sentence that directly answers the main query, then IMMEDIATELY a summary
"at-a-glance" TABLE that contains the *whole* answer (the key decisions + recommendations). No
throat-clearing, no scene-setting paragraph first. A reader who reads only the first screen should
already have the answer; this is what wins the first impression and the featured snippet.

### 3. Information density (no "آب بستن")
Every sentence earns its place. Cut filler, restatements of the obvious, and empty connective
sentences ("Now that we've covered X, let's look at Y"). Keep the warm expert voice the brief asks
for — that voice is engagement and E-E-A-T, not padding — but never pad to hit a word count. Density
over volume. Tables raise density; use them (rule 4).

### 4. Tables (scannability + density)
Use several tables — roughly **one per major section**, about **4–6 total** — for multi-dimensional,
comparable data (sizes, materials, options, care routines, style→mood, pros/cons). Rules:
- A table must NOT restate prose sitting right next to it. If the info is already in adjacent prose,
  don't also table it (and vice-versa) — that redundancy reads as "spec-sheet" filler.
- Never stack tables back-to-back; separate every table with prose so each one lands.
- A table is for *comparison*, not for a single fact or a list that reads fine as a sentence.

### 5. Internal links
Use ONLY the brief's internal links. Weave each into the single most relevant section with
**descriptive anchor text** (the collection/page name, never "click here" or a bare URL). Placing a
"sizing guide" link in the sizing section (not the intro) is worth more than scattering links.

### 6. External citation for E-E-A-T (strict — the part everyone gets wrong)
Include **at least one** quote from an external source. This is grounded, not from memory:
1. `web_search` for an authoritative page on a factual claim you're already making (material
   science, health/allergy, thermal properties, safety, etc.).
2. Choose a source that is ALL of: **authoritative** (university, science/education body, government,
   standards or industry-technical org), **topically relevant** (e.g. a fibre/material-science page),
   **non-competitor**, **non-commercial** (not a shop, not a brand promoting its own product), and
   **not Wikipedia**.
3. `web_fetch` that page and **copy the quote verbatim** from the fetched text — word-for-word, exact
   punctuation. Keep it **≤ 15 words** (copyright + snippet hygiene). If the useful sentence is
   longer, quote a ≤15-word verbatim fragment and lead it with an ellipsis.
4. Format — attribution OUTSIDE the quote, brand name linked to the SPECIFIC page (not the homepage):

   ```
   According to [Brand Name](https://exact-page-url):
   > "…verbatim quote"
   ```

If you cannot verify a real exact quote from a qualifying source, find a different qualifying source
— **never fabricate a quote, statistic, URL, or attribution.** One quote per source; the rest of any
source is paraphrased in your own words. See `references/source-vetting.md` if unsure whether a
source qualifies.

### 7. FAQ + FAQPage JSON-LD
Add the FAQ section the brief calls for: cover its People-Also-Ask questions PLUS 1–3 more
high-value long-tail questions. Answers are concise and snippet-ready (2–4 sentences, answer in the
first sentence). Then emit valid `FAQPage` JSON-LD whose questions/answers match the visible FAQ
verbatim (mismatched schema is worse than none).

### 8. Reader comments (engagement + freshness signals)
End the article with **two** reader comments. Each is primarily a QUESTION, in a DIFFERENT casual
tone, written like a real person: informal, lowercase, imperfect punctuation, missing apostrophes —
NOT polished copy. Each is followed by a genuinely helpful, well-written **brand reply** that reuses
the article's own advice (and can name the relevant material/product concept). Real, specific
scenarios (a room measurement, a pet situation) beat generic ones.

### 9. Meta title & description (CTR copywriting)
Rewrite both — a plain "Keyword: Guide" title leaves clicks on the table. Requirements:
- **Keyword-first**, plus at least one CTR device: a number, brackets, a power word, or punctuation;
  the description ends with a soft CTA.
- **Evergreen** — avoid a year unless the user asks (a year forces annual re-editing; flag the
  trade-off if you use one).
- Length: title ≤ ~60 characters, description ≤ ~155 characters.

### 10. Integrity & copyright
No fabricated first-person experience ("in my 15 years…"), no invented facts, product names, or
prices. Correct a wrong figure in the brief rather than reproducing it, and tell the user. Paraphrase
everything except the single ≤15-word verbatim citation; never reproduce long passages from any
source.

### 11. Locale & spelling
Match the site's locale throughout — spelling, units, bed/product sizing conventions, seasonal
references. An `.com.au` article says colour/metres/cosy and uses metric + Australian sizes.

## Process

1. **Parse the brief** into: keyword, outline, internal links, tone, audience, locale, word range,
   meta starting points. State any assumption you had to make.
2. **Lock the structure** to the brief's outline (rule 1). Note the replacement/differentiation fork
   if relevant.
3. **Write answer-first**: the one-sentence answer + the at-a-glance table (rule 2).
4. **Write each section** in brief order, dense prose + the right tables (rules 3–4), weaving the
   brief's internal links contextually (rule 5).
5. **Ground the citation**: `web_search` → pick a qualifying source → `web_fetch` → copy a ≤15-word
   verbatim quote → format per rule 6. If it doesn't qualify, try another source.
6. **Write the FAQ** and build the matching `FAQPage` JSON-LD (rule 7).
7. **Write the two comments** + brand replies (rule 8).
8. **Rewrite meta** title & description for CTR (rule 9).
9. **Assemble the HTML** using `references/templates.md`: meta/handle as an HTML comment at top, the
   semantic body, the JSON-LD script. Deliver a single `.html` in the outputs folder.
10. **Self-check** against the checklist below before presenting; fix anything that fails.

## Output format

Clean, publish-ready HTML for a Shopify/CMS blog post (see `references/templates.md` for exact
snippets):
- Semantic tags only: `h1/h2/h3, p, ul/li, table (thead/tbody), strong, a, blockquote[cite]`.
- FAQ JSON-LD in a `<script type="application/ld+json">` block.
- Meta title, meta description, and a suggested URL handle as an **HTML comment at the top** (for the
  CMS SEO fields — not visible body text).
- Note in a comment that Shopify renders the post Title field as the `<h1>`, so the body `<h1>` may be
  removed to avoid a duplicate. Light preview-only `<style>` is fine (the theme restyles on publish).
- Deliver one `.html` file via the file-presentation tool.

## Quality checklist (run before delivering)

- Opens with a one-line answer + at-a-glance table, no preamble.
- Brief outline matched exactly; exactly one H1; keyword in H1 + first sentence; correct locale/spelling.
- High density, no filler; ~4–6 non-redundant tables, spaced by prose.
- Only the brief's internal links, contextual, descriptive anchors, no competitor links.
- ≥1 verbatim (≤15-word) citation from a qualifying source, `According to [Brand](page):` outside the quote.
- FAQ present; JSON-LD valid and matching the visible FAQ.
- Two question-led comments in different natural tones + polished replies.
- Meta title & description rewritten for CTR, evergreen, within length limits.
- No fabricated experience/facts; word count in range.

## Hard rules (the core)

- Brief owns structure; you own execution. Follow the outline exactly; one H1.
- Answer-first: summary table before any preamble.
- Density over volume; cut filler; 4–6 non-redundant, spaced tables.
- Only the brief's internal links, woven with descriptive anchors; never link competitors.
- Exactly one grounded, VERBATIM (≤15-word) citation from an authoritative, relevant, non-competitor,
  non-commercial, non-Wikipedia source; `web_fetch` it and copy word-for-word; never fabricate.
- FAQ + matching FAQPage JSON-LD.
- Two natural, question-led comments (different tones, imperfect punctuation) + polished brand replies.
- CTR meta title/description, evergreen, within length limits.
- No fake experience or hallucinated facts; correct wrong brief figures and say so.
- Match the site's locale/spelling; stay in the word-count range.
- Output = clean CMS-ready HTML, meta as a top comment, JSON-LD inline; one `.html` file.

---
name: advertorial-content
description: >-
  Write a publisher-ready advertorial (sponsored article, "رپورتاژ آگهی", paid guest post, press-style
  brand story) in ANY language including Persian/RTL: headline options, lead, body, optional real
  quote, soft CTA, an honest link plan with anchors, disclosure label, meta, image alt suggestions and a
  plain-text version, fitted to a publisher's rules (word range, link limit, tone). Use whenever the
  user wants sponsored content for another site, a brand announcement or news-style article for a news
  site or blog, a "رپورتاژ", "رپورتاژ آگهی", "پست مهمان", "گست پست", "advertorial", "sponsored post",
  or a link-placement article — even without the word "skill". Uses only facts the client supplied or
  verified; never invents news hooks, quotes, spokespeople, statistics or reviews; never hides that the
  content is sponsored. Not for the brand's own site pages (landing-page-content, product-page-content,
  seo-blog-guide) or directory lists (gzlocation).
---

# Advertorial Content — sponsored article builder (v2.0.0)

Produces ONE advertorial for a third-party publisher. An advertorial is paid editorial space: it works
when it is useful or newsworthy to the publisher's readers and honest about being sponsored. It fails
when it reads as a naked ad, repeats the same brand sentence, or invents a story. Read
`references/core/core-rules.md` first (shared rules) and `references/core/persian-rtl-style.md` for RTL.
The publisher input is described in `references/publisher-profile.md`; copy-ready blocks are in
`references/templates.md`.

The single most important idea: **a real reason to publish, told for the publisher's reader, with the
brand as part of the story and not the whole story.** The reason (the news hook) and every fact come
from the client. You supply structure, clarity and tone.

## Honesty frame (not negotiable)

- The piece is sponsored. Include a disclosure label suggestion, and never write copy designed to make
  readers believe it is independent journalism or a neutral review. Where the publisher adds its own
  label, yours is a fallback.
- Paid links: Google's guidance asks for `rel="sponsored"` (or `nofollow`) on paid placements. Output
  links with `rel="sponsored noopener"`, tell the user the publisher sets the final attributes, and do
  not promise ranking benefit. Never suggest hiding the link, cloaking, or disguising the anchor.
- No invented news hook, quote, spokesperson, statistic, award, customer count, review or case study.
  A case story is allowed only when the client supplied its facts and permission.
- No unproven superlatives or comparative attacks on named competitors.
- YMYL topics (health, law, money, children) raise `YMYL_REVIEW` and use only label or register-backed
  wording.

## Inputs

Standard brief fields plus:

- **Brand facts** (class A): brand name and exact spelling, what it does, product or service names,
  prices only if given, locations, dates, numbers, certifications with proof.
- **News hook**: what is actually new or useful (launch, expansion, study the client ran, seasonal
  guide, partnership, event, answer to a common question). If none exists, switch to the **educational
  angle** (a useful guide where the brand is one real example) and say so; do not manufacture news.
- **Quotes**: client-supplied, verbatim, with the real speaker's name and role. No supplied quote → no
  quote.
- **Link plan**: target URLs the client wants, with `status`. Anchor types you may use: brand name,
  naked URL, partial or descriptive phrase, generic-but-meaningful call ("see the full range of …").
- **Publisher profile**: word range, link limit, tone, formatting limits, banned topics, whether
  disclosure and `rel` are added by the publisher.
- **Keyword** (the topic the client wants to be associated with), audience, language, locale.

Missing keyword or brand → `needs_input`. Missing hook → educational angle plus an assumption. Missing
publisher profile → defaults: 600-900 words, 2 links, neutral news tone.

## Rules

### 1. Pick the angle first and say it
Choose one: **news** (a real announcement), **educational** (a guide that helps the reader), **story**
(client-supplied facts about a real project or customer), **seasonal** (a timely, true reason). State
the angle and why in the delivery note. One angle per piece.

### 2. Headline
Deliver **three headline options** (up to 70 characters each, the best first), each informative, none
clickbait, none claiming more than the body supports. The primary keyword appears naturally in at least
one. The H1 in the page is the first option.

### 3. Lead (first paragraph, 25-60 words)
Answers who, what, when, where or why it matters, in plain news style. The brand appears in the lead
only if it is the news.

### 4. Body
- H2s every 120-200 words (2-5 sections), each doing one job: context, the useful substance, how it
  works, what readers can do.
- Value before brand: readers should learn something even if they never click.
- Brand mentions are natural and sparse; vary the reference (full name, short name, "the company").
  Roughly one mention per 100 words at most; the QA script warns above that.
- Specific beats generic: use the client's real details (a process, a material, a number the client
  gave) instead of adjectives.
- Tone follows the publisher profile, not the brand's ad voice.
- Statistics and dates only from the client's facts or a verified source (`core-rules.md` section 2).

### 5. Quote (optional)
Only a client-supplied quote, verbatim, in `<blockquote>` with the real speaker and role. The QA script
fails a quote that is not in the facts file. If asked to "add a quote from the CEO" and none exists,
say you cannot invent one and offer a neutral paraphrased statement attributed to "the company", only if
the facts support it.

### 6. Links and anchors
- Use only the link plan, at most the publisher's limit (default 2-3).
- Mix anchor types (brand, descriptive, naked). At most one exact-match keyword anchor, and only where it
  reads naturally; repeated identical anchors look manipulative and risk the publisher's and the
  client's reputation.
- Place links where the reader would want the target: the brand link at the first natural brand
  mention, a deep link where the topic reaches it.
- Draft or unverified URLs are not linked (`UNVERIFIED_URL`).
- Report the plan in a table: anchor, URL, type, section, `rel`.

### 7. CTA
One soft CTA at the end ("see how it works", "ask for a quote"), specific, honest, no invented urgency or
discount. A phone or contact line only if the publisher allows it and the client supplied it.

### 8. Boilerplate
An "About {brand}" paragraph (40-70 words) built only from client facts, if the publisher format has a
slot for it.

### 9. Disclosure label
Add one line the publisher can use, in the page language, such as «محتوای حمایت‌شده» / "Sponsored
content" / «رپورتاژ آگهی». Put it as an `<em>` line at the end or the top per the publisher profile.

### 10. Uniqueness across publishers
Each advertorial is written fresh for its publisher; never recycle another publisher's text with a
find-and-replace. If the same brief goes to several publishers, vary the angle, the lead, the headings
and the examples, keeping facts identical. Do not claim the text is "unique" or plagiarism-free; no
similarity tool ran unless the pipeline says so.

### 11. Language and style
Native copy. Persian: `persian-rtl-style.md`; brand and Latin names in `<bdi>`; project glossary terms
exactly (SEO terms as the Persian market says them). Obey the publisher's punctuation and formatting
limits (some accept no tables or only H2/H3, some strip scripts).

### 12. Output hygiene
Plain semantic HTML only (`h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `blockquote`, `em`, `strong`,
`img` with `alt`). No JSON-LD (publishers control schema), no scripts, no iframes, no tables unless the
profile allows them. Also deliver a plain-text version (publishers often paste text or Word).

## Process

1. **Parse**: brand facts, hook, quotes, link plan, publisher profile, keyword, language. Decide the
   angle (rule 1). List gaps as assumptions or `[CONFIRM: …]`.
2. **Plan**: headline options, lead, 2-5 H2s, where each link and the quote (if any) go.
3. **Write** lead, sections, quote, CTA, boilerplate, disclosure line.
4. **Image suggestions**: up to 3 `alt` texts for client-supplied images; no invented images.
5. **Meta**: meta title (about 60 characters) and description (about 155) if the publisher uses them.
6. **Assemble** `advertorial.html`, `advertorial.txt` and the result envelope.
7. **QA**:
   ```bash
   python3 scripts/seo_qa.py advertorial.html --type advertorial --keyword "{kw}" --locale {locale} \
     --brand "{brand}" --max-links {n} --max-title 70 --min {min} --max {max} \
     --facts-file facts.txt --zwnj-policy {standard|none} --banned "{banned claims}"
   ```
   `facts.txt` is the client's facts and quotes flattened to text; the script fails quotes and warns on
   numbers that are not in it. Fix every FAIL; resolve or explain every WARN.
8. **Deliver** with a short note: angle and why; headline options; link table with `rel`; assumptions;
   `[CONFIRM]` gaps; flags; reminder that the publisher sets the final disclosure and `rel`.

## Checklist

- A real hook or an honest educational angle; nothing invented.
- Three headline options within 70 characters; lead answers who, what, why in 25-60 words.
- Value before brand; sparse varied brand mentions; no superlatives without proof.
- Quote only if client-supplied and verbatim; no invented speaker.
- Links within the publisher's limit, mixed anchor types, at most one exact-match anchor, `rel="sponsored noopener"`.
- Disclosure line present; no wording that disguises the piece as independent journalism.
- Plain HTML plus plain-text version; no schema, scripts, iframes.
- Facts match the facts file; YMYL flagged where relevant; QA passes.

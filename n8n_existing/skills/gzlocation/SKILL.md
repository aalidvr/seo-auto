---
name: gzlocation
description: >-
  Build a business-directory "listicle" page for the GZLocation directory site (gzlocation.com)
  and similar local/national directory pages in ANY language (Persian, Spanish, English, etc.).
  Use this whenever the user gives a keyword like "best [service] in [city]" / "mejores [X] en [Y]"
  / "بهترین [خدمت] [شهر]" and wants a page that lists real businesses with contact details, a
  summary table, per-business write-ups, Google Maps embeds, an embedded video, FAQ and JSON-LD —
  delivered as ready-to-paste CMS HTML. Trigger it even if the user only says "build a directory
  page", "write a listicle of companies", "معرفی کسب‌وکارها", or pastes a content brief for such a
  page. The defining feature: a curated list of REAL, verified businesses (never invented) plus
  surrounding SEO content.
---

# GZLocation — Directory listicle builder

This skill produces one directory page: a curated, SEO-optimized listicle of **real** businesses for
a keyword, in the page's target language, as ready-to-paste CMS HTML (plus JSON-LD and a private
verification block). It is built for gzlocation.com but works for any local/national directory page.

The single most important idea: **the business data is real and verified; the surrounding copy is
yours to write.** Phone numbers, emails, websites, addresses, social handles, map pins and any
specific operational claim about a named business are facts — they must come from the web or from
the user, never from your imagination. Everything else (intros, descriptions, FAQ) is craft.

## Inputs (the brief)

The user supplies a brief. Extract or ask for:
- **Keyword** (primary) and the page **angle** (e.g. "mejores empresas de…").
- **Target language / locale** — write the whole page in this language only.
- **Scope: local or national** — this decides the map rule (see below).
- **List size** — default ~10 businesses; fewer is fine if fewer real ones exist.
- **Priority sources** — Google Maps, specific directories, the businesses' own sites.
- Any sections, FAQs, or internal-link anchors the user wants.

If something is missing, make the most reasonable assumption and state it; don't stall.

## Process

1. **Gather real data.** Use `places_search` (Google Places) for name, address, coordinates, phone,
   rating, hours and website. Use `web_search` + the businesses' own sites/directories for email and
   extra phones. Verify each candidate actually exists and matches the topic — discard look-alikes
   (e.g. shower-screen "mamparas de ducha" when you want office partitions).

   **Social profiles get their own dedicated search — one per business, never a single keyword-level
   sweep.** Pattern: `"{business name}" + "{city}" + instagram / telegram / facebook`. A general
   search on the page keyword finds social profiles only by accident; the result is a page where 1 of
   10 businesses has a handle while a 20-second manual search would have found the rest.
   - **In markets where social IS the primary contact channel — Iran (Instagram, WhatsApp), the
     Middle East, Latin America — a social profile is a first-class contact field, equal to the
     phone, not an extra.** If a business has no website but has Instagram, Instagram takes the
     website's place in the contact block.
   - Include a handle **only** when it verifiably belongs to that business: name match + city match +
     on-topic content. Unsure → omit it and mark "confirm" in the verification block.
   - Not found → record "not found" / "پیدا نشد". Same no-fabrication rule as every other field.
   - Every business gets a **social row with its source** in the verification block.
2. **Apply the anti-saturation rule — with entity anchoring.** Businesses that appear
   *everywhere* (big chains, generic distributors, heavily-advertised names) go lower or get
   trimmed; bring real-but-less-visible specialists higher, so the reader gets a fresher answer.
   "Fresher" means under-saturated — never invented.
   **BUT: the list must always include 1–2 widely recognized names in the niche** (a business
   with its own website, strong review volume, multiple locations, or presence across competitor
   listicles) placed in the LOWER half of the list. A list made only of tiny Places entries with
   a handful of reviews reads as low-authority to both Google and the reader, in any vertical.
   The recognized names anchor the page's entity credibility; the under-saturated specialists
   keep it fresh. If the niche genuinely has no recognized name, note that in the verification
   block instead of forcing one.
3. **Verify every field.** No field is ever fabricated. If a datum isn't found, write "no encontrado"
   / "پیدا نشد" rather than guessing. Keep the source URL of each real field for the verification
   block.
4. **Correct the brief proactively.** If the brief states a wrong figure or claim (e.g. an inflated
   acoustic-dB number, an outdated fact), fix it to the verified value and note the correction to the
   user. Don't silently reproduce errors and don't silently drop required elements — surface the
   decision.
5. **Find videos** (see Video rule). Find each business's *own* official video if it exists, plus one
   general, on-topic video for the end of the page.
6. **Write the copy** in the target language: natural prose per business (not a "Label: value" list),
   plus the explanatory body and FAQ. Cut anything that doesn't serve the searcher's intent — no long
   narrative intro, no padding ("آب بستن").
7. **Assemble** the HTML in the fixed order below, add JSON-LD, make phone/email clickable.
8. **Build the verification block** (separate from the page) so the user's final check is ~30 seconds.

## Page structure (fixed order)

Open with the table, not a story. Any narrative belongs at the end or gets cut.

1. `<h1>` — keyword in the title.
2. One short lead sentence (a label for the table, not a narrative paragraph).
3. **Summary table**: Name | Type | Coverage | Phone | Web. (The user may instead build this with the
   GZSEO plugin — include it anyway; it's cheap to drop.)
4. **The businesses, one by one** (the listicle — the heart of the page).
5. **Explanatory body** relevant to the topic (what it is / types / prices / how to choose / etc.) and
   **FAQ**. Only sections that answer real intent.
6. **One relevant general video at the very end** — guarantees every page has at least one video.
7. JSON-LD (`FAQPage` + `ItemList`) inline in a `<script>`.

## Per-business block (fixed order)

```
<h3>N. Name</h3>
[the business's OWN official video — only if its official channel is verified]
<p>Natural-prose description (type, coverage, specialty woven in — NOT "Tipo:/Especialidad:" labels)</p>
<ul>
  <li><strong>Phone:</strong> <a href="tel:+34..."><bdi>+34...</bdi></a></li>
  <li><strong>Web:</strong> <a href="https://..." rel="nofollow noopener" target="_blank">domain</a></li>
  <li><strong>Instagram:</strong> <a href="https://www.instagram.com/handle/" rel="nofollow noopener" target="_blank">@handle</a></li>
  <li><strong>Email:</strong> <a href="mailto:...">...</a></li>
  <li><strong>Location:</strong> City / address</li>
</ul>
[Google Map embed — per the Map rule]
```

Localize the labels to the page language.

### Clickable-contact rule (page-wide, not just this block)
**Everywhere a phone, email or website appears on the page — including the summary table — it is a
live link.** `tel:` for phones, `mailto:` for emails, `https://` with `rel="nofollow noopener"
target="_blank"` for websites. The summary table is the first thing a mobile reader sees; a raw
unlinked number there means they cannot call from the one element most likely to convert.
If a business has no website, the Web cell contains exactly `—` — not a prose "ندارد" / "no tiene".

### Description depth rule
Each business description must be 4–6 sentences and, wherever verifiable, include
DECISION-MAKING details — the concrete facts a reader compares before choosing. What counts as
decision-making varies by vertical; identify the 3–5 criteria a real customer in THIS category
weighs, then fill them from sources. Typical mappings (not exhaustive — infer for new verticals):

- **Repair / home services:** written warranty + duration, years in business, free pickup or
  on-site estimate, invoice/quote practices, concrete specialty.
- **Restaurants / cafés:** signature dishes or cuisine focus, price band, reservation/delivery
  options, ambiance (family, business, outdoor), standout points from reviews.
- **Medical / clinical:** practitioner credentials and license/registry number where public,
  specializations, insurance acceptance, appointment channels, facility equipment.
- **Retail / stores:** product range and brands carried, online ordering/shipping, return or
  warranty policy, installment/payment options, physical showroom details.
- **Tourism / hospitality:** location advantages, amenities, seasonal notes, booking channels,
  what guests consistently praise or warn about.

Source hierarchy for these claims: the business's own site > its verified social profiles >
Google reviews (paraphrased and attributed, e.g. "مشتریان در نظرات…" / "según las reseñas…") >
third-party directories (mark "confirm" in the verification block). Regulated verticals
(medical, legal, finance) require the strictest tier: credentials only from official registries
or the practitioner's own site, never from directories alone.
If NONE of these details can be verified for a business, keep its description short and factual
rather than padding — and treat zero verifiable decision-making details as a signal to
reconsider its place on the list.

### Bidi rule for numbers in RTL pages
Observed failure: on a Persian page, `0904-481-8841` inside an `<li>` rendered as `8841-481-0904`.
Inside a `<td>` it was fine. Cause is bidi, not a typo: the hyphen is a neutral character, so in an
RTL paragraph the numeric segments get reordered. Any neutral separator (`-` `.` `/` plain space)
reproduces it.

On pages whose target language is RTL (Persian, Arabic, Hebrew):
- **Wrap every Latin-digit string that sits inside RTL text in `<bdi>`** — phone, coordinates, street
  number, opening hours, prices.
- **Display phone numbers with no separator at all**: `09044818841`, not `0904-481-8841`. The `tel:`
  href keeps its own E.164 form regardless.
- If a number genuinely needs visual grouping, use only U+2060 (word joiner) or NBSP — **never a
  hyphen**.
- **`<bdi>` is a semantic HTML element, not a style — it does not conflict with the "no inline
  `direction`/`text-align` styles" rule above.** This is stated explicitly so future revisions don't
  strip it as a direction hack. The site controls direction; `<bdi>` only isolates a number's
  internal ordering from the surrounding paragraph.

### Map rule (conditional)
- **Local page** (e.g. "best plumbers in East Tehran"): embed a Google Map for **every** business —
  they all have physical addresses and the keyword is local.
- **National / comparison page** (e.g. "mejores empresas … en España"): embed a map **only** for
  businesses with a verified physical location; online/national-only firms get none.
- **In every case, the FIRST business MUST have a map.** Spread the rest so at least one map sits near
  the end too. Never embed a map without verified coordinates (a wrong pin is worse than no pin).

Map embed (from verified coordinates):
`https://www.google.com/maps?q=LAT,LNG&hl=<lang>&z=16&output=embed` inside an `<iframe>`.

### Video rule
- A business's own video is embedded **only** if it comes from that business's **official** YouTube
  channel — verify it's really theirs, not a same-name coincidence. If unsure, omit it.
- Regardless, the page always ends with **one general, on-topic video** relevant to the searcher's
  problem (any reputable source is fine, as long as it's on-topic).
- Use the standard YouTube embed: `https://www.youtube.com/embed/VIDEO_ID` in an `<iframe>`.

See `references/templates.md` for ready-to-copy HTML snippets (summary table, business block, map
iframe, YouTube iframe, JSON-LD) so output stays consistent.

## Output format

- **Clean CMS-ready HTML body** — semantic tags only (`h1/h2/h3/p/ul/li/table/figure/iframe`). No
  `<html>/<head>/<body>` wrapper, no CSS, and **no inline `direction`/`text-align` styles** (the site
  controls text direction; do not fight it in the markup).
- **JSON-LD** inline at the end: `FAQPage` (matching the visible FAQ) + `ItemList` of the businesses,
  each as an `Organization` with `name`, `url`, and `telephone`.
- Tell the user to paste into a **Custom HTML / HTML widget** block so iframes and the `<script>`
  survive (the plain text editor in Elementor strips them).
- Deliver as a single `.html` file in the outputs folder.

## Verification block (separate from the page)

After the file, give the user a compact block they can check in ~30 seconds:
- Each business: phone / email / web / **social** / address, each with the **source URL** it came
  from. The social row is required for every business — "not found" is a valid value, silence is not.
- Flag anything taken from a third-party directory (vs. the business's own site) as "confirm".
- List anything marked "not found".
- Note any figures you corrected from the brief.
This block is for the user only — it does NOT go into the published HTML.

## Hard rules (the core)

- Never invent a field. Not found → say "not found".
- Real data from the web / Places / the user; every real field traceable to a source.
- Anti-saturation ordering; first business always has a map.
- Distinguish fabricante / tienda / portal (or the local equivalents); present lead portals
  (Habitissimo, Europages, etc.) transparently as intermediaries, not as vendors.
- Correct wrong brief figures/claims proactively and tell the user.
- Output language = the page's target language; no "cubículos"-type locale mismatches — match the
  target locale's real vocabulary.
- Clean HTML body, JSON-LD inline, no direction styles.
- **RTL pages: every Latin-digit run inside RTL text is wrapped in `<bdi>`; phones are displayed
  unbroken (`09044818841`) with no hyphen separators. `<bdi>` is semantic and is NOT a direction
  style — never strip it.**
- **Phone, email and website are live links EVERYWHERE they appear, summary table included** —
  `tel:` / `mailto:` / `https://` with `rel="nofollow noopener" target="_blank"`.
- **Summary-table Web cell with no website = exactly `—`**, never prose.
- **One dedicated social search per business** (`"name" + "city" + instagram/telegram/facebook`), not
  a keyword-level sweep. In Iran / Middle East / LatAm a social profile is a first-class contact
  field equal to the phone, and replaces the website when there is none. Handle only if name + city +
  content match; otherwise omit and flag "confirm". Social row with source goes in the verification
  block for every business.
- Cut anything that doesn't serve search intent.
- List composition: 1–2 recognized-name anchors in the lower half + under-saturated specialists on top; applies to every vertical.
- Descriptions are decision-making content mapped to the vertical's real purchase criteria, not filler; every claim sourced, with registry-grade sourcing for regulated verticals.

---
name: "landing-page-content"
description: "Write publish-ready landing page content from an SEO brief or keyword for ANY site, niche, language and market: service, service-in-location, emergency, product, SaaS and lead-gen pages. Box-based, brief-first, with QA script."
---

# Landing Page Content — brief-to-page builder for box-based landing pages

This skill turns an SEO content brief (or just a keyword) into ONE publish-ready landing page: content
that sits in small boxes (hero, cards, tables, steps, badges, FAQ, CTA bands) instead of long article
prose. It is the third sibling of `seo-blog-guide` (long articles) and `gzlocation` (directory
listicles).

It is **site-agnostic, niche-agnostic and language-agnostic**. The same method works for a plumber in
London, a dental clinic in Dubai, a SaaS tool in the US, a law firm in Munich or a car-detailing shop
in Tehran. Nothing in this file is tied to one client: every concrete example below is only an
illustration of a rule. The brief and the target site decide the facts, language, tone and structure.

Everything needed is in this file: rules, locale guide, box catalogue, HTML templates, schema and a
QA script. There are no other reference files.

The two ideas that drive every decision:

1. **The brief owns the structure; you own the execution.** When a brief gives an outline, headings,
   word range, meta, links, facts or banned claims, follow them exactly. Win on the things a brief
   cannot specify: sharp box copy, real local specificity, accurate facts, natural native-level
   language, clean markup, honest CTAs.
2. **A landing page is a set of boxes a busy visitor scans, not an article they read.** Every box does
   one job (answer, reassure, price, prove, explain one step, remove one objection, push to act) and
   says it in as few words as that job needs. The word count is reached by having the right number of
   boxes, never by letting prose run long inside a box.

---

## Step 0 — Read the brief properly

Briefs come in any shape and any language, and the brief's language is often NOT the page's language
(a Persian brief for an English page, an English brief for a German page). Notes to the writer are
never page copy, whatever language they are in.

Build a private **brief sheet** before writing (keep it in your notes, do not print it on the page):

| Field | What to capture |
|---|---|
| Page language + locale | From the brief, the domain/ccTLD, the site's existing pages and the currency: e.g. `.co.uk` → en-GB, `.com` with US address/$ → en-US, `.de` → de-DE, `.ae`/`.sa` → Arabic and/or English, `.ir` → fa-IR. If the site is bilingual, the brief or URL decides. See the Locale guide. |
| Market + audience | Country/city, B2C or B2B, formal or informal address (Sie/du, usted/tú, شما), what the local buyer worries about. |
| Page type | service / service+location / emergency / product / SaaS / lead-gen (see Page types). |
| Target keyword + variants | Exact keyword in the page language, plus natural variants, inflections and synonyms used in that market. |
| Meta title / description / slug | If given, use VERBATIM. Only flag (do not silently change) if too long for the SERP or factually wrong. If not given, write them in the page language. |
| H1 | Verbatim if given. |
| Outline | Every H2/H3 in order, plus the job each section must do and the box type it implies. |
| Word range | Visible words on the page. If not given, use the Page types default. |
| Hard facts | Prices and tax wording, response/delivery times, guarantees, licences/registrations, brands, addresses, phones, opening hours. These are the ONLY facts about the business you may state. |
| Banned claims | Anything the brief says not to write, plus every synonym and translation of it. |
| Style rules | Punctuation bans, brand spelling, sentence length, tone, formality. |
| Placement rules | Where phone/CTA may or may not appear. |
| Internal links | Exact anchor text + target for each. Note links whose URL the brief does not give. |
| Conditional facts | Anything marked "confirm before publishing" or "only if the client confirms". |
| Reference pages | "Make it like page X": a page whose format you must match. |
| Sibling pages | Other pages from the same template (other locations/services) this page must not duplicate. |
| Hub / parent page | The broader page this one sits under (e.g. the city-wide page for a borough page). Rule 9b applies. |
| Reserved anchors | Anchor texts the brief keeps for OTHER pages to use toward this page. This page never uses them as link text. |
| Schema source | Whether the brief says schema comes from a plugin (e.g. Rank Math). The JSON-LD block is still written, marked optional (rule 14). |
| Price wording | Tax or qualifier wording every price must carry (+VAT, inkl. MwSt., GST included). |
| Gaps to leave open | Facts the brief says the writer must leave blank and not guess. See Conditional facts, case 3. |

**Conditional facts — three different cases, handle them differently:**
1. "Write it, but confirm before publishing" → write it, and put an HTML comment right before the box:
   `<!-- VERIFY before publishing: {the claim}, confirm with {who} -->`. List it again in the note.
2. "Only write it if the client confirms" or "only if a real project, photo or review arrives" (a whole
   optional section) → do NOT put it on the page, and drop the section together with its heading. Give
   the ready-to-paste sentence or section skeleton in the delivery note so it can be added once confirmed.
3. "Leave a blank, do not guess" (a missing fact inside a section that stays, such as the list of covered
   suburbs, a real street name, or the price of a variant) → write the box around the gap and put a
   visible plain-text marker at the exact spot: `[CONFIRM: what is needed, from whom]`, for example
   `<li>[CONFIRM: list of covered sub-areas, from the client]</li>`. Never fill the gap with a plausible
   guess and never hide it in a comment, so it cannot be published by accident. The QA script lists every
   open marker, and the note repeats them with the sentence to use once the answer arrives.

**Reference pages and examples: build a page fingerprint.** A page or screenshot the user shares "as an
example" (often the hub page of the same site) shows the structure and box density wanted, not the
content, client, language or claims of the new page. Open it (fetch it, or use a browser when the page
needs rendering) and write a private fingerprint before planning boxes:

| # | Box (heading level + text) | Module | Words | Notes |
|---|---|---|---|---|
| 1 | H1 + sub + CTA | hero | 20 | phone + button |
| 2 | (no heading) | prose | 75 | answer-first intro |
| … | … | cards / table / steps / chips / FAQ / reviews / gallery / form | … | … |

Also record the total visible words, the number of prose paragraphs, the number of CTAs, the FAQ count
and average answer length, and which blocks are site-wide widgets (header, footer, review carousel,
booking modal). Then compare it with the brief, section by section:
- The brief's outline and module hints win. Where the brief is silent on a module, use the sample's.
- Sample blocks the brief did not ask for (galleries, forms, long review lists, long area lists) are not
  added. Site-wide widgets become placeholders (rule 15).
- Sample density is a guide: a sample with 4 prose paragraphs and a similar word range means about 4 here.
- Never copy its facts, wording or claims.
If you cannot open the sample, follow the brief and say so in the delivery note. Put a three-line
fingerprint summary in the note: the sample's box and prose count, this page's box and prose count, and
the main deviations with the reason.

**Missing pieces never block the page.** Infer from keyword, page type, site and market, state the
assumption in the delivery note, and keep going. If the brief is factually wrong, correct it on the
page and say why in the note.

**Thin briefs (a keyword and a few lines).** First lock the Rule of One: name, in your notes, the one
persona the page is for and the one promise it makes. If the brief mixes two buyer types or two
offers, that's two pages: say so instead of blending them, because a page that speaks to everyone
converts nobody and blurs its keyword focus. Then read the traffic signal: a pure paid-ad landing
page gets no body links beyond the CTA and only the SEO scaffolding the brief asks for; organic or
unknown traffic gets the hybrid default (real on-page SEO and conversion copy together).

---

## Locale guide (write like a native of the target market)

Write directly in the page language, as a native copywriter of that market would. Never draft in one
language and translate. Keyword, headings, CTA verbs, units, currency, dates, phone format, spelling
and formality must all be what a local buyer expects. When the site already has pages, the site's own
conventions (digits, formality, currency format, spelling) win over the defaults below.

| Locale | Defaults to apply |
|---|---|
| en-US | US spelling (color, center, license, specialize); $1,250.00; "8 a.m. to 5 p.m." or "8am–5pm"; MM/DD/YYYY; ZIP code, apartment, faucet; sales tax usually not in the shown price; phone (415) 555-0123, `tel:+14155550123`. Superlatives and guarantees are regulated (FTC): only with proof. |
| en-GB / en-IE | UK spelling (colour, centre, licence as noun, specialise); £1,250; "7am to 5pm"; DD/MM/YYYY; postcode, flat, tap; say whether prices include VAT; phone 020 1234 5678. |
| en-AU / en-NZ | UK-style spelling with local terms (suburb, tradie, GST); A$/NZ$; prices usually include GST; phone 02 1234 5678 / 04xx xxx xxx. |
| de-DE / de-AT / de-CH | Formal **Sie** unless the brand clearly uses du; decimal comma and dot thousands (1.250,00 €, CH: CHF 1'250.–); "7 bis 17 Uhr"; DD.MM.YYYY; German quotes „…“; say "inkl. MwSt." or "zzgl. MwSt."; Swiss German uses ss not ß. German runs longer per idea: keep chips and headings short. Competition law (UWG) is strict: "Nr. 1", "bester", "günstigster", Garantie vs Gewährleistung only exactly as the brief backs them. |
| fa-IR | RTL; natural spoken-formal Persian, شما; site's digit convention (Persian ۰–۹ or Latin) used consistently; prices in تومان unless the site uses ریال; «» quotes, ، and ؟; **no ZWNJ (نیم فاصله) characters at all**: write verb prefixes and plural suffixes joined (میخواهد، کتابها) or with a normal space, unless the brief or site explicitly requires them; SEO terms exactly as the client team says them (ریفرینگ دومین، بک لینک، بک لینک از دست رفته، سایت واید، رپورتاژ، لینک اینزرشن، گست پست), never formal calques such as «پیوند ورودی»; Persian equivalents of technical terms where readers know them, brand/model names in Latin inside `<bdi>`; phones unbroken (`09121234567`); WhatsApp/Telegram/Instagram as first-class contact channels. |
| ar (MSA) / ar-AE / ar-SA / ar-EG | RTL; Modern Standard Arabic by default, a dialect only if the brief asks; Western (0–9) or Eastern Arabic (٠–٩) digits as the site uses (Gulf sites often use Western); ، ؟ «»; currency as the market writes it (د.إ / AED, ر.س / SAR, ج.م / EGP); address the reader the way the brand does; WhatsApp is usually the primary contact channel; mirroring the layout is the theme's job, not yours. |
| es-ES / es-MX / es-US | usted vs tú by brand and market; ¿? and ¡!; Spain 1.250,00 €, Mexico $1,250.00 MXN; local vocabulary (fontanero ES vs plomero MX). |
| fr, it, tr, nl, other | Same method: native formality level, local number/currency/date format, local quote marks and punctuation (French space before : ; ? !), local legal sensitivity around guarantees and superlatives. Check the site's existing pages for conventions. |

Word counts: a brief's word range applies to the page as written. German, Persian and Arabic count
differently from English for the same content; don't pad or cut meaning to hit a number, but stay
inside the range the brief set for that page.

---

## Common box patterns (reference only)

Landing pages vary; use the client site's own pattern when you can see it. When you can't, these are
safe patterns:

- **Local service page:** hero (H1, booking or quote bar, trust badges) → short USP tick band beside an
  offer and a call button → short intro with an image and a CTA → "why choose us" grid of 6–7 icon
  cards of 20–35 words → CTA → price or cost table with notes → services-handled tile grid (title +
  one line) → areas covered grid → CTA band with phone → reviews widget → FAQ accordion of 6–8
  questions → final CTA box with call/email/form.
- **Product / e-commerce offer:** hero (product name, key benefit, price, buy button, delivery/returns
  chips) → benefit cards → spec or comparison table → who it's for / not for → real reviews → shipping,
  returns and warranty box → FAQ → final CTA.
- **SaaS:** hero (outcome headline, sub, trial/demo CTAs, logo strip if real) → problem → 3–6 benefit
  cards → how it works in 3 steps → integration chips → pricing cards → proof → FAQ → final CTA.
- **Lead-gen / professional service (law, clinic, consulting):** hero with a consultation CTA →
  credentials strip → problems we solve as cards → process steps → fees or what the first consultation
  includes → team/credentials box (real only) → FAQ → contact box with form, phone and messaging apps.

Every block is short; nothing runs past a few sentences.

## Page types and defaults (used only where the brief is silent)

| Page type | Default word range | Must-have boxes | Usually add |
|---|---|---|---|
| Service (city-wide) | 900–1,500 | hero, answer intro, price, what we do, process, credentials, FAQ, final CTA | why-us cards, scope/brand chips, areas/related links |
| Service + location | 900–1,400 | same as service + a real local-context box + nearby-areas links | local FAQ question, local row in a problem table |
| Emergency service | 700–1,200 | hero with speed promise, "what to do right now" steps, response/price box, credentials, final CTA | what counts as an emergency, what we can't do |
| Product / e-commerce offer | 600–1,200 | hero, benefit cards, spec/comparison table, proof, delivery/returns, FAQ, CTA | who it's for / not for |
| SaaS / digital | 600–1,200 | hero, problem, benefit cards, how it works, pricing, proof, FAQ, CTA | integration chips, comparison table |
| Lead-gen / consultation | 500–1,000 | hero, benefit cards, process, form/contact box, trust line, FAQ | who this isn't for |

Default order when there is no outline: hero → answer intro → trust bar → price → what we do/benefits
→ process → deeper/local section → comparison or scope chips → proof → objection/guarantee → FAQ →
areas/related links → final CTA → schema.

---

## The rules

Each rule says why. Apply the spirit, not just the letter.

### 1. Follow the brief's outline exactly
Same H1, every H2/H3 in the same order, same headings wording. Exactly one H1, no skipped levels.
Don't add or drop H2 sections. Boxes you add (a CTA band, a trust bar, card titles as H3s) live inside
the brief's sections and never become new H2s. Why: the SEO who wrote the brief planned the page
against competitors and the site's other pages; restructuring breaks that plan.

### 2. Map every section to box types before writing
For each section decide its box type from the Box catalogue (price table, card grid, tiles, steps,
problem table, chips, credential box, checklist table, FAQ accordion, links grid, CTA band). A section
with a list of items becomes cards/chips/table, not a paragraph. Why: box-based pages are scanned; if
the content has no box shape, the developer or page builder has to invent one, and the page ends up
as an article with a hero on top.

### 3. Content grains (size limits per box)
- Intro / answer box: 40–100 words (the brief's range wins), answer in the first sentence.
- Card (feature, benefit, problem, reason, local factor): 25–70 words, one idea, a short H3 title.
- Tile (service tile, short icon card: title + one line): 8–25 words.
- Step: 10–30 words each, 3–7 steps.
- Table cell: a phrase, max ~20 words. Tables carry comparable data, not paragraphs.
- Chip / badge / USP tick line: 1–6 words.
- Narrative box (only where one idea really needs room, e.g. local context): max ~180 words, max 2–3
  per page. Split longer content into cards.
- FAQ answer: 30–80 words, direct answer in the first sentence (snippet- and AI-answer-ready).
- CTA band: heading of 3–8 words + one line of 10–25 words + button.
Total length = the brief's range, counted as visible words (tables and FAQ included). Hit the range
by the number and completeness of boxes, never by padding. Under the range → add a useful box the
section's job supports, not filler.

### 3b. Page rhythm: order, alternation and prose budget
A stack of same-looking boxes reads as a wall even when each box is short. The brief fixes the order of
sections (rule 1), so rhythm is solved with the choice of module inside each section, never by
reordering sections or adding H2s.
- **Prose budget.** At most 4 prose paragraphs (a `<p>` of 45+ words outside FAQ, cards, tiles and
  tables) on the whole page, and the intro is one of them. Prose is about a quarter of the visible
  words, never over 30%. Everything else is cards, tiles, tables, steps, chips or short lists.
- **One module per section, two at most.** A section is an optional lead-in (up to 25 words) plus one
  module. A second module only if it is a different type (a table plus a chip row, for example).
- **No same-type neighbours.** Two top-level boxes of the same module type never sit back to back
  (table then table, cards then cards, prose then prose). If the outline forces it, separate them with
  a CTA band, a chip row or a module of another type inside the section.
- **Dense, then light.** After a prose or table box comes a lighter one (cards, steps, chips, CTA).
- **CTA spacing.** A CTA in the hero, then never more than 3 top-level boxes without a CTA or contact
  action, and 3 to 4 CTAs in total. Placement rules in the brief still win (rule 11).
- **Shape by item count, not by habit.** 3 comparable items with a price are cards. The same items
  compared across several attributes are a table. Sequential actions are steps. 7 or more short items
  are tiles or chips.
The QA script checks the prose count and share, same-type neighbours and CTA spacing.

### 4. Answer first, fast
The first screen must tell the visitor they are in the right place and what happens next: H1, a
subheadline with the core promise (speed, price anchor, outcome, credential), a CTA, and trust chips.
The intro box then answers the search intent directly before any context. No scene-setting openers
("In today's fast-paced world…", "Winter can be hard on your home…").

### 5. Benefits in the reader's language, facts in the brief's numbers
Write each box from the visitor's side ("no call-out fee, so you only pay for work done" instead of
"we do not charge call-out fees"). Keep every number exactly as the brief states it, with its
qualifier (tax included/excluded, "usually", "from", "per hour").

### 6. Never invent proof or business facts (and never stretch one)
Prices, response times, guarantees, reviews, ratings, customer counts, years in business, staff names,
awards, certifications, "local team", opening hours: only what the brief or the user gave you, or
what you verified on the site itself. No real testimonials → no testimonial box (flag it). Microcopy
under CTAs is a claim too. Don't stretch a brief fact into terms it didn't give: "12-month warranty"
stays exactly that, not "free fix if anything goes wrong for a year"; "price explained before work"
is not "we'll tell you if it's not worth it"; "10+ years' experience" is not "we've seen it all".
Why: a false claim on a landing page is a trust and legal problem, and one fake stat undoes the rest
of the page's E-E-A-T.

### 7. Banned claims include their synonyms and translations, and the page must fit the live site
If the brief bans a claim (e.g. "24/7", "cheapest", "guaranteed results", "۲۴ ساعته", "rund um die
Uhr"), also avoid every synonym and implication of it in the page language. A fact that suggests a
banned claim is not permission to make it (a night rate proves late availability, not 24/7). Don't
copy competitor claims the brief warns about, even reworded. If the client's own live pages make a
claim the brief now bans, or carry an out-of-date year in a heading, don't repeat it and mention the
inconsistency in the delivery note.

### 8. Other-world facts must be accurate and checked
Technical, legal, medical, financial or regulatory content you add (error codes, regulations,
licence checks, dosages, legal deadlines, tax rules, local geography) must be correct for THAT
country. Check it against a primary source (manufacturer, official register, regulator, government
site, local authority) before writing. If you can't verify a detail, write it at the level you can
stand behind or leave it out. For YMYL niches (health, law, finance) be stricter: no outcome promises,
no advice beyond what the brief states. List what you checked and where in the delivery note.

### 9. Local pages need real local substance (not a find-and-replace page)
Service+location pages built from one template risk being treated as doorway pages. For each one:
- The local-context section contains facts true of THAT area (building types and age, climate, water,
  traffic/parking/access, local regulations, districts or landmarks named in the brief), each tied to
  a consequence for the service. No generic "X is a vibrant area" sentences.
- Use the location naturally in the intro, at least one card or table row, one FAQ, a CTA heading and
  the nearby-areas box. Not in every heading. Inflect place names correctly for the language.
- Shared template sections (price, process, scope, credentials) keep the same facts but get fresh
  wording and a local touch per page. Never paste the same paragraph across sibling pages.
- Don't invent districts, postcodes or landmarks: use the brief's, or ones you verified.
- When writing several sibling pages in one session, compare them before delivery and rewrite any box
  that reads the same as its sibling.

### 9b. Hub and child pages
A borough, suburb or sub-service page often sits under a broader hub page (the city-wide service page,
for example) that the user also shares as the sample. The two pages must not compete or repeat each other:
- **Different angle.** The child's intro, local-context box, at least one FAQ and the nearby-areas box
  are written from the child's own facts (building stock, access, regulations, districts from the
  brief). The hub's wording is never reused, not even in shared sections such as process, brands or
  credentials: same facts and numbers, fresh sentences.
- **Same facts, correct numbers.** Prices, credentials, warranties and brands match the brief exactly.
  If the hub says something different (another price range, another claim), the brief wins; do not copy
  the hub, and report the difference in the delivery note.
- **Links.** Link the hub only if the brief says so, once, with the brief's exact anchor. The child's own
  keyword anchor is reserved for other pages to use toward the child (Step 0, reserved anchors).
- **Prove it.** Save the hub's visible text and each sibling's text to files and run the QA script with
  `--compare`. Any stretch of 8 or more identical words is rewritten, unless the brief dictates it (an
  exact FAQ question, for instance) and the note says so.

### 10. Internal links: exactly the brief's, with exact anchors
Use every internal link the brief lists, with the exact anchor text, in the section the brief puts
it. Add no others, and never link to a competitor. If the brief names a target page but not its URL,
check the live site (sitemap, site search) for the real URL. If you can't verify it, use the most
likely URL and put `<!-- VERIFY URL: … -->` right before the link, and list it in the note. If the
brief asks you to check a target page's H1/slug/meta live before linking, do it and report the result.
Without a brief: link only to the hub page and 2–4 truly related pages, never scattered in body copy;
on a pure paid-ad page, no body links at all.

### 11. CTAs: repeated, specific, and placed where the brief allows
One primary action (call, book, buy, start trial, get a quote) and optionally one lighter action (see
prices, check coverage, watch demo). Put a CTA in the hero, after the price or process section, before
the FAQ, and at the end (3–4 total). Button text names the action and outcome in the page language
("Get my free quote", "Jetzt Termin buchen", "احجز استشارتك", "دریافت مشاوره رایگان"), never "Click
here" / "Mehr erfahren" / "بیشتر بدانید" alone. Respect placement rules: if the brief keeps the phone
out of some sections, those CTAs use a booking link or `href="#contact"`. Every phone shown is a
`tel:` link in E.164 (`tel:+{country code}{number}`); every email a `mailto:`; messaging apps use
their official link formats (`https://wa.me/{number}`, `https://t.me/{handle}`).

### 12. Style rules are hard rules
Apply the brief's style rules to every visible character, including tables, FAQ and CTA microcopy:
e.g. punctuation bans (em dash, quote marks), no direct quotes, brand spelling exactly as given,
spelling variant, sentence length, formality. The templates in this file use an em dash in their
title only; your page output must follow the brief.

### 13. FAQ from the brief, answers from facts
Use the brief's FAQ questions verbatim (only fix obvious typos). Answer each with the brief's facts,
answer first, 30–80 words. If the brief gives no FAQ, write 5–7 real pre-purchase questions for that
market (price, speed/delivery, coverage, credentials, what's included, guarantee/returns, one local
or niche-specific one). FAQPage JSON-LD must match the visible questions and answers word for word.
Google shows FAQ rich results only for a few authoritative sites, so the schema is for clarity and AI
answers, not for a rich result.

### 14. Schema that matches the page
Build one JSON-LD `@graph`: the business (the most specific LocalBusiness subtype that fits, e.g.
`Plumber`, `Dentist`, `MedicalClinic`, `LegalService`, `AutoRepair`, `RealEstateAgent`,
`HomeAndConstructionBusiness`, `ProfessionalService`, with real name, telephone, address, url), the
offer (`Service` with `provider`, `areaServed` for local pages and `offers` only as the brief states
prices; or `Product` / `SoftwareApplication` with real `offers`), `FAQPage`, and `BreadcrumbList` if
the URL path is known. Schema text may be in the page language; `priceCurrency` in ISO code, phone in
E.164. `AggregateRating` only with a real rating and count you were given and that are visible on the
page. Every schema value must be true and visible or verifiable.

**The JSON-LD block is always written, and always marked optional.** Even when the brief says schema
comes from a plugin (for example Rank Math), the block stays at the end of the file under an
`OPTIONAL SCHEMA` comment, so the team copies it only when they need it and skips it otherwise. It must
still match the visible text exactly (FAQ word for word). Say in the note whether the brief expects the
plugin to output schema.

### 15. Site-wide widgets are placeholders, not copy
Many sites already have global widgets: review carousels, badge strips, booking or quote bars, a
header phone, a footer, a chat button. Don't write fake content for them. Put a comment where they sit
(`<!-- WIDGET: reviews carousel -->`) and write only the copy around them. A review quoted as page text
must be real and attributed (rule 6).

### 16. Content and layout intent, not design
Write semantic HTML with neutral box classes (`lp-*`) and two labels on every top-level box: `data-box`
(what the box is) and `data-layout` (how its content should be arranged), so a developer or page
builder can map each box to a widget without guessing. No CSS, colours, icons, grid code or page-speed
decisions. Where an image clearly helps, leave a short comment placeholder:
`<!-- IMAGE: {what a real photo should show} -->`, and optionally `data-image="left|right|top|none"`.

Choose `data-layout` from this list by content shape. The brief's own layout notes and the sample
fingerprint win over these defaults. Stacking on mobile is the theme's job.

| Content | data-layout |
|---|---|
| Hero | `hero-split` (text + image) or `hero-full` |
| Intro, objection box, single testimonial | `full` |
| Text beside an image | `split-text-image` |
| USP ticks next to an offer | `ticks-offer` |
| 2 / 3 / 4 cards | `cards-2` / `cards-3` / `cards-4` (5 to 6 cards: `cards-3`, two rows) |
| 7 to 12 short items (services, features) | `tiles-3` or `tiles-4` |
| Price list, facts, checklist | `table` |
| Options compared across attributes | `table-compare` |
| Steps | `steps-vertical` (long) or `steps-horizontal` (4 or fewer, short) |
| Brands, integrations, payment methods | `chips` |
| Nearby-area or related links | `links-grid-3` (9 or fewer) or `links-grid-4` |
| FAQ | `faq-accordion` (5 or more) or `faq-plain` |
| CTA band | `cta-band` |
| Final contact box | `contact-split` |
| Gallery or review widget placeholders | `gallery-grid` / `reviews-widget` |

The delivery note's box plan lists each box with its layout.

### 17. RTL pages (Persian, Arabic, Hebrew, Urdu)
No inline `direction`/`text-align` styles (the theme controls direction). Wrap Latin runs, phone
numbers, codes, prices in Latin digits and model/brand names in `<bdi>`. Show phone numbers unbroken
(`<bdi>0501234567</bdi>`, never hyphenated) because hyphens reorder in RTL; `tel:` stays in E.164.
Use one digit system consistently (the site's). Use the language's own punctuation (، ؟ «»). Messaging
apps are often the main contact channel: include them as links when the brief gives them.
Persian pages contain no ZWNJ characters unless the brief or site requires them (see the locale
guide); the QA script fails them.

---

## Box catalogue and HTML templates

Wrap every box in an element with a `data-box` label and a `data-layout` hint (rule 16). Replace `{…}` with real content in the page
language. Localize all visible labels. Drop any box you have no real content for. The example values
inside `{…}` are illustrations only.

### Meta block (top of the file, not visible)
```html
<!-- ===================================================================
     SEO FIELDS (CMS SEO settings, not page body)
     Meta title:        {verbatim from brief, or ≤ ~60 chars keyword-first}
     Meta description:  {verbatim from brief, or ≤ ~155 chars with a soft CTA}
     Slug:              {/keyword-slug/}
     Target keyword:    {keyword}
     Language/locale:   {e.g. de-DE}
     ==================================================================== -->
```

### Hero
```html
<section class="lp-hero" data-box="hero" data-layout="hero-split">
  <h1>{H1 verbatim from brief}</h1>
  <p class="lp-sub">{One line: core promise with the real hook (speed / price anchor / outcome / credential)}</p>
  <ul class="lp-chips" data-box="trust-chips">
    <li>{real credential}</li><li>{real price anchor}</li><li>{real guarantee}</li>
  </ul>
  <p class="lp-cta-row">
    <a class="lp-btn lp-btn-primary" href="{#contact or booking/buy URL}">{primary action}</a>
    <a class="lp-btn lp-btn-secondary" href="#prices">{lighter action}</a>
  </p>
  <!-- IMAGE: {what a real hero photo should show} -->
</section>
```

### Intro / answer box (no heading when the brief says so)
```html
<section class="lp-intro" data-box="intro" data-layout="full">
  <p>{Answer first. 40–100 words. Brief's internal link woven in with exact anchor.}</p>
</section>
```

### USP tick band (short promises next to an offer box)
```html
<section class="lp-usp-band" data-box="usp-band" data-layout="ticks-offer">
  <ul class="lp-ticks"><li>{real promise}</li><li>{real promise}</li></ul>
  <div class="lp-offer"><p class="lp-cta-title">{Real offer only}</p>
    <a class="lp-btn lp-btn-primary" href="{booking URL}">{action}</a></div>
</section>
```

### Price table (+ notes)
```html
<section class="lp-section" id="prices" data-box="pricing" data-layout="table">
  <h2>{Brief H2}</h2>
  <p>{One sentence: how pricing works, in the brief's words and numbers, tax wording included.}</p>
  <table class="lp-table">
    <thead><tr><th>{Option / time / package}</th><th>{Price}</th></tr></thead>
    <tbody><tr><td>{…}</td><td>{…}</td></tr></tbody>
  </table>
  <ul class="lp-notes"><li>{what's included / not included, from the brief}</li></ul>
</section>
```
Pricing cards (product/SaaS tiers) use `lp-cards` with one `lp-card` per tier: name, price, 3–5
included items, button.

### Card grid (benefits, reasons, problems, local factors)
```html
<section class="lp-section" data-box="{benefits}" data-layout="{cards-3}">
  <h2>{Brief H2}</h2>
  <p>{Optional 1–2 sentence lead-in.}</p>
  <div class="lp-cards">
    <div class="lp-card"><h3>{Short title}</h3><p>{25–70 words, one idea, consequence for the reader.}</p></div>
  </div>
</section>
```

### Tile grid (services handled, features, integrations: title + one line)
```html
<div class="lp-tiles" data-box="service-tiles" data-layout="tiles-3">
  <div class="lp-tile"><h3>{Tile title}</h3><p>{8–25 words}</p></div>
</div>
<p class="lp-note">{One-line catch-all, e.g. not listed? ask us}</p>
```

### Problem table (problem → symptom → cause → what we do)
```html
<table class="lp-table" data-box="problem-table" data-layout="table">
  <thead><tr><th>{Problem}</th><th>{What you notice}</th><th>{Common cause}</th><th>{What we do}</th></tr></thead>
  <tbody><tr><td>{…}</td><td>{…}</td><td>{…}</td><td>{…}</td></tr></tbody>
</table>
```

### Steps
```html
<section class="lp-section" data-box="process" data-layout="steps-vertical">
  <h2>{Brief H2}</h2>
  <ol class="lp-steps">
    <li><strong>{Step title}</strong> {10–30 words}</li>
  </ol>
</section>
```

### Chips (brands, services covered, areas, integrations, payment methods)
```html
<ul class="lp-chips" data-box="{brands}" data-layout="chips">
  <li>{item}</li><li>{item}</li>
</ul>
```

### Credential / trust box and checklist table
```html
<section class="lp-section" data-box="credentials" data-layout="cards-3">
  <h2>{Brief H2}</h2>
  <div class="lp-cards">
    <div class="lp-card"><h3>{Real licence/registration/membership}</h3><p>{Number as text + what it means for the reader.}</p></div>
    <div class="lp-card"><h3>{Insurance / accreditation}</h3><p>{…}</p></div>
  </div>
  <table class="lp-table" data-box="checklist-table">
    <thead><tr><th>{What to check}</th><th>{Where to find it}</th><th>{Why it matters}</th></tr></thead>
    <tbody><tr><td>…</td><td>…</td><td>…</td></tr></tbody>
  </table>
</section>
```

### Testimonial (real only)
```html
<figure class="lp-testimonial" data-box="testimonial" data-layout="full">
  <blockquote><p>{Real review text, or paraphrase if the brief bans quotes}</p></blockquote>
  <figcaption>{Real name or initial}, {city}, {source e.g. Google review}</figcaption>
</figure>
```

### Comparison table (only when the category has real alternatives worth comparing)
```html
<table class="lp-table" data-box="comparison" data-layout="table-compare">
  <thead><tr><th>{Option}</th><th>{Cost}</th><th>{Speed}</th><th>{Best for}</th></tr></thead>
  <tbody><tr><td>…</td><td>…</td><td>…</td><td>…</td></tr></tbody>
</table>
```
A single-option or immature category gets no comparison table: a table with nothing to compare reads
as a spec sheet.

### Objection / guarantee box
```html
<section class="lp-section" data-box="objection" data-layout="full">
  <h2>{Only if the outline has room, else an H3 inside a section}</h2>
  <p>{Real guarantee/returns/refund terms from the brief. Optional honest "not for you if…" line.}</p>
</section>
```

### CTA band (mid-page, repeat 1–2 times)
```html
<aside class="lp-cta-band" data-box="cta-band" data-layout="cta-band">
  <p class="lp-cta-title">{3–8 word heading, local where relevant}</p>
  <p>{10–25 words, real reason to act now}</p>
  <a class="lp-btn lp-btn-primary" href="{#contact or booking URL}">{primary action}</a>
</aside>
```
Use `<p class="lp-cta-title">`, not a heading tag, so CTA bands don't add headings to the outline.

### FAQ (visible) + FAQPage JSON-LD
```html
<section class="lp-section lp-faq" data-box="faq" data-layout="faq-accordion">
  <h2>{Brief H2}</h2>
  <details class="lp-faq-item"><summary><h3>{Question verbatim}</h3></summary><p>{Answer}</p></details>
</section>
```
If the CMS strips `<details>`, use plain `<h3>` + `<p>` pairs.

### Areas grid (city-wide pages: coverage grouped by region)
```html
<div class="lp-areas" data-box="areas-grid" data-layout="links-grid-4">
  <div class="lp-area-group"><h3>{Region}</h3><ul><li>{District}</li><li>{District}</li></ul></div>
</div>
```
Only list areas the brief/site says are covered. Link an area only if its page exists.

### Nearby areas / related links
```html
<section class="lp-section" data-box="areas" data-layout="links-grid-3">
  <h2>{Brief H2}</h2>
  <p>{1–2 sentences on coverage, true to the brief.}</p>
  <ul class="lp-links">
    <!-- VERIFY URL: {only if unverified} -->
    <li><a href="{url}">{exact anchor from brief}</a></li>
  </ul>
</section>
```

### Final CTA / contact box
```html
<section class="lp-final-cta" id="contact" data-box="final-cta" data-layout="contact-split">
  <h2>{Only if the brief's outline includes it; otherwise p.lp-cta-title}</h2>
  <p>{One or two lines: what happens after they contact you}</p>
  <ul class="lp-contact-duo">
    <li><span>{Call}</span> <a href="tel:{+E164}">{number in local display format}</a></li>
    <li><span>{Email}</span> <a href="mailto:{email}">{email}</a></li>
    <li><span>{WhatsApp}</span> <a href="https://wa.me/{E164 digits}">{label}</a></li>
  </ul>
  <p><a class="lp-btn lp-btn-secondary" href="{contact form URL}">{form action}</a></p>
  <address>{Business name}, {address verbatim, in local format}</address>
</section>
```
LTR pages may group phone digits the local way; RTL pages keep them unbroken in `<bdi>`. Drop any
channel the brief doesn't give.

### Schema block (end of file)
```html
<!-- OPTIONAL SCHEMA: ready-to-paste JSON-LD. Skip it if the site already outputs schema through a plugin (for example Rank Math). The FAQ text matches the visible FAQ word for word. -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "{most specific LocalBusiness subtype, or Organization}",
      "@id": "{https://site/#business}",
      "name": "{Business}", "url": "{https://site/}", "telephone": "{+E164}",
      "address": { "@type": "PostalAddress", "streetAddress": "{…}", "addressLocality": "{…}",
                   "postalCode": "{…}", "addressCountry": "{ISO country code}" }
    },
    {
      "@type": "Service",
      "name": "{service + location, in page language}",
      "serviceType": "{service}",
      "provider": { "@id": "{https://site/#business}" },
      "areaServed": { "@type": "Place", "name": "{area}" },
      "offers": { "@type": "Offer", "priceSpecification": { "@type": "UnitPriceSpecification",
        "price": "{number}", "priceCurrency": "{ISO currency}", "unitText": "{unit}",
        "valueAddedTaxIncluded": {true|false} } }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "{Q verbatim}",
          "acceptedAnswer": { "@type": "Answer", "text": "{A verbatim}" } }
      ]
    }
  ]
}
</script>
```
Replace `Service` with `Product` or `SoftwareApplication` for product/SaaS pages. Drop `offers` if the
brief gives no price.

---

## Process

1. **Brief sheet** (Step 0), including language, locale and formality. List the hub, sibling and
   reference pages. Build the page fingerprint of any sample. Thin brief → lock the Rule of One and the
   traffic signal.
2. **Research what the page needs to be accurate**: open reference/sibling pages of the target site if
   reachable; check the site's own conventions (digits, formality, currency, spelling); verify
   technical/legal/local facts at primary sources for that country; verify internal link URLs. Save the
   visible text of the hub and each sibling to files (for example `hub.txt`) for the QA compare. Keep a
   list of sources.
3. **Box plan**: one line per box: brief section, module, `data-layout`, word budget, CTA yes or no. Check
   rhythm (rule 3b) on the plan before writing: prose count, no same-type neighbours, CTA spacing. Mark
   which gaps become `[CONFIRM: ...]` and which sections are conditional.
4. **Write** section by section natively in the page language, following the grains, locale guide,
   style rules and banned claims. Local substance in the local section; fresh wording in shared
   sections.
5. **Schema**: build the JSON-LD graph from the finished visible text (copy FAQ text exactly).
6. **Assemble** one `.html` file: meta comment on top, boxes in order, JSON-LD at the end. No
   `<html>/<head>/<body>` wrapper, no CSS.
7. **Run the QA script** (below) with the brief's word range, keyword, locale, banned claims, style
   flags, required and reserved anchors, price wording, FAQ range and `--compare` files. Fix every FAIL;
   fix or explain every WARN.
8. **Editorial pass**: read it as a local buyer. Does it sound native, with the right formality? Does
   the first screen answer the intent? Any box doing two jobs? Any filler? Any fact not from the brief
   or a checked source? Any claim stretched beyond the brief's wording (rule 6)? Any paragraph shared
   word for word with a sibling page?
9. **Deliver**: the `.html` file + a delivery note in the user's chat language (see below).

---

## Delivery note (separate from the HTML, short)

- Word count and QA result (FAILs fixed, any WARN left and why).
- Page fingerprint summary and the box plan (module, layout and words per box).
- Language/locale and formality chosen, if the brief didn't state them.
- Assumptions made where the brief was silent.
- VERIFY list: every conditional fact written with a comment, every unverified URL.
- Optional sentences held back ("only if the client confirms"), ready to paste.
- Brief corrections, if any fact in the brief was wrong, with the source.
- Live-site inconsistencies noticed (e.g. another page still claiming something the brief bans).
- Boxes cut for lack of real data (testimonials, ratings, guarantee, a real project) and what to supply to add them.
- Open `[CONFIRM: ...]` gaps, each with who must answer and the sentence to use afterwards.
- Hub and sibling comparison result (shared runs, if any, and why).
- Schema: the block is included as optional; say whether the brief expects a plugin to output schema.
- Sources checked for technical/legal/local facts (one line each).

---

## QA script

Save as `check_landing.py` in the working folder the first time you use this skill, then run it with
the values from the brief sheet:
`python3 check_landing.py page.html --keyword "{kw}" --min {min} --max {max} --locale {locale} --banned "{banned claims and their synonyms, pipe-separated}" [--no-emdash] [--no-quotes] [--required-links "{anchor}=>{url}|{anchor}=>{url}"] [--reserved-anchors "{anchor}|{anchor}"] [--price-suffix "+VAT"] [--faq-min {n} --faq-max {n}] [--max-prose 4] [--compare hub.txt,sibling.html] [--allow-zwnj]`
Only pass the flags the brief needs. `--required-links` takes `anchor=>url` pairs separated by `|`;
leave the url empty (`anchor=>`) to check the anchor only. `--faq-min/--faq-max` default to 30 and 80;
pass the brief's range when it gives one. `--price-suffix` makes every price (page, tables, meta)
carry the tax wording. `--compare` takes the saved text or HTML of the hub and siblings. It checks:
visible word count, one H1 and no skipped levels, outline, keyword use (exact and loose, allowing up to
two words in between) and stuffing, em/en dashes, quote marks (including „ “ « » ‹ ›), banned claims,
price wording, US vs UK spelling for English locales, RTL issues (inline direction styles, mixed digit
systems, hyphenated phones) and ZWNJ characters on Persian pages (FAIL unless `--allow-zwnj`),
links/anchors (exact required anchors, reserved anchors used as link text, placeholder URLs, tel:
format), per-box and per-card word counts, `data-layout` on every top-level box, page rhythm (prose
paragraphs and share, same-type neighbours, CTA spacing), FAQ answer lengths, JSON-LD validity, FAQ
schema matching visible text verbatim, open `[CONFIRM: ...]` gaps and VERIFY flags, and shared 8-word
runs with the hub or siblings. For languages it has no spelling list for, do the spelling/formality
check yourself in the editorial pass.

```python
#!/usr/bin/env python3
"""Landing page QA checker (stdlib only).
Usage:
  python3 check_landing.py page.html --keyword "{target keyword}" --min 900 --max 1400 \
      --locale {en-GB|en-US|en-AU|de|fa|ar|es|...} --banned "{brief's banned claims, pipe-separated}" \
      [--no-emdash] [--no-quotes] [--required-links "anchor=>url|anchor=>url"] \
      [--reserved-anchors "anchor|anchor"] [--price-suffix "+VAT"] [--faq-min 40 --faq-max 80] \
      [--max-prose 4] [--compare hub.txt,sibling.html] [--allow-zwnj]
Prints a report; exit code 1 if any FAIL.
"""
import argparse, json, re, sys
from html.parser import HTMLParser

VOID = {"br", "img", "hr", "meta", "link", "input", "source", "wbr", "area", "col", "embed", "param", "track"}
BLOCK = {"p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "td", "th", "div", "section", "summary",
         "details", "figcaption", "blockquote", "dt", "dd", "tr", "a", "span", "strong", "em", "b"}
UNITS = {"p", "li", "td", "th", "summary", "h1", "h2", "h3", "h4", "h5", "h6", "figcaption"}
LAYOUTS = {"hero-split", "hero-full", "full", "split-text-image", "ticks-offer", "cards-2", "cards-3",
           "cards-4", "tiles-3", "tiles-4", "table", "table-compare", "steps-vertical",
           "steps-horizontal", "chips", "links-grid-3", "links-grid-4", "faq-accordion", "faq-plain",
           "cta-band", "contact-split", "gallery-grid", "reviews-widget"}
CURRENCY = re.compile(r"(?:A\$|AU\$|NZ\$|US\$|CA\$|[£$€])\s?\d[\d,]*(?:\.\d+)?")


class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []            # open tags
        self.skip = 0              # inside script/style
        self.text = []             # visible text chunks
        self.heads = []            # (level, text)
        self._head = None
        self.links = []            # (href, anchor)
        self._link = None
        self.jsonld = []
        self._script_ld = False
        self._buf = ""
        self.comments = []
        self.boxes = []            # [name, classes, words]
        self._boxstack = []
        self.cards = []            # [classes, words]
        self._cardstack = []
        self.top = []              # top-level data-box records, in page order
        self._curtop = None
        self._ustack = []          # open text units (p, li, td, th, headings ...)
        self.units = []            # (tag, text, in_faq)
        self.prose = []            # (text, words) of prose paragraphs outside faq/cards/tables
        self.faq_answers = []      # (text, words)
        self.th_texts = []

    def _mark_kinds(self, tag, cls):
        if self._curtop is None:
            return
        k = self._curtop["kinds"]
        if tag == "table": k.add("table")
        elif tag == "ol": k.add("steps")
        elif tag == "details": k.add("faq")
        if re.search(r"\blp-cards?\b", cls): k.add("cards")
        if re.search(r"\blp-tiles?\b", cls): k.add("tiles")
        if re.search(r"\blp-chips\b", cls): k.add("chips")
        if re.search(r"\blp-(links|areas)\b", cls): k.add("links")
        if re.search(r"\blp-btn\b", cls): k.add("cta")

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("script", "style"):
            self.skip += 1
            self._script_ld = tag == "script" and a.get("type") == "application/ld+json"
            self._buf = ""
            return
        if tag in VOID:
            return
        self.stack.append(tag)
        cls = a.get("class", "") or ""
        if tag in UNITS:
            self._ustack.append([tag, ""])
        if re.fullmatch(r"h[1-6]", tag):
            self._head = [int(tag[1]), ""]
        if tag == "a":
            self._link = [a.get("href", ""), ""]
        if "data-box" in a:
            rec = None
            if not self._boxstack:
                rec = {"name": a["data-box"], "cls": cls, "layout": a.get("data-layout", ""),
                       "kinds": set(), "words": 0}
                self.top.append(rec)
                self._curtop = rec
            self._boxstack.append([a["data-box"], cls, 0, len(self.stack), rec])
        self._mark_kinds(tag, cls)
        if re.search(r"\blp-card\b", cls):
            self._cardstack.append([cls, 0, len(self.stack)])

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            if self._script_ld:
                self.jsonld.append(self._buf)
            self._script_ld = False
            return
        if tag in VOID:
            return
        if self._head and re.fullmatch(r"h[1-6]", tag):
            self.heads.append((self._head[0], " ".join(self._head[1].split())))
            self._head = None
        if tag == "a" and self._link:
            self.links.append((self._link[0], " ".join(self._link[1].split())))
            self._link = None
        if tag in UNITS and self._ustack and self._ustack[-1][0] == tag:
            u = self._ustack.pop()
            text = " ".join(u[1].split())
            infaq = ("details" in self.stack or
                     any("faq" in b[0].lower() or "lp-faq" in b[1] for b in self._boxstack))
            self.units.append((tag, text, infaq))
            n = len(text.split())
            if tag == "th":
                self.th_texts.append(text)
            if tag == "p":
                if infaq:
                    self.faq_answers.append((text, n))
                elif n >= 45 and not self._cardstack and not any(
                        t in self.stack for t in ("td", "th", "li", "figcaption", "address", "blockquote")):
                    self.prose.append((text, n))
        depth = len(self.stack)
        while self._boxstack and self._boxstack[-1][3] == depth:
            b = self._boxstack.pop()
            self.boxes.append(b[:3])
            if b[4] is not None:
                b[4]["words"] = b[2]
                if self._curtop is b[4]:
                    self._curtop = None
        while self._cardstack and self._cardstack[-1][2] == depth:
            self.cards.append(self._cardstack.pop()[:2])
        if self.stack:
            # pop to matching tag (tolerant)
            for i in range(len(self.stack) - 1, -1, -1):
                if self.stack[i] == tag:
                    del self.stack[i:]
                    break
        if tag in BLOCK:
            self.text.append(" ")

    def handle_data(self, d):
        if self.skip:
            if self._script_ld:
                self._buf += d
            return
        self.text.append(d)
        if self._head is not None:
            self._head[1] += d
        if self._link is not None:
            self._link[1] += d
        if self._ustack:
            self._ustack[-1][1] += d
        n = len(d.split())
        for b in self._boxstack:
            b[2] += n
        for c in self._cardstack:
            c[1] += n

    def handle_comment(self, d):
        self.comments.append(d)


def norm(s):
    s = re.sub(r"<[^>]+>", " ", s)
    return " ".join(s.replace(" ", " ").split()).lower()


def primary(rec):
    n = rec["name"].lower(); k = rec["kinds"]; c = rec["cls"]
    if "faq" in n or "faq" in k: return "faq"
    if n.startswith("hero"): return "hero"
    if "cta-band" in n or "lp-cta-band" in c or "final-cta" in n or "lp-final-cta" in c: return "cta-band"
    for kk in ("steps", "cards", "tiles", "table", "links", "chips"):
        if kk in k: return kk
    return "prose"


def wlist(text):
    return re.findall(r"\w+", text.lower())


UK_WORDS = r"\b(colour|colours|favourite|centre|centres|organise|organised|organisation|analyse|customise|" \
           r"prioritise|specialise|specialised|behaviour|neighbour|neighbours|neighbourhood|labour|fibre|" \
           r"litre|litres|grey|catalogue|mould|aluminium|flat|flats|tap|taps|postcode)\b"
US_WORDS = r"\b(color|colors|favorite|center|centers|organize|organized|organization|analyze|customize|" \
           r"prioritize|specialize|specialized|behavior|neighbor|neighbors|neighborhood|labor|fiber|" \
           r"liter|liters|gray|catalog|mold|aluminum|furnace|faucet|apartment|apartments|licensed plumber)\b"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("file")
    ap.add_argument("--keyword", default="")
    ap.add_argument("--min", type=int, default=0)
    ap.add_argument("--max", type=int, default=0)
    ap.add_argument("--locale", default="")
    ap.add_argument("--banned", default="", help="pipe-separated phrases/regex, case-insensitive")
    ap.add_argument("--no-emdash", action="store_true")
    ap.add_argument("--no-quotes", action="store_true")
    ap.add_argument("--card-max", type=int, default=70)
    ap.add_argument("--required-links", default="", help="pipe-separated 'anchor=>href' pairs")
    ap.add_argument("--reserved-anchors", default="",
                    help="pipe-separated anchors reserved for OTHER pages to use toward this page; "
                         "this page must not use them as link text")
    ap.add_argument("--price-suffix", default="",
                    help="pipe-separated tax wording every price must carry, e.g. '+VAT'")
    ap.add_argument("--faq-min", type=int, default=30)
    ap.add_argument("--faq-max", type=int, default=80)
    ap.add_argument("--max-prose", type=int, default=4, help="max prose paragraphs (45+ words) on the page")
    ap.add_argument("--compare", default="",
                    help="comma-separated hub/sibling files (.html or text) to check for shared 8-word runs")
    ap.add_argument("--allow-zwnj", action="store_true",
                    help="Persian only: allow ZWNJ characters (default is to forbid them)")
    a = ap.parse_args()

    raw = open(a.file, encoding="utf-8").read()
    p = P(); p.feed(raw); p.close()
    vis = " ".join("".join(p.text).split())
    words = len(vis.split())
    fails, warns = [], []
    out = []

    def rep(level, msg):
        (fails if level == "FAIL" else warns if level == "WARN" else out).append(msg)

    # meta comment
    m_t = re.search(r"Meta title:\s*(.+?)\s*(?:-->|$)", raw, re.M)
    m_d = re.search(r"Meta description:\s*(.+?)\s*(?:-->|$)", raw, re.M)
    meta_texts = []
    if m_t:
        t = m_t.group(1).strip(); meta_texts.append(t); out.append(f"Meta title ({len(t)} chars): {t}")
        if len(t) > 60: rep("WARN", f"Meta title {len(t)} chars (> ~60 may truncate)")
    else:
        rep("WARN", "No 'Meta title:' line in top comment")
    if m_d:
        d = m_d.group(1).strip(); meta_texts.append(d); out.append(f"Meta description ({len(d)} chars)")
        if len(d) > 160: rep("WARN", f"Meta description {len(d)} chars (> ~160 may truncate)")
    else:
        rep("WARN", "No 'Meta description:' line in top comment")

    # word count
    out.append(f"Visible words: {words}" + (f" (target {a.min}-{a.max})" if a.max else ""))
    if a.max and not (a.min <= words <= a.max):
        rep("FAIL", f"Word count {words} outside {a.min}-{a.max}")

    # headings
    h1 = [h for h in p.heads if h[0] == 1]
    if len(h1) != 1: rep("FAIL", f"{len(h1)} H1 tags (need exactly 1)")
    prev = 0
    out.append("Outline:")
    for lvl, txt in p.heads:
        out.append(f"  {'  ' * (lvl - 1)}H{lvl}: {txt}")
        if prev and lvl > prev + 1: rep("FAIL", f"Skipped heading level before H{lvl}: {txt}")
        prev = lvl

    # keyword
    if a.keyword:
        kw = a.keyword.lower()
        cnt = vis.lower().count(kw)
        first = " ".join(vis.split()[:120]).lower()
        loose = re.compile(r"\W+(?:\w+\W+){0,2}".join(map(re.escape, kw.split())), re.I)
        lcnt = len(loose.findall(vis))
        out.append(f"Keyword loose matches (up to 2 words between terms, e.g. 'in'): {lcnt}")
        out.append(f"Keyword '{a.keyword}': {cnt}x exact; in first 120 words: {kw in first}; "
                   f"in H1: {bool(h1) and kw in h1[0][1].lower()}")
        if cnt == 0 and lcnt == 0: rep("WARN", "Keyword never appears in visible text (fine only if a natural variant is used)")
        dens = cnt * len(kw.split()) / max(words, 1) * 100
        if dens > 3: rep("WARN", f"Keyword density {dens:.1f}% looks stuffed")

    # punctuation rules
    if a.no_emdash:
        n = vis.count("—") + vis.count("–")
        if n: rep("FAIL", f"{n} em/en dash(es) in visible text")
    if a.no_quotes:
        q = re.findall("[\"“”„«»‹›]|(?:^|\\s)[‘‚']\\w", vis)
        if q: rep("FAIL", f"{len(q)} quotation mark(s) in visible text")

    # banned claims
    for ph in [b for b in a.banned.split("|") if b.strip()]:
        hits = re.findall(ph, vis, flags=re.I)
        if hits: rep("FAIL", f"Banned claim '{ph}' found {len(hits)}x")

    # price wording (e.g. every price carries +VAT)
    if a.price_suffix:
        sufs = [re.sub(r"\s+", "", s.strip().lower()) for s in a.price_suffix.split("|") if s.strip()]
        has = lambda t: any(s in re.sub(r"\s+", "", t.lower()) for s in sufs)
        th_ok = any(has(t) for t in p.th_texts)
        for tag, text, _ in p.units:
            if CURRENCY.search(text) and not has(text) and not (tag == "td" and th_ok):
                rep("FAIL", f"Price without '{a.price_suffix}': {text[:90]}")
        for mt in meta_texts:
            if CURRENCY.search(mt) and not has(mt):
                rep("FAIL", f"Price without '{a.price_suffix}' in meta: {mt[:90]}")

    # locale
    loc = a.locale.lower()
    if loc in ("en-gb", "en-au", "en-nz", "en-ie"):
        us = sorted(set(m.lower() for m in re.findall(US_WORDS, vis, flags=re.I)))
        if us: rep("WARN", f"Possible US spellings/terms for {a.locale}: {', '.join(us)}")
    if loc == "en-us":
        uk = sorted(set(m.lower() for m in re.findall(UK_WORDS, vis, flags=re.I)))
        if uk: rep("WARN", f"Possible UK spellings/terms for en-US: {', '.join(uk)}")
    if loc.split("-")[0] in ("fa", "ar", "he", "ur"):
        if re.search(r"style=\"[^\"]*(direction|text-align)", raw, re.I):
            rep("WARN", "Inline direction/text-align style on an RTL page (let the theme control it)")
        east = len(re.findall("[۰-۹٠-٩]", vis)); west = len(re.findall(r"[0-9]", vis))
        if east and west:
            rep("WARN", f"Mixed digits: {east} Persian/Arabic-Indic and {west} Latin (fine only inside phones/codes in <bdi>)")
        if re.search(r"<a[^>]+tel:[^>]*>(?:(?!</a>).)*\d-\d", raw, re.S):
            rep("WARN", "Hyphenated phone number on an RTL page (bidi reorders it; show digits unbroken)")
    if loc.split("-")[0] == "fa" and not a.allow_zwnj:
        zw = raw.count("")
        if zw:
            rep("FAIL", f"{zw} ZWNJ (half-space) character(s) found; write the word joined or with a normal space "
                        f"(use --allow-zwnj only if the brief or site requires them)")

    # links
    out.append("Links:")
    for href, anc in p.links:
        out.append(f"  [{anc}] -> {href}")
        if not href or href == "#" or "VERIFY" in href.upper():
            rep("WARN", f"Link needs a real URL: [{anc}] -> {href or '(empty)'}")
        if href.startswith("tel:") and not re.fullmatch(r"tel:\+?\d{6,15}", href):
            rep("FAIL", f"Malformed tel: link {href}")
    for pair in [x for x in a.required_links.split("|") if "=>" in x]:
        anc, href = [s.strip() for s in pair.split("=>", 1)]
        ok = any(an.lower() == anc.lower() and (not href or h.rstrip('/') == href.rstrip('/')) for h, an in p.links)
        if not ok: rep("FAIL", f"Required link missing or anchor not exact: [{anc}] -> {href}")
    for ra in [x.strip().lower() for x in a.reserved_anchors.split("|") if x.strip()]:
        for h, an in p.links:
            if an.lower() == ra:
                rep("FAIL", f"Reserved anchor used as link text on this page: [{an}] -> {h}")

    # boxes / cards
    if p.boxes:
        out.append("Boxes (data-box: words):")
        for name, cls, n in p.boxes:
            out.append(f"  {name}: {n}")
    for cls, n in p.cards:
        if n > a.card_max: rep("WARN", f"Card over {a.card_max} words ({n}): class='{cls}'")

    # layout hints
    if p.top:
        out.append("Top-level box plan (module | data-layout | words):")
        for r in p.top:
            out.append(f"  {r['name']}: {primary(r)} | {r['layout'] or '-'} | {r['words']}")
        miss = [r["name"] for r in p.top if not r["layout"]]
        if miss: rep("WARN", f"No data-layout on top-level box(es): {', '.join(miss)}")
        for r in p.top:
            if r["layout"] and r["layout"] not in LAYOUTS and not r["layout"].startswith("{"):
                rep("WARN", f"Unknown data-layout '{r['layout']}' on box '{r['name']}'")

    # page rhythm
    seq = [(r["name"], primary(r)) for r in p.top]
    for (n1, k1), (n2, k2) in zip(seq, seq[1:]):
        if k1 == k2 and k1 != "hero":
            rep("WARN", f"Rhythm: '{n1}' and '{n2}' are both {k1} boxes back to back "
                        f"(put a different module or a CTA band between them)")
    run = worst = ctas = 0; worst_at = ""
    for r in p.top:
        if "cta" in r["kinds"] or primary(r) == "cta-band":
            ctas += 1; run = 0
        else:
            run += 1
            if run > worst: worst, worst_at = run, r["name"]
    if p.top:
        out.append(f"CTA boxes: {ctas}; longest run of boxes without a CTA: {worst}")
        if worst > 3: rep("WARN", f"{worst} boxes in a row without a CTA (ends at '{worst_at}')")
        if ctas < 3: rep("WARN", f"Only {ctas} CTA box(es); aim for 3-4 unless the brief limits CTAs")
    prose_words = sum(n for _, n in p.prose)
    out.append(f"Prose paragraphs (45+ words, outside FAQ/cards/tables): {len(p.prose)}, {prose_words} words")
    if len(p.prose) > a.max_prose:
        rep("WARN", f"{len(p.prose)} prose paragraphs (max {a.max_prose}): " +
            "; ".join(f"{t.split()[0] if t else ''}... ({n}w)" for t, n in p.prose))
    if words and prose_words / words > 0.30:
        rep("WARN", f"Prose is {prose_words / words * 100:.0f}% of the page (keep it to about a quarter)")

    # FAQ answers
    if p.faq_answers:
        out.append(f"FAQ answers: {len(p.faq_answers)}, words " + ", ".join(str(n) for _, n in p.faq_answers))
        for t, n in p.faq_answers:
            if n < a.faq_min or n > a.faq_max:
                rep("FAIL", f"FAQ answer {n} words (need {a.faq_min}-{a.faq_max}): {t[:60]}")

    # JSON-LD
    faq_pairs = []
    for blk in p.jsonld:
        try:
            data = json.loads(blk)
        except Exception as e:
            rep("FAIL", f"Invalid JSON-LD: {e}"); continue
        items = data.get("@graph", [data]) if isinstance(data, dict) else data
        for it in items:
            t = it.get("@type")
            out.append(f"JSON-LD type: {t}")
            if t == "FAQPage":
                for q in it.get("mainEntity", []):
                    faq_pairs.append((q.get("name", ""), q.get("acceptedAnswer", {}).get("text", "")))
    nvis = norm(vis)
    for q, ans in faq_pairs:
        if norm(q) not in nvis: rep("FAIL", f"FAQ schema question not in visible text: {q[:70]}")
        if norm(ans) not in nvis: rep("FAIL", f"FAQ schema answer not verbatim in visible text: {q[:50]}")
    if not p.jsonld:
        out.append("No JSON-LD block (fine only if the brief or site does not want one)")

    # markers left for the human
    flags = [c.strip() for c in p.comments if "VERIFY" in c.upper()]
    for f in flags: out.append(f"VERIFY flag: {f[:140]}")
    confirms = re.findall(r"\[CONFIRM:[^\]]*\]", vis)
    for c in confirms: out.append(f"CONFIRM gap: {c[:140]}")
    if confirms:
        rep("WARN", f"{len(confirms)} [CONFIRM: ...] gap(s) still open; list them in the delivery note, "
                    f"they must be filled before publishing")

    # shared text with hub / sibling pages
    for path in [x.strip() for x in a.compare.split(",") if x.strip()]:
        try:
            other = open(path, encoding="utf-8").read()
        except Exception as e:
            rep("WARN", f"Cannot read compare file {path}: {e}"); continue
        if re.search(r"<\w+[^>]*>", other):
            q = P(); q.feed(other); q.close(); other = " ".join("".join(q.text).split())
        A = wlist(vis); B = wlist(other); N = 8
        sh = {tuple(B[i:i + N]) for i in range(len(B) - N + 1)}
        hit = [False] * len(A)
        for i in range(len(A) - N + 1):
            if tuple(A[i:i + N]) in sh:
                for j in range(i, i + N): hit[j] = True
        runs = []; i = 0
        while i < len(A):
            if hit[i]:
                j = i
                while j < len(A) and hit[j]: j += 1
                runs.append((i, j)); i = j
            else:
                i += 1
        shared = sum(j - i for i, j in runs)
        out.append(f"Compare {path}: {len(runs)} shared run(s), {shared} words "
                   f"({shared / max(len(A), 1) * 100:.0f}% of this page)")
        for i, j in runs[:6]:
            out.append(f"   {j - i} words: {' '.join(A[i:min(j, i + 14)])}...")
        if runs:
            rep("WARN", f"{len(runs)} stretch(es) of 8+ identical words shared with {path} "
                        f"(rewrite, or explain in the note if the brief dictates it)")

    print("\n".join(out))
    print("\nWARNINGS:" if warns else "\nWARNINGS: none")
    for w in warns: print("  - " + w)
    print("FAILS:" if fails else "FAILS: none")
    for f in fails: print("  - " + f)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
```

---

## Final checklist

- Outline, H1, meta, FAQ questions exactly as the brief gives them; one H1; no new H2s.
- Page reads as native copy for the target market: language, spelling variant, formality, number,
  currency, date and phone formats, punctuation.
- Thin brief: one persona, one promise; linking matches the traffic signal.
- Every section has a box shape; cards ≤ 70 words; narrative boxes ≤ ~180 words, max 2–3.
- Visible word count inside the brief's range (or the page-type default).
- Rhythm: at most 4 prose paragraphs, no same-type neighbour boxes, a CTA at least every 4 boxes.
- Every top-level box has `data-box` and `data-layout`.
- First screen: H1 + promise + CTA + real trust chips; intro answers the intent in sentence one.
- Every business fact comes from the brief/site, unstretched; every technical/legal/local fact was
  checked for that country.
- No banned claim, synonym or translation of it; no implied claim the brief doesn't support.
- Style rules (punctuation, brand spelling) hold in every visible string.
- Local pages: real local substance, location used naturally, no box copied from a sibling.
- Child pages: different angle from the hub, hub facts matched to the brief, `--compare` run on hub and siblings.
- Gaps the brief said to leave blank are visible `[CONFIRM: ...]` markers, not guesses and not comments.
- Internal links: exactly the brief's, exact anchors, correct sections; unverified URLs flagged.
- CTAs 3–4 times, specific copy in the page language, phone only where allowed, `tel:` in E.164.
- Schema graph matches the page and sits in an `OPTIONAL SCHEMA` block; FAQ schema verbatim; no rating without real visible reviews.
- Site-wide widgets left as placeholders, not written as fake copy.
- RTL: `<bdi>` around Latin runs and phones, unbroken phone digits, one digit system, no inline
  direction styles.
- QA script shows no FAILs; delivery note lists VERIFY items, CONFIRM gaps, held-back sentences, the fingerprint summary and sources.
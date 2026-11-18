---
name: product-page-content
description: >-
  Write publish-ready e-commerce product page (PDP) content from structured product data: title, short
  and long description, benefits, specification table, variants and size guidance, who it is for,
  usage and care, shipping/returns/warranty, FAQ, meta, image alt-text suggestions and Product/Offer
  JSON-LD, in ANY language including Persian/RTL. Use whenever the user gives a product, a product data
  sheet, a manufacturer description to rewrite, a product feed row or a keyword for one catalogue item,
  or says "product page", "product description", "صفحه محصول", "توضیحات محصول", "معرفی محصول",
  "محتوای صفحه محصول فروشگاه" — even without the word "skill". Never invents specs, prices,
  availability, ratings or reviews; rewrites manufacturer copy instead of copying it. Not for campaign
  landing pages (landing-page-content), articles (seo-blog-guide), directories (gzlocation) or sponsored
  articles (advertorial-content).
---

# Product Page Content — catalogue product page builder (v2.0.0)

Turns product data (plus an optional brief) into ONE product page: the words a shopper needs to decide,
the facts a search engine can verify, and schema that mirrors both. Read
`references/core/core-rules.md` first (shared rules), and `references/core/persian-rtl-style.md` for
RTL pages. The input shape for product data is in `references/product-data-sheet.md`.

The single most important idea: **the product data sheet owns the facts; you own the clarity.** Every
spec, number, material, dimension, price, availability, warranty term and compatibility statement comes
from the data sheet or a verified source. Your craft is turning those facts into answers to the shopper's
real questions, in the shopper's words, without inflating anything.

## Boundaries

- One catalogue SKU or one variant family → this skill.
- A campaign or offer page, a category page, a "best X" comparison article → other skills.
- Reviews are the shop's own and real: you never write them (see rule 6).

## Inputs

`product_data` (see the data sheet) plus the standard brief fields. If the pipeline gives only a
keyword and a name, return `needs_input`: a product page cannot be written without attributes. Ask for
at most 3 things (core attributes, price and availability, warranty or returns). Extract or assume:

- Product name exactly as the shop writes it; brand; model; category; variants.
- Attributes with units, each tagged with its source (`shop`, `manufacturer`, `label`).
- Price, currency, tax wording, availability; shipping, return and warranty terms **as the shop states
  them**.
- Manufacturer description (a source to rewrite, never to paste); real reviews (count, average, text) if
  the shop supplies them; image list with what each shows.
- Target persona and the shopper's main objections; internal links with status; style profile.

## Rules

### 1. Facts only from the data sheet (and verified sources)
Specs and claims are class A or B facts (`core-rules.md` section 2). If the data sheet lacks something a
shopper obviously needs (battery life, fabric composition, size chart), do not fill it from memory:
write `[CONFIRM: attribute, from whom]` where the fact belongs and list the gap. Never convert units
silently, never round, never merge two variants' specs. Compatibility ("fits model X") is stated only
when the sheet says so.

### 2. Rewrite, never copy
Manufacturer or supplier text is raw material. The QA script flags any stretch of 8 or more identical
words (`--source-text`). Duplicate manufacturer copy gives a page nothing of its own to rank on, so
rewrite it around the shopper's questions, and keep the product's real differentiators.

### 3. Structure (default order; the brief's outline wins if given)
1. `<h1>`: the product name as the shop writes it, plus the one attribute shoppers search by.
2. **Short description** (40-80 words): what it is, who it is for, the main reason to buy; the keyword
   appears naturally.
3. **Key facts box**: price block as the shop displays it, availability, variant choice, the 3-6
   attributes that decide most purchases.
4. **Benefits** (3-6 cards of 25-60 words): each a benefit grounded in a spec ("keeps feet dry because the
   upper is waterproof fabric"), not an adjective.
5. **Specification table** (`<table>`): attribute | value | unit, grouped, only sheet data.
6. **Who it is for / not for**: an honest fit-check; it reduces returns and builds trust.
7. **Sizing or compatibility guidance** when variants or fit matter.
8. **Usage and care** when the sheet or label gives it.
9. **Shipping, returns and warranty**: exactly the shop's terms.
10. **Reviews**: real only (rule 6) or a widget placeholder.
11. **FAQ** (4-7): real pre-purchase questions (size, material, compatibility, delivery, returns, care),
    answers 30-70 words, answer first.
12. **Related products and guides**: only the supplied internal links.

A section without data is dropped, not padded. Word count follows the brief; default 400-900 visible
words. Density over volume.

### 4. Titles, meta and slug
- Meta title: product name + the decisive attribute + brand when it fits; about 60 characters; no year;
  no price unless the shop wants it and it will stay current.
- Meta description: about 155 characters, the product, one concrete benefit, a soft CTA. No claim the
  page does not back.
- Slug suggestion: short, lowercase, ASCII for Latin names; for Persian shops follow the shop's existing
  slug convention.

### 5. Claims, categories and compliance
- No superlatives or guarantees without proof in the sheet ("best", "number one", «بهترین», «تضمینی»).
- **Health, supplements, cosmetics with medical claims, children's products, electrical or safety
  equipment, food allergens**: only the label's or regulator-approved wording; raise `YMYL_REVIEW`.
- Authenticity ("original"), certifications, safety marks and trust badges only if the sheet gives the
  proof (number, issuer). Never invent an inspection or registration code.
- Comparative claims against named competitors are out.

### 6. Reviews, ratings and testimonials
Write none. Show reviews only if the shop supplied real ones; quote them accurately with a real first
name or initial and the source, or use `<!-- WIDGET: reviews -->`. `AggregateRating` appears in schema
only with a real rating value and count that are also **visible on the page**. Otherwise omit it and say
why in the delivery note.

### 7. Price and availability
Show them exactly as the data sheet gives them, with the tax wording. They change often, so the page
text states them once, in the key facts box; the schema `offers` must match the visible price and
availability and be fed by the shop's live data where possible (flag it: `NEED_CONFIRM` that the CMS
output stays in sync). Never write "cheapest", "discount" or "limited stock" unless the sheet says it,
and never invent urgency.

### 8. Images
No images are generated or invented. Suggest a short descriptive `alt` per supplied image, naming what
is visible (not stuffed with the keyword), and a comment slot `<!-- IMAGE: what a real photo should show -->`
where the page needs one. Every `<img>` has `alt`.

### 9. Internal links
Only the supplied links, descriptive anchors, in the section where the target helps (size guide in the
sizing section, care guide in the care section). Draft pages are not linked. No competitor links.

### 10. FAQ and schema
- `FAQPage` JSON-LD identical to the visible FAQ. Google shows FAQ rich results for few sites, so it is
  for clarity and AI answers, not a ranking device.
- `Product` JSON-LD: `name`, `description` (matches the page), `brand`, `sku`/`mpn`/`gtin` **only if in
  the sheet**, `image` only with supplied URLs, `offers` (price, priceCurrency in ISO code,
  availability URL, `url`) matching the visible text, `aggregateRating` per rule 6. Nothing else.
- Optional `BreadcrumbList` if the path is known. See `references/templates.md`.
- Merchant listing and price-comparison feeds must agree with the page; mention in the note that the
  page and feed share one source of truth.

### 11. Language and locale
Write natively in the shop's language. Currency, units, size standards (EU/US/UK, cm), date format and
terminology follow the locale and the shop's existing product pages. Persian: `persian-rtl-style.md`
(prices with one unit, Latin model names in `<bdi>`, ZWNJ per policy). Brand and model names stay as the
brand writes them.

### 12. Output hygiene
Semantic HTML, no scripts, no inline direction styles, widgets as comments. Follow `core-rules.md`
section 8.

## Process

1. **Parse** the data sheet. Mark every attribute `A` (shop-given) or `B` (verified). List gaps and
   conflicts (two different weights, say) as flags; use the shop's value and raise `CONFLICT`.
2. **Find the shopper's decision**: the 3-6 attributes and 3-5 objections for this category (fit,
   durability, compatibility, delivery, returns). Write them in your notes.
3. **Plan the sections** from the default order; drop what has no data.
4. **Write** short description, key facts, benefits, spec table, fit-check, policies, FAQ.
5. **Build schema** from the finished visible text.
6. **Assemble** one `.html` (meta comment on top, body, JSON-LD at the end, marked optional if the CMS
   emits product schema).
7. **QA**:
   ```bash
   python3 scripts/seo_qa.py product.html --type product --keyword "{kw}" --locale {locale} \
     --min {min} --max {max} --facts-file facts.txt --source-text manufacturer.txt \
     --zwnj-policy {standard|none} --digits {persian|latin|site} --banned "{banned claims}"
   ```
   `facts.txt` is the data sheet flattened to text; the script lists numbers on the page that are not in
   it, and checks that schema price and rating count are visible. Fix every FAIL; resolve or explain
   every WARN.
8. **Deliver** the page, the envelope and a short note.

## Delivery note

Word count and QA result; assumptions; `[CONFIRM]` gaps and what to supply; conflicts found in the data;
sections dropped for lack of data (reviews, size chart, care); what was rewritten from manufacturer text;
which schema fields were left out and why; whether price and availability come from live data.

## Checklist

- Every spec, number and claim is in the data sheet or a verified source; gaps are visible markers.
- No copied manufacturer stretches; benefits are grounded in specs.
- Spec table, key facts, fit-check, shipping/returns/warranty present when the data exists.
- No invented review, rating, certification, badge, discount or urgency.
- Schema mirrors the page; price, availability and rating count are visible; FAQ identical.
- `alt` on every image; meta within length; one H1; locale and Persian rules applied.
- `YMYL_REVIEW` where the category needs it. QA script passes.

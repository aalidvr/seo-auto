# Persian and RTL style rules (fa-IR; also applies to Arabic, Hebrew, Urdu where noted)

Shared by every SEO content skill. The project's `style_profile` can change the settings in section 1;
everything else is fixed.

## Contents
1. Style profile settings (and the ZWNJ decision)
2. Orthography
3. Digits, prices, units
4. Punctuation
5. Bidi and Latin runs
6. Terminology
7. Native-sounding Persian
8. Quick checks

## 1. Style profile settings

| Setting | Values | Default if the project is silent |
|---|---|---|
| `zwnj_policy` | `standard`: use the half-space (ZWNJ, U+200C) where Persian orthography calls for it (می‌خواهد، کتاب‌ها، خانه‌ام). `none`: no ZWNJ characters at all; write prefixes and suffixes joined (میخواهد، کتابها) or with a normal space. | `standard` |
| `digits` | `persian` (۰-۹), `latin` (0-9), `site` (copy the site's existing pages) | `site`; if unknown, `persian` for body text |
| `currency` | `toman`, `rial` | `toman`; state it once per price block |
| `formality` | `spoken-formal` (محاوره‌ای-رسمی, «شما»), `formal`, `friendly` | `spoken-formal` |
| `glossary` | Client terms to use exactly, and terms to avoid | empty |
| `quote_marks` | `«»` or `""` | `«»` |

**ZWNJ decision.** Two houses of practice exist. Strict Persian orthography wants the half-space; some
agencies and CMS setups forbid it because it breaks search matching, copy-paste or the theme font. The
earlier version of the landing-page skill forbade ZWNJ entirely. Do not guess: read `zwnj_policy` from
the project. If it is missing, use `standard` and record the assumption in `assumptions[]`. Whichever
policy applies, apply it to every visible string, including headings, table cells, FAQ and meta text.
The QA script checks it (`--fa-zwnj standard|none`).

## 2. Orthography

- Persian letters only: ی (U+06CC) and ک (U+06A9). The Arabic forms ي (U+064A) and ك (U+0643) are
  errors, including inside keywords. Normalise before matching keywords and say so when the brief
  contains the Arabic forms (a search keyword stays as the client wrote it in meta and anchors only if
  the brief says so).
- No double spaces, no space before ، ؛ ؟ ! . and one space after.
- No tatweel (ـ) for decoration.
- Do not mix ZWNJ and "joined" spelling for the same word on one page.
- Write «می‌خواهم» / «میخواهم» style consistently (section 1), never both.

## 3. Digits, prices, units

- One digit system per page (the site's). Phone numbers, codes, model numbers and Latin product names
  keep Latin digits and Latin letters.
- Prices: the number, the unit once (تومان / ریال), and the tax wording the brief gives. Do not round or
  convert. If the price can change, say "قیمت در لحظه ثبت سفارش نمایش داده می‌شود" only when the brief
  says so.
- Units follow the market: kilogram, centimetre, litre, °C; write the Persian unit name unless the
  brief or the product label uses the symbol.
- Dates: use the calendar the site uses (Jalali by default for fa-IR). Do not convert silently.

## 4. Punctuation

Use ، ؛ ؟ and «». Keep brand names and Latin terms in their own script. Ellipsis is one … only when
the brief allows ellipsis. Obey the brief's punctuation bans (for example no em dash) in every visible
string.

## 5. Bidi and Latin runs (HTML)

Observed failure: `0904-481-8841` inside an `<li>` on an RTL page rendered as `8841-481-0904`, because
the hyphen is a neutral character and numeric segments get reordered.

- Wrap every Latin-digit or Latin-letter run that sits inside RTL text in `<bdi>`: phone, price in Latin
  digits, coordinates, street number, hours, model number, brand in Latin.
- Show phone numbers with no separator: `09044818841`. The `tel:` link keeps E.164
  (`tel:+989044818841`).
- If visual grouping is truly needed, use only U+2060 (word joiner) or NBSP, never a hyphen.
- No inline `direction` or `text-align` styles. The site controls direction. `<bdi>` is a semantic
  element, not a style, and stays.
- Set `lang="fa"` on the page root when you deliver a full document; in a CMS body, the theme sets it.

## 6. Terminology

- Use the client's glossary exactly. SEO terms are written the way the Persian SEO market says them
  (ریفرینگ دومین، بک‌لینک، سایت‌واید، رپورتاژ، گست پست، لینک اینزرشن) when the glossary or brief says so,
  never as stiff calques such as «پیوند ورودی» unless the glossary asks for it.
- First use of a technical term: the Persian term, and the Latin term in `<bdi>` if readers know the
  Latin one.
- Brand and model names stay as the brand writes them.

## 7. Native-sounding Persian

- Write as a Persian copywriter of that niche would speak to the reader, not as a translation.
- Short sentences, active voice. Avoid heavy Arabic-origin formal vocabulary where an everyday word works.
- Avoid filler openers ("امروزه با پیشرفت تکنولوژی…", "در دنیای پرشتاب امروز…").
- Do not use "بهترین", "اولین", "تضمینی", "۱۰۰٪", "معجزه‌آسا", "بدون ریسک" unless the brief supplies proof
  and the project allows it.
- Keep the second-person address the brief or brand uses (شما) throughout.

## 8. Quick checks

```bash
# Arabic letters that should be Persian (must print nothing)
grep -nP '[\x{064A}\x{0643}]' page.html
# ZWNJ count (policy none: must be 0)
grep -oP '\x{200C}' page.html | wc -l
# hyphenated phones (must print nothing)
grep -nE '[0-9]{3,4}-[0-9]{3}-[0-9]{4}' page.html
```

The shared QA script runs these and more (`scripts/seo_qa.py`).

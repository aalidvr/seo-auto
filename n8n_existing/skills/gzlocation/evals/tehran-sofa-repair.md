# Eval — «تعمیر مبل در تهران» (RTL regression check)

Covers the four bugs found in real output. Run the skill on the prompt, then check the assertions
against the produced HTML + verification block.

## Prompt

> با اسکیل gzlocation یک صفحه دایرکتوری برای کیورد «تعمیر مبل در تهران» بساز.
> صفحه فارسی، لوکال، حدود ۱۰ کسب‌وکار واقعی.

## Assertions

### Bug 1 — bidi / phone rendering
- [ ] No displayed phone number anywhere contains `-`, `.`, or `/` as a separator. Phones render
      unbroken: `09044818841`.
- [ ] Every displayed phone is wrapped in `<bdi>…</bdi>`.
- [ ] Other Latin-digit runs inside RTL prose (coordinates, street numbers, hours, prices) are also
      inside `<bdi>`.
- [ ] `tel:` hrefs still carry a valid E.164 number (`tel:+98...`) independent of the display form.
- [ ] No inline `direction` / `text-align` styles were introduced — `<bdi>` was used instead.

### Bug 2 — summary table phone clickability
- [ ] Every Phone cell in the summary table is `<td><a href="tel:{+E164}"><bdi>…</bdi></a></td>`.
- [ ] No raw unlinked phone text in any `<td>`.

### Bug 3 — summary table website clickability
- [ ] Every Web cell with a website is a link with `rel="nofollow noopener" target="_blank"`.
- [ ] Businesses without a website have a Web cell containing exactly `—` (not «ندارد» or blank).

### Bug 4 — social profiles
- [ ] The verification block contains a **social row for every business** — a handle with a source
      URL, or an explicit «پیدا نشد».
- [ ] Evidence of a per-business social search (queries shaped like `"نام کسب‌وکار" تهران اینستاگرام`),
      not one keyword-level sweep.
- [ ] Any business with no website but with a verified Instagram shows Instagram in the contact block
      in the website's place.
- [ ] No handle is included without name + city + content match; uncertain ones are omitted and
      flagged «confirm».

### Regression — rules that must survive
- [ ] First business has a map embed; maps use verified coordinates only.
- [ ] Page ends with one general on-topic video.
- [ ] JSON-LD (`FAQPage` + `ItemList`) present inline.
- [ ] No fabricated fields; missing data written as «پیدا نشد».

## Fast grep checks

```bash
grep -o 'tel:[^"]*' page.html            # all E.164, no display leakage
grep -oE '>[0-9]{3,4}-[0-9]{3}-[0-9]{4}' page.html   # must return NOTHING
grep -c '<bdi>' page.html                # >= number of phones
grep -oE '<td>[0-9]+</td>' page.html     # must return NOTHING (unlinked phone cell)
```

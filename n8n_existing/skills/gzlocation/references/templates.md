# Templates — copy these and fill the {placeholders}

Keep markup clean: no wrapper, no CSS, no inline direction/text-align styles.
`<bdi>` is semantic, not a style — it stays. On RTL pages every Latin-digit run is wrapped in it, and
phones are unbroken (`09044818841`), never hyphenated.
Localize all visible labels (Phone/Web/Email/Location, etc.) to the page language.

## Summary table (top of page)

Phone and Web cells are live links here too — the table is the first thing a mobile reader sees.

```html
<table>
  <thead>
    <tr>
      <th>{Name}</th><th>{Type}</th><th>{Coverage}</th><th>{Phone}</th><th>{Web}</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>{name}</td>
      <td>{type}</td>
      <td>{coverage}</td>
      <td><a href="tel:{+E164}"><bdi>{unbroken phone}</bdi></a></td>
      <td><a href="{https://site}" rel="nofollow noopener" target="_blank">{domain}</a></td>
      <!-- no website → the cell is exactly: — -->
    </tr>
    <!-- one row per business, in final (anti-saturation) order -->
  </tbody>
</table>
```

## Per-business block

Order: name → own video (if official) → prose → contact list → map (per rule).

```html
<h3>{N}. {Name}</h3>

<!-- Own official video ONLY if the channel is verified as theirs; otherwise omit this figure -->
<figure>
  <iframe width="100%" height="360" src="https://www.youtube.com/embed/{VIDEO_ID}"
    title="{Name}" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>

<p>{Natural-prose description: weave in type, coverage and specialty. NOT "Label: value".}</p>

<ul>
  <li><strong>{Phone}:</strong> <a href="tel:{+E164}"><bdi>{unbroken phone}</bdi></a></li>
  <li><strong>{Web}:</strong> <a href="{https://site}" rel="nofollow noopener" target="_blank">{domain}</a></li>
  <!-- Social is a first-class contact field in Iran / Middle East / LatAm. No website but has
       Instagram → Instagram takes the website's slot. Handle only if name + city + content match. -->
  <li><strong>{Instagram}:</strong> <a href="https://www.instagram.com/{handle}/" rel="nofollow noopener" target="_blank">{handle}@</a></li>
  <li><strong>{Email}:</strong> <a href="mailto:{email}">{email}</a></li>
  <li><strong>{Location}:</strong> {city / address}</li>
</ul>

<!-- Map: local page = all businesses; national page = only verified physical locations; FIRST business always -->
<figure>
  <iframe src="https://www.google.com/maps?q={LAT},{LNG}&hl={lang}&z=16&output=embed"
    width="100%" height="320" style="border:0;" loading="lazy"
    referrerpolicy="no-referrer-when-downgrade" title="{Name}"></iframe>
</figure>
```

## General on-topic video (end of page, always present)

```html
<figure>
  <iframe width="100%" height="360" src="https://www.youtube.com/embed/{VIDEO_ID}"
    title="{on-topic title}" frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</figure>
```

## JSON-LD (inline at the very end)

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "{Q}", "acceptedAnswer": { "@type": "Answer", "text": "{A}" } }
      ]
    },
    {
      "@type": "ItemList",
      "name": "{list title}",
      "itemListElement": [
        { "@type": "ListItem", "position": 1,
          "item": { "@type": "Organization", "name": "{name}", "url": "{site}", "telephone": "{+E164}" } }
      ]
    }
  ]
}
</script>
```

## Verification block (for the user, NOT published)

```
VERIFICACIÓN (chequeo ~30 s — no se publica)
1. {Name} — Tel {phone} [fuente: {URL}] · Web {domain} [oficial] · Email {email} [fuente: {URL}] · {address} [Places]
   - social: {@handle or "no encontrado"} [fuente: {URL}]   ← required row, every business
   - confirmar: {anything from a 3rd-party directory, or a handle whose ownership is uncertain}
...
No encontrado: {business} → {field}
Correcciones del brief: {e.g. dB 39–46 → 33/37 verificado}
```

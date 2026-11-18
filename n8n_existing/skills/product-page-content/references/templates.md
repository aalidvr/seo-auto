# Templates — product page snippets

Semantic HTML, no scripts, no inline direction styles, `<bdi>` around Latin runs on RTL pages.
Drop any block without real data. Localise labels.

## Contents
1. SEO comment block · 2. Hero and short description · 3. Key facts box · 4. Benefit cards ·
5. Specification table · 6. Fit-check · 7. Policies · 8. Reviews placeholder · 9. FAQ ·
10. Product + FAQPage JSON-LD

## 1. SEO comment block
```html
<!-- SEO FIELDS (CMS SEO section, not page body)
     Meta title:        {product name + decisive attribute, about 60 chars}
     Meta description:  {about 155 chars, benefit + soft CTA}
     Suggested handle:  {slug}
     Language/locale:   {fa-IR}
     SOURCES: {data sheet version/date} -->
```

## 2. Hero and short description
```html
<h1>{Product name} {decisive attribute}</h1>
<p>{40-80 words: what it is, who it is for, the main reason to buy. Keyword natural.}</p>
<!-- IMAGE: {what the main photo shows} -->
```

## 3. Key facts box
```html
<section data-box="key-facts">
  <ul>
    <li><strong>{Price}:</strong> <bdi>{display price as the shop shows it}</bdi> {currency word} {tax note}</li>
    <li><strong>{Availability}:</strong> {in stock | per sheet}</li>
    <li><strong>{Attribute}:</strong> {value} {unit}</li>
  </ul>
  <!-- WIDGET: variant selector / add to cart (theme) -->
</section>
```

## 4. Benefit cards (3-6)
```html
<h2>{Why this product}</h2>
<div class="benefit-card"><h3>{Benefit as an outcome}</h3><p>{25-60 words, tied to a spec from the sheet.}</p></div>
```

## 5. Specification table
```html
<h2>{Specifications}</h2>
<table>
  <thead><tr><th>{Attribute}</th><th>{Value}</th></tr></thead>
  <tbody>
    <tr><td>{Weight}</td><td><bdi>450</bdi> {g}</td></tr>
    <tr><td>{Material}</td><td>{value}</td></tr>
    <tr><td>{Missing fact}</td><td>[CONFIRM: attribute, from whom]</td></tr>
  </tbody>
</table>
```

## 6. Fit-check
```html
<h2>{Who it is for}</h2>
<ul>
  <li>{Good fit: concrete situation}</li>
  <li>{Not the right choice if: honest disqualifier from the data}</li>
</ul>
```

## 7. Policies (shop's own wording only)
```html
<h2>{Shipping, returns and warranty}</h2>
<ul>
  <li><strong>{Shipping}:</strong> {…}</li>
  <li><strong>{Returns}:</strong> {…}</li>
  <li><strong>{Warranty}:</strong> {length and issuer}</li>
</ul>
```

## 8. Reviews placeholder
```html
<!-- WIDGET: customer reviews (real, supplied by the shop; never written here) -->
```

## 9. FAQ
```html
<h2>{FAQ}</h2>
<h3>{Real pre-purchase question?}</h3>
<p>{Answer first, 30-70 words.}</p>
```

## 10. JSON-LD (mark optional if the CMS emits product schema)
```html
<!-- OPTIONAL SCHEMA: skip if the theme or plugin already outputs Product schema. Values mirror the visible page. -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "name": "{H1 product name}",
      "description": "{matches the short description}",
      "brand": { "@type": "Brand", "name": "{brand}" },
      "sku": "{only if in the sheet}",
      "image": ["{only supplied URLs}"],
      "offers": {
        "@type": "Offer",
        "url": "{product url}",
        "price": "{number, matches the visible price}",
        "priceCurrency": "{ISO code}",
        "availability": "https://schema.org/InStock"
      }
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
Add `aggregateRating` (`ratingValue`, `reviewCount`) only with a real rating and count that are visible on
the page. Add `gtin`/`mpn` only if given. Never add `review` items you did not receive.

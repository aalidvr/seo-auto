# Product data sheet (the `product_data` input)

The shop or the pipeline supplies this. The skill treats every value as class A (given). A missing field
is a gap, never a guess. Keep units with values.

```json
{
  "name": "Product name exactly as the shop writes it",
  "brand": "Brand",
  "model": "Model or series",
  "sku": "internal SKU",
  "mpn": null,
  "gtin": null,
  "category": "Category path",
  "url": "https://shop.example/product-url",
  "attributes": [
    { "name": "Weight", "value": "450", "unit": "g", "source": "manufacturer" },
    { "name": "Upper material", "value": "Waterproof fabric", "unit": null, "source": "label" }
  ],
  "variants": [
    { "name": "Size 42", "sku": "A-42", "price": "2450000", "availability": "InStock", "attributes": [] }
  ],
  "price": { "amount": "2450000", "currency": "IRR", "display": "2,450,000 Toman", "tax_note": "incl. VAT", "valid_until": null },
  "availability": "InStock",
  "shipping": "Shop's own wording",
  "returns": "Shop's own wording",
  "warranty": "Shop's own wording, issuer and length",
  "images": [ { "url": "https://shop.example/a.jpg", "shows": "side view on a rock path" } ],
  "manufacturer_description": "Raw supplier text (a source to rewrite, never to paste)",
  "reviews": { "average": null, "count": null, "items": [] },
  "persona": "Who buys it",
  "objections": ["fit", "durability"],
  "usp_from_client": [],
  "compliance": { "certifications": [], "label_text": null },
  "internal_links": []
}
```

Notes

- `price.currency` is the ISO code (`IRR`, `USD`, `EUR`); `display` is how the shop shows it (Toman vs
  Rial matters: never convert).
- `gtin`, `mpn`, `sku` appear in schema only when present here.
- `reviews` stays `null` unless the shop has real, visible reviews. The skill never writes them.
- Attribute `source` lets the page and the verification rows say where a spec came from.
- Flatten this file to plain text (`facts.txt`) for the QA script's number check.

#!/usr/bin/env python3
"""Shared QA checker for the SEO content skills (stdlib only).

Usage:
  python3 seo_qa.py page.html --type blog|product|advertorial|directory --keyword "{kw}" \
      --locale fa-IR --min 900 --max 1600 [options]

Common options:
  --banned "a|b"            pipe-separated regexes, case-insensitive (brief + synonyms)
  --required-links "anchor=>url|anchor=>url"   exact anchors that must exist
  --allowed-urls "url|url"  internal URLs the brief allows (any other internal link FAILs)
  --site-domain example.com used to tell internal from external links
  --source-text a.txt,b.txt fetched source text; quotes must appear verbatim in it
  --facts-file facts.txt    client facts (brief, product sheet); numbers and quotes are checked against it
  --zwnj-policy standard|none   Persian only (take from the project style_profile)
  --digits persian|latin|site   Persian digit policy
  --allow-superlatives      silence the "unproven superlative" warnings
  --json out.json           also write the result as JSON

Type options:
  blog:        --citation required|optional|none   --allow-no-h1
  product:     --no-policy-sections
  advertorial: --brand "Name" --max-links 3 --max-title 70
  directory:   --list-min 3

Exit code 1 if any FAIL. WARN means a human or the next pass should look.
"""
import argparse, json, re, sys
from html.parser import HTMLParser

VOID = {"br", "img", "hr", "meta", "link", "input", "source", "wbr", "area", "col", "embed", "param", "track"}
FA_DIG = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
RTL = {"fa", "ar", "he", "ur"}
GENERIC_ANCHORS = {"click here", "here", "read more", "learn more", "link", "اینجا", "کلیک کنید", "بیشتر بخوانید",
                   "بیشتر بدانید", "ادامه مطلب", "لینک", "mehr erfahren", "aquí", "leer más"}
SUPERLATIVES = (r"\b(?:best|#1|number one|guaranteed|100%|miracle|cures?|risk[- ]free|world[- ]class|cheapest)\b"
                r"|بهترین|اولین|تضمین(?:ی)?|معجزه|بدون ریسک|ارزان‌?ترین|[۱1][۰0][۰0]\s?[٪%]|قطعا[ًْ]?|بی‌?نظیر")
DISCLOSURE = r"تبلیغ|رپورتاژ|حمایت[\s‌]?شده|sponsored|advertorial|paid partnership|anzeige|publicidad"
FAQ_HEAD = r"سوال|پرسش|faq|frequently|preguntas|häufig"
POLICY_HEAD = r"ارسال|مرجوع|گارانتی|ضمانت|shipping|return|warranty|delivery|refund|garantie|envío"


def n(s):
    return s.translate(FA_DIG)


def norm(s):
    s = n(s).replace("\u200c", "").replace("\u00a0", " ")
    s = s.replace("ي", "ی").replace("ك", "ک")
    s = re.sub(r"[«»“”„‹›\"'`´’‘…]", "", s)
    s = re.sub(r"<[^>]+>", " ", s)
    return " ".join(s.lower().split())


def words(s):
    return re.findall(r"\w+", n(s).lower())


class Doc(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.skip = [], 0
        self.chunks, self.chunks_nobdi = [], []
        self.nw = 0                      # visible words so far
        self.heads, self._h = [], None   # (level, text, pos)
        self.links, self._a = [], None   # dict(href, anchor, rel, target, in_bdi, pos)
        self.images, self.iframes = [], []
        self.tables = []                 # pos of each table
        self.events = []                 # ("table"|"p", pos)
        self.quotes, self._q = [], None  # (text, cite)
        self.jsonld, self._ld, self._buf = [], False, ""
        self.badscripts, self.handlers, self.styles = [], [], 0
        self.comments, self.classes = [], []
        self.cells, self._cell = [], None  # (text, has_link)
        self._p = None
        self.bdi = 0
        self.lang_dir_style = False

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        for k in a:
            if k.lower().startswith("on"):
                self.handlers.append(f"<{tag} {k}>")
        if "style" in a and re.search(r"direction|text-align", a["style"] or "", re.I) and tag != "iframe":
            self.lang_dir_style = True
        if a.get("class"):
            self.classes.append(a["class"])
        if tag in ("script", "style"):
            self.skip += 1
            if tag == "style":
                self.styles += 1
            if tag == "script":
                if a.get("type") == "application/ld+json":
                    self._ld, self._buf = True, ""
                else:
                    self.badscripts.append(a.get("src", "inline"))
            return
        if tag in VOID:
            if tag == "img":
                self.images.append((a.get("src", ""), a.get("alt")))
            return
        self.stack.append(tag)
        if tag == "bdi":
            self.bdi += 1
        if re.fullmatch(r"h[1-6]", tag):
            self._h = [int(tag[1]), "", self.nw]
        if tag == "a":
            self._a = {"href": a.get("href", "") or "", "anchor": "", "rel": a.get("rel", "") or "",
                       "target": a.get("target", "") or "", "in_bdi": False, "pos": self.nw}
            if self._cell is not None:
                self._cell[1] = True
        if tag == "iframe":
            self.iframes.append({"src": a.get("src", ""), "pos": self.nw, "title": a.get("title", "")})
        if tag == "table":
            self.tables.append(self.nw)
            self.events.append(("table", self.nw))
        if tag == "blockquote":
            self._q = [a.get("cite", ""), ""]
        if tag in ("td", "th"):
            self._cell = [ "", False]
        if tag == "p":
            self._p = ""

    def handle_endtag(self, tag):
        if tag in ("script", "style"):
            self.skip = max(0, self.skip - 1)
            if self._ld:
                self.jsonld.append(self._buf)
                self._ld = False
            return
        if tag in VOID:
            return
        if tag == "bdi":
            self.bdi = max(0, self.bdi - 1)
        if self._h and tag == f"h{self._h[0]}":
            self.heads.append((self._h[0], " ".join(self._h[1].split()), self._h[2]))
            self._h = None
        if tag == "a" and self._a:
            self._a["anchor"] = " ".join(self._a["anchor"].split())
            self.links.append(self._a)
            self._a = None
        if tag == "blockquote" and self._q:
            self.quotes.append((" ".join(self._q[1].split()), self._q[0]))
            self._q = None
        if tag in ("td", "th") and self._cell:
            self.cells.append((" ".join(self._cell[0].split()), self._cell[1], tag))
            self._cell = None
        if tag == "p" and self._p is not None:
            if len(self._p.split()) >= 8:
                self.events.append(("p", self.nw))
            self._p = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i] == tag:
                del self.stack[i:]
                break
        self.chunks.append(" ")
        self.chunks_nobdi.append(" ")

    def handle_data(self, d):
        if self.skip:
            if self._ld:
                self._buf += d
            return
        self.chunks.append(d)
        if self.bdi == 0:
            self.chunks_nobdi.append(d)
        k = len(d.split())
        self.nw += k
        if self._h is not None:
            self._h[1] += d
        if self._a is not None:
            self._a["anchor"] += d
            if self.bdi:
                self._a["in_bdi"] = True
        if self._q is not None:
            self._q[1] += d
        if self._cell is not None:
            self._cell[0] += d
        if self._p is not None:
            self._p += d

    def handle_comment(self, d):
        self.comments.append(d)


def shared_runs(a_text, b_text, N=8):
    A, B = words(a_text), words(b_text)
    sh = {tuple(B[i:i + N]) for i in range(len(B) - N + 1)}
    hit = [False] * len(A)
    for i in range(len(A) - N + 1):
        if tuple(A[i:i + N]) in sh:
            for j in range(i, i + N):
                hit[j] = True
    runs, i = [], 0
    while i < len(A):
        if hit[i]:
            j = i
            while j < len(A) and hit[j]:
                j += 1
            runs.append((i, j, " ".join(A[i:min(j, i + 12)])))
            i = j
        else:
            i += 1
    return runs


def read(path):
    return open(path, encoding="utf-8").read()


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("file")
    ap.add_argument("--type", required=True, choices=["blog", "product", "advertorial", "directory"])
    ap.add_argument("--keyword", default="")
    ap.add_argument("--locale", default="")
    ap.add_argument("--min", type=int, default=0)
    ap.add_argument("--max", type=int, default=0)
    ap.add_argument("--banned", default="")
    ap.add_argument("--required-links", default="")
    ap.add_argument("--allowed-urls", default="")
    ap.add_argument("--site-domain", default="")
    ap.add_argument("--source-text", default="")
    ap.add_argument("--facts-file", default="")
    ap.add_argument("--zwnj-policy", choices=["standard", "none"], default="standard")
    ap.add_argument("--digits", choices=["persian", "latin", "site"], default="site")
    ap.add_argument("--allow-superlatives", action="store_true")
    ap.add_argument("--no-emdash", action="store_true")
    ap.add_argument("--max-quote-words", type=int, default=15)
    ap.add_argument("--json", default="")
    ap.add_argument("--citation", choices=["required", "optional", "none"], default="required")
    ap.add_argument("--allow-no-h1", action="store_true")
    ap.add_argument("--no-policy-sections", action="store_true")
    ap.add_argument("--allow-review-schema", action="store_true")
    ap.add_argument("--brand", default="")
    ap.add_argument("--max-links", type=int, default=3)
    ap.add_argument("--max-title", type=int, default=70)
    ap.add_argument("--list-min", type=int, default=3)
    a = ap.parse_args()

    raw = read(a.file)
    d = Doc()
    d.feed(raw)
    d.close()
    vis = " ".join("".join(d.chunks).split())
    vis_nobdi = " ".join("".join(d.chunks_nobdi).split())
    nwords = len(vis.split())
    lang = a.locale.lower().split("-")[0]
    is_rtl = lang in RTL
    fails, warns, info = [], [], []
    F = lambda m: fails.append(m)
    W = lambda m: warns.append(m)
    I = lambda m: info.append(m)

    source_text = " ".join(read(p) for p in a.source_text.split(",") if p.strip()) if a.source_text else ""
    facts = read(a.facts_file) if a.facts_file else ""

    # ---------- meta block ----------
    mt = re.search(r"Meta title:\s*(.+?)\s*(?:-->|\n|$)", raw)
    md = re.search(r"Meta description:\s*(.+?)\s*(?:-->|\n|$)", raw)
    if mt:
        I(f"Meta title ({len(mt.group(1))} chars): {mt.group(1)}")
        if len(mt.group(1)) > 60:
            W(f"Meta title {len(mt.group(1))} chars (> ~60 may truncate)")
    else:
        W("No 'Meta title:' line in the top comment")
    if md:
        I(f"Meta description ({len(md.group(1))} chars)")
        if len(md.group(1)) > 160:
            W(f"Meta description {len(md.group(1))} chars (> ~160 may truncate)")
    else:
        W("No 'Meta description:' line in the top comment")

    # ---------- size ----------
    I(f"Visible words: {nwords}" + (f" (target {a.min}-{a.max})" if a.max else ""))
    if a.max and not (a.min <= nwords <= a.max):
        F(f"Word count {nwords} outside {a.min}-{a.max}")

    # ---------- headings ----------
    h1 = [h for h in d.heads if h[0] == 1]
    if len(h1) > 1 or (len(h1) == 0 and not a.allow_no_h1):
        F(f"{len(h1)} H1 tags (need exactly 1{', or 0 when the CMS renders the title' if a.allow_no_h1 else ''})")
    prev = 0
    for lvl, txt, _ in d.heads:
        if prev and lvl > prev + 1:
            F(f"Skipped heading level before H{lvl}: {txt}")
        prev = lvl
    I("Outline: " + " | ".join(f"H{l}:{t}" for l, t, _ in d.heads))

    # ---------- keyword ----------
    if a.keyword:
        kw = norm(a.keyword)
        nv = norm(vis)
        exact = nv.count(kw)
        first = " ".join(nv.split()[:100])
        loose = re.compile(r"\W+(?:\w+\W+){0,2}".join(map(re.escape, kw.split())))
        in_h1 = bool(h1) and (kw in norm(h1[0][1]) or bool(loose.search(norm(h1[0][1]))))
        I(f"Keyword '{a.keyword}': {exact}x exact, {len(loose.findall(nv))}x loose; in first 100 words: "
          f"{bool(loose.search(first))}; in H1: {in_h1}")
        if exact == 0 and not loose.search(nv):
            W("Keyword never appears in the visible text (fine only if a natural variant is used)")
        if h1 and not in_h1:
            W("Keyword not in the H1 (check the brief's H1 first)")
        if nwords and exact * len(kw.split()) / nwords * 100 > 3:
            W("Keyword density above 3%: looks stuffed")

    # ---------- banned / punctuation / superlatives ----------
    for ph in [b for b in a.banned.split("|") if b.strip()]:
        hits = re.findall(ph, vis, flags=re.I)
        if hits:
            F(f"Banned claim '{ph}' found {len(hits)}x")
    if a.no_emdash and re.search("[—–]", vis):
        F("Em/en dash in visible text but the style forbids it")
    if not a.allow_superlatives:
        scan = norm(vis)
        if a.keyword:
            scan = scan.replace(norm(a.keyword), " ")
        sup = sorted({m.group(0) for m in re.finditer(SUPERLATIVES, scan, flags=re.I)})
        if sup:
            W("Unproven superlative/guarantee words (need proof in the brief or remove): " + ", ".join(sup))

    # ---------- fabricated-signal heuristics ----------
    exp = re.findall(r"(?:in (?:my|our) \d+ years|i(?:'ve| have) (?:worked|been)|we(?:'ve| have) helped \d+|"
                     r"(?:با|در|طی)\s+[\d۰-۹]+\s+سال(?:\s+تجربه)?|من\s+(?:سال‌ها|[\d۰-۹]+ سال))", n(vis), flags=re.I)
    if exp:
        W(f"Experience or track-record claim ({len(exp)}x, e.g. '{exp[0]}'): must come from the brief, else remove")
    stats = re.findall(r"[\d۰-۹]+(?:[.,٫][\d۰-۹]+)?\s?(?:%|٪|درصد|percent)", vis)
    if stats:
        unknown = [s for s in set(stats) if not (facts and n(s).split()[0].rstrip('%٪') in n(facts))]
        if unknown:
            W("Statistic(s) not found in the facts file; confirm a source: " + ", ".join(sorted(unknown)[:8]))

    if facts:
        mask = re.sub(r"(?:\+?98|0)?9\d{9}|\d{10,}", " ", n(vis))
        numtok = lambda s: {re.sub(r"[,٬]", "", t) for t in re.findall(r"\d[\d,٬]*(?:[.٫]\d+)?", n(s))}
        page_nums, fact_nums = numtok(mask), numtok(facts)
        extra = sorted(t for t in page_nums - fact_nums if not (t.isdigit() and int(t) <= 10))
        if extra:
            W("Numbers on the page that are not in the facts file (verify each): " + ", ".join(extra[:15]))

    # ---------- links ----------
    ext_ok = a.site_domain.lower()
    allowed = {u.strip().rstrip("/") for u in a.allowed_urls.split("|") if u.strip()}
    pairs = [x for x in a.required_links.split("|") if "=>" in x]
    for p in pairs:
        _, h = [s.strip() for s in p.split("=>", 1)]
        if h:
            allowed.add(h.rstrip("/"))
    internal, external = [], []
    for l in d.links:
        h = l["href"]
        if h.startswith(("tel:", "mailto:", "#", "https://wa.me", "https://t.me")):
            if h.startswith("tel:") and not re.fullmatch(r"tel:\+\d{8,15}", h):
                F(f"tel: link not in E.164: {h}")
            continue
        if h.lower().startswith("javascript:"):
            F(f"javascript: link: {h[:40]}")
        if not h or h == "#":
            W(f"Empty link target for anchor [{l['anchor']}]")
            continue
        is_int = h.startswith("/") or (ext_ok and ext_ok in h.lower())
        (internal if is_int else external).append(l)
        if norm(l["anchor"]) in {norm(g) for g in GENERIC_ANCHORS}:
            F(f"Generic anchor text [{l['anchor']}] -> {h}")
        if "VERIFY" in h.upper():
            W(f"Link needs a real URL: [{l['anchor']}]")
    for l in internal:
        if allowed and l["href"].rstrip("/") not in allowed:
            F(f"Internal link not in the brief's allowed set: [{l['anchor']}] -> {l['href']}")
    for p in pairs:
        anc, h = [s.strip() for s in p.split("=>", 1)]
        if not any(norm(l["anchor"]) == norm(anc) and (not h or l["href"].rstrip("/") == h.rstrip("/")) for l in d.links):
            F(f"Required link missing or anchor not exact: [{anc}] -> {h}")
    for l in external:
        if l["target"] == "_blank" and "noopener" not in l["rel"]:
            W(f"target=_blank without rel=noopener: {l['href'][:60]}")
    I(f"Links: {len(internal)} internal, {len(external)} external")

    # ---------- HTML hygiene ----------
    if d.badscripts:
        F(f"Non-JSON-LD <script> in the body: {d.badscripts[:3]}")
    if d.handlers:
        F(f"Inline event handlers: {d.handlers[:3]}")
    if d.styles and not any("preview" in c for c in d.classes):
        W("<style> block present (allowed only as a preview-only style)")
    for fr in d.iframes:
        s = fr["src"]
        ok = (a.type == "directory" and re.match(r"https://(www\.youtube(?:-nocookie)?\.com/embed/|www\.google\.com/maps)", s))
        if not ok:
            F(f"iframe not allowed here: {s[:70]}")
    for src, alt in d.images:
        if alt is None:
            F(f"<img> without alt: {src[:60]}")

    # ---------- JSON-LD ----------
    graph = []
    for blk in d.jsonld:
        try:
            data = json.loads(blk)
        except Exception as e:
            F(f"Invalid JSON-LD: {e}")
            continue
        graph.extend(data.get("@graph", [data]) if isinstance(data, dict) else data)
    types = [g.get("@type") for g in graph]
    I(f"JSON-LD types: {types}")
    nvis = norm(vis)
    for g in graph:
        t = g.get("@type")
        if t == "FAQPage":
            for q in g.get("mainEntity", []):
                qq, aa = q.get("name", ""), q.get("acceptedAnswer", {}).get("text", "")
                if norm(qq) not in nvis:
                    F(f"FAQ schema question not in visible text: {qq[:60]}")
                if norm(aa) not in nvis:
                    F(f"FAQ schema answer not verbatim in visible text: {qq[:50]}")
        if t in ("Review",) and not a.allow_review_schema:
            F("Review schema present: only allowed with real, visible reviews (--allow-review-schema)")
        if "aggregateRating" in g or t == "AggregateRating":
            ar = g.get("aggregateRating", g)
            cnt = str(ar.get("reviewCount", ar.get("ratingCount", "")))
            if not cnt or n(cnt) not in n(vis):
                F("AggregateRating in schema but the rating count is not visible on the page")
            if a.type in ("directory", "advertorial", "blog"):
                F("AggregateRating is not allowed on this page type")
        offers = g.get("offers")
        if offers:
            for o in (offers if isinstance(offers, list) else [offers]):
                price = str(o.get("price", o.get("priceSpecification", {}).get("price", "")))
                if price:
                    pv = re.sub(r"[,٬]", "", n(vis))
                    if re.sub(r"[,٬]", "", n(price)) not in pv:
                        F(f"Schema price {price} is not visible on the page")
    if a.type == "product" and "Product" not in types:
        W("No Product JSON-LD (fine only if the CMS/theme outputs it)")
    if a.type in ("blog", "product") and "FAQPage" not in types and re.search(FAQ_HEAD, " ".join(h[1] for h in d.heads), re.I):
        W("FAQ section present but no FAQPage JSON-LD")

    # ---------- quotes (verbatim) ----------
    min_q = 4
    def check_quote(q, label):
        qn = norm(re.sub(r"^\W*…|…\W*$", "", q))
        qw = len(qn.split())
        if qw > a.max_quote_words and label == "citation":
            F(f"Quote is {qw} words (max {a.max_quote_words}): {q[:50]}")
        if source_text:
            if qn not in norm(source_text):
                F(f"{label} text not found verbatim in the source text: {q[:60]}")
        elif facts and label == "quote":
            if qn not in norm(facts):
                F(f"Quote not found in the facts file (quotes must be supplied by the client): {q[:60]}")
    if a.type in ("blog",):
        if a.citation == "required" and len(d.quotes) != 1:
            F(f"{len(d.quotes)} blockquote citation(s); the blog skill needs exactly 1 verbatim citation")
        if len(d.quotes) > 1:
            F("More than one blockquote: one verbatim quote per article")
        for q, cite in d.quotes:
            check_quote(q, "citation")
            if not cite or not any(l["href"] == cite for l in d.links):
                F("Citation blockquote needs a cite URL that is also linked as the attribution")
            if not source_text:
                W("Citation not machine-checked (no --source-text): verify word for word")
    elif a.type == "advertorial":
        seen_q = set()
        for q, _ in d.quotes:
            seen_q.add(norm(q))
            check_quote(q, "quote")
        for m in re.findall(r"[«“\"]([^»”\"]{" + str(min_q * 4) + r",})[»”\"]", vis):
            if norm(m) not in seen_q:
                check_quote(m, "quote")
        if (d.quotes or re.search(r"[«“]", vis)) and not facts:
            W("Quotes present but no --facts-file to prove the client supplied them")
    else:
        if d.quotes:
            for q, _ in d.quotes:
                check_quote(q, "citation")
    # Persian typographic quotes in blog are fine; skip.

    # ---------- Persian / RTL ----------
    if lang == "fa":
        raw_vis = "".join(d.chunks)
        zw = raw.count("\u200c")
        I(f"ZWNJ policy {a.zwnj_policy}: {zw} ZWNJ characters")
        if a.zwnj_policy == "none" and zw:
            F(f"{zw} ZWNJ characters but the project policy is 'none'")
        if a.zwnj_policy == "standard":
            det = re.findall(r"(?<![\w\u200c])می [\u0600-\u06ff]{2,}", vis)
            if det:
                W(f"Detached verb prefix ({len(det)}x, e.g. '{det[0]}'): use the half-space under policy 'standard'")
            det2 = re.findall(r"[\u0600-\u06ff]{2,} ها(?![\u0600-\u06ff])", vis)
            if det2:
                W(f"Detached plural suffix ({len(det2)}x, e.g. '{det2[0]}')")
        if re.search("[يك]", vis):
            F("Arabic-form letters ي/ك in visible text; use ی/ک")
        if re.search(r"  +", re.sub(r"<[^>]+>", " ", raw_vis)) and False:
            pass
    if is_rtl:
        if d.lang_dir_style:
            F("Inline direction/text-align style on an RTL page; the theme controls direction")
        if re.search(r"\b0\d{2,3}[-./ ]\d{3,4}[-./ ]\d{3,4}\b", n(vis)) or re.search(r"\d{3,4}-\d{3}-\d{4}", n(vis)):
            F("Hyphen/space-grouped phone number on an RTL page (bidi reorders it): show digits unbroken")
        for l in d.links:
            if l["href"].startswith("tel:") and not l["in_bdi"]:
                F(f"Phone link not wrapped in <bdi>: {l['href']}")
        latin = re.findall(r"[A-Za-z0-9][A-Za-z0-9._@:/-]{1,}", vis_nobdi)
        latin = [t for t in latin if not t.startswith("http") and not re.fullmatch(r"[\w.-]+\.[a-z]{2,}|[\w.+-]+@[\w.-]+", t, re.I)]
        if latin:
            W(f"{len(latin)} Latin run(s) in RTL text outside <bdi> (e.g. {', '.join(latin[:5])})")
        if a.digits in ("persian", "latin"):
            has_p, has_l = bool(re.search("[۰-۹]", vis)), bool(re.search("[0-9]", vis_nobdi))
            if a.digits == "persian" and has_l:
                W("Latin digits in Persian text outside <bdi> while the digit policy is 'persian'")
            if a.digits == "latin" and has_p:
                W("Persian digits present while the digit policy is 'latin'")
        elif re.search("[۰-۹]", vis) and re.search("[0-9]", vis_nobdi):
            W("Mixed Persian and Latin digits outside <bdi>")

    # ---------- type-specific ----------
    if a.type == "blog":
        first_tab = d.tables[0] if d.tables else None
        first_h2 = next((h[2] for h in d.heads if h[0] == 2), None)
        if first_tab is None:
            W("No table: answer-first needs an at-a-glance table or summary box before the first H2")
        elif first_tab > 220 or (first_h2 is not None and first_tab > first_h2):
            W("The at-a-glance table is not in the opening (answer-first)")
        evs = [e[0] for e in d.events]
        for x, y in zip(evs, evs[1:]):
            if x == y == "table":
                W("Two tables back to back without prose between them")
                break
        I(f"Tables: {len(d.tables)}")
        if any(re.search(r"\bcomment\b", c) for c in d.classes) or re.search(
                r"from our readers|نظرات کاربران|دیدگاه خوانندگان|reader comments", " ".join(h[1] for h in d.heads), re.I):
            F("Reader-comment block found. Fabricated comments are not allowed; use reader_scenarios or real comments")
        if not re.search(FAQ_HEAD, " ".join(h[1] for h in d.heads), re.I):
            W("No FAQ heading found")
    if a.type == "product":
        if not d.tables:
            W("No specification table")
        if not a.no_policy_sections and not re.search(POLICY_HEAD, " ".join(h[1] for h in d.heads), re.I):
            W("No shipping/returns/warranty heading (add the sections the product data supports)")
        if source_text:
            runs = shared_runs(vis, source_text)
            if runs:
                W(f"{len(runs)} stretch(es) of 8+ identical words copied from the manufacturer/source text, e.g. "
                  f"'{runs[0][2]}'. Rewrite them")
        for g in graph:
            if g.get("@type") == "Product" and h1 and norm(str(g.get("name", ""))) not in norm(h1[0][1]) \
                    and norm(h1[0][1]) not in norm(str(g.get("name", ""))):
                W("Product schema name differs from the H1")
    if a.type == "advertorial":
        if h1 and len(h1[0][1]) > a.max_title:
            W(f"Headline {len(h1[0][1])} chars (> {a.max_title})")
        total_links = len(internal) + len(external)
        if total_links > a.max_links:
            F(f"{total_links} links; the publisher profile allows {a.max_links}")
        if total_links == 0:
            W("No links at all: check the publisher profile and the link plan")
        for l in internal + external:
            if "sponsored" not in l["rel"] and "nofollow" not in l["rel"]:
                W(f"Link without rel=sponsored/nofollow (paid placements need it; the publisher may add it): {l['href'][:50]}")
                break
        kwn = norm(a.keyword)
        exact_anchors = [l for l in d.links if kwn and norm(l["anchor"]) == kwn]
        if len(exact_anchors) > 1:
            W("More than one exact-match keyword anchor (unnatural link profile)")
        if len({norm(l["anchor"]) for l in d.links}) == 1 and len(d.links) > 1:
            W("All anchors identical")
        if not re.search(DISCLOSURE, vis + " ".join(d.comments), re.I):
            W("No sponsored/advertorial disclosure label found (the publisher usually adds one; confirm)")
        if a.brand:
            c = norm(vis).count(norm(a.brand))
            I(f"Brand mentions: {c}")
            if c == 0:
                F("Brand never mentioned")
            elif nwords and c / nwords * 100 > 1.2:
                W(f"Brand named {c}x in {nwords} words: reads as an ad; vary or cut")
        if not any(h[0] == 2 for h in d.heads) and nwords > 500:
            W("No H2 in a long advertorial")
    if a.type == "directory":
        h3 = [h for h in d.heads if h[0] == 3]
        I(f"Business entries (H3): {len(h3)}")
        if len(h3) < a.list_min:
            W(f"Only {len(h3)} business entries (min {a.list_min}); fewer is fine only if fewer real ones exist")
        if not d.tables or (h3 and d.tables[0] > h3[0][2]):
            F("Summary table must open the page, before the first business")
        phone_like = re.compile(r"^[+\d۰-۹][\d۰-۹\s+-]{7,}$")
        for txt, has_link, tag in d.cells:
            if tag == "td" and phone_like.match(txt) and not has_link:
                F(f"Unlinked phone number in a table cell: {txt}")
            if tag == "td" and norm(txt) in {"ندارد", "no tiene", "none", "n/a", "-", "–", "ندارد."}:
                F(f"Web cell with no website must be exactly '—', found '{txt}'")
        maps = [f for f in d.iframes if "google.com/maps" in f["src"]]
        for f in maps:
            if not re.search(r"q=-?\d{1,3}\.\d+,-?\d{1,3}\.\d+", f["src"]) or "output=embed" not in f["src"]:
                F(f"Map iframe without verified coordinates / output=embed: {f['src'][:70]}")
        if h3:
            first_map = next((f for f in maps if f["pos"] >= h3[0][2] and (len(h3) < 2 or f["pos"] <= h3[1][2])), None)
            if not first_map:
                F("The first business must have a map")
            yt = [f for f in d.iframes if "youtube" in f["src"]]
            if not yt or yt[-1]["pos"] < h3[-1][2]:
                W("No general on-topic video at the end of the page")
        for l in external:
            if "tel:" not in l["href"] and ("nofollow" not in l["rel"] or "noopener" not in l["rel"]):
                W(f"External business link without rel='nofollow noopener': {l['href'][:50]}")
                break
        il = [g for g in graph if g.get("@type") == "ItemList"]
        if not il:
            W("No ItemList JSON-LD")
        else:
            els = il[0].get("itemListElement", [])
            if [e.get("position") for e in els] != list(range(1, len(els) + 1)):
                F("ItemList positions are not sequential from 1")
            if h3 and len(els) != len(h3):
                W(f"ItemList has {len(els)} items but the page has {len(h3)} businesses")
        if "FAQPage" not in types:
            W("No FAQPage JSON-LD")

    # ---------- report ----------
    print("\n".join(info))
    print("\nWARNINGS:" if warns else "\nWARNINGS: none")
    for w in warns:
        print("  - " + w)
    print("FAILS:" if fails else "FAILS: none")
    for f in fails:
        print("  - " + f)
    if a.json:
        json.dump({"tool": "seo_qa.py", "type": a.type, "word_count": nwords, "fails": fails, "warnings": warns},
                  open(a.json, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()

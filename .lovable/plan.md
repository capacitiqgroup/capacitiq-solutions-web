## Capacitiq Day 2 — Security, Cart/Checkout, Blog, Portfolio, Reviews, SEO

Massive multi-priority scope. Admin panel is explicitly deferred. Below is the execution plan grouped by priority. I'll execute sequentially in one pass.

### Priority 0 — Security
1. **`/api/charge.js`** — already server-calculates totals from `itemIds` (verified). Add explicit guard to ignore any client-sent `amountInCents`. Confirm 400 on invalid IDs (already done).
2. **`/api/send-email.js`** — already has allowlist. Add: in-memory IP rate limit (5 req / 60s), strict `type` enum (`contact|spotter|pricing-guide|waitlist|career-application`).
3. **Submissions table** — migration: drop `anyone insert submissions` policy, replace with `false` (service-role only). Route all submissions through new `/api/submit.js` that validates `kind` enum, string lengths <10000, required fields, then inserts via service role.

### Priority 1 — Cart & Checkout
4. **CartProvider context** wrapping app (`src/lib/cart.tsx`) — replaces Zustand store; persists to `localStorage["capacitiq_cart"]`. Keep same API (`addItem`, `removeItem`, `clear`, `total`, `has`).
5. **Navbar** — add `ShoppingCart` icon with lime badge (count > 0), links `/templates/cart`.
6. **Templates page** — image + name link to `/templates/:id`. Add-to-cart button stays.
7. **New route `/templates/:templateId`** (`TemplateDetail.tsx`) — full preview, H1, category, prices, FREE badge, full description, lime Add to Cart, note, back link, SEO.
8. **Templates page loading flash fix** — render grid wrapper but no empty state until `loaded` flag flips.

### Priority 2 — Contact copy
9. Update Contact page two strings exactly as specified.

### Priority 3 — Instagram
10. Ripgrep & replace all instagram URLs → `https://www.instagram.com/capacitiq_za` (Navbar, Footer, emails).

### Priority 4 — Blog
11. Migration: `blog_posts` table + RLS (public read where status='published', admin all). Seed the long-form post.
12. Rewrite `/blog` page — header, filter tabs, featured card + 3-col grid, empty state only after fetch resolves, fetch from DB.
13. New route `/blog/:slug` (`BlogPost.tsx`) — full post render, parse short-line+blank-line as H2, DOMPurify, tags, CTA, back link, Article JSON-LD, SEO.

### Priority 5 — Admin panel
**SKIPPED per user instruction ("ignore the admin panel for now").**

### Priority 6 — Invoice PDF
14. `bun add pdfkit`. New `api/_invoice.js` builds A4 invoice per spec. `/api/charge.js` attaches `Capacitiq-Invoice-INV-XXXXXXXX.pdf` to customer delivery email via Resend `attachments`.

### Priority 7 — Reviews
15. Migration: `reviews` table + RLS (public read where is_visible, admin all). No seed.
16. **Home page** — add reviews section between FAQ and Ready-to-Start. Fetch is_visible=true, 6 limit, desktop 3-col, mobile horizontal scroll, Google G badge, lime stars, Read more toggle, avatar/initial, Leave Review + See All Reviews links, placeholder card when empty.
17. **Footer** — add Google 4.9 badge above Get a Free Consultation.

### Priority 8 — Review request email
18. Migration: `review_requests` table.
19. `/api/charge.js` — after successful order insert, insert review_request with `send_after = now() + 3 days`.
20. `/api/cron/send-reviews.js` — query unsent due rows, send Resend emails using spec HTML, mark sent.
21. `vercel.json` — add `crons` entry.

### Priority 9 — SEO & misc
22. Update SEO titles/descriptions on Blog, BlogPost, Portfolio, PortfolioDetail, SpotterPolicy, TemplateDetail.
23. **Portfolio** — migration: `portfolio_items` table + RLS, seed the confidential ecosystem item.
24. Rewrite `/portfolio` page — featured + 2-col grid, fetch DB, masonry feel, empty state.
25. New `/portfolio/:portfolioId` page — hero, sections from JSONB, bottom CTA, back link, SEO.
26. `public/llms.txt`, `public/robots.txt`, `public/sitemap.xml` (static fallback).
27. `api/sitemap.js` — dynamic with blog slugs + portfolio ids.
28. **Home page FAQPage JSON-LD** — add to head; **change** the "Do you create logos or video content?" answer to: "we do not create logos and video content as part of our graphic design pillar." Update the homepage FAQ accordion item to match.
29. **Remove all "Web Presence"** references (filters, copy, FAQ JSON-LD list — keep only the 8 listed Qs; web presence wasn't in them anyway). Search codebase.

### Technical details

- Cart provider migration: replace `useCart` zustand hook with identical-interface React context so existing call sites in Cart/Checkout/Templates work unchanged.
- DB enums: tighten submissions RLS by replacing INSERT policy with `WITH CHECK (false)`; all inserts go through service-role API.
- Rate limit: simple `Map<ip, number[]>` in-memory in send-email handler; acceptable since Vercel serverless instances are short-lived but spec just says reject >5/60s.
- PDF: pdfkit streamed to Buffer; attached as `{ filename, content: base64 }` per Resend API.
- Cron: requires Vercel Pro for daily crons but spec says add it.
- Push to GitHub: handled by Lovable automatically; no manual git commands.

### What I'm NOT doing
- Admin panel (Priority 5) — per user instruction.
- Any references to "Web Presence" — removed.

I'll execute everything top-to-bottom in one continuous run.

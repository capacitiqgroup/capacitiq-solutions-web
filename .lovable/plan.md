# Capacitiq Solutions — Phase 1 + 2 Build Plan

## Important context up front

- **Stack swap is destructive.** I'll tear out TanStack Start (root, routes, server.ts, start.ts, wrangler.jsonc, vite.config.ts) and replace with a plain Vite + React + React Router DOM SPA. The new project will be Vercel-deploy-ready (with `vercel.json` and `/api/*.js` serverless functions per spec).
- **Lovable Cloud, not the spec's Supabase project.** You picked Lovable Cloud, so the URL `rmtqjkjzfdkcuhrhuaiy.supabase.co` won't be used. Lovable Cloud provisions its own Supabase project; I'll wire env vars to that one. Migrations, RLS, and seed data run there.
- **Preview limitation:** Lovable's preview can't execute `/api/*.js` Vercel serverless functions — those only run after you deploy to Vercel. So in the Lovable preview, the **checkout/payment flow won't actually charge a card or send emails**. It'll work fully once deployed to Vercel with the env vars set. I can optionally mirror the `/api/charge` logic as a Lovable Cloud edge function for preview testing — say the word.
- **Secrets needed before Phase 2 checkout works in production:** `RESEND_API_KEY`, `VITE_YOCO_PUBLIC_KEY`, `YOCO_SECRET_KEY`. I'll request these via the secret tool when we get to checkout wiring.

## Phase 1 — Public site, design system, legal

### Stack reset
- Remove: `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`, `wrangler.jsonc`, TanStack-specific vite config.
- Install: `react-router-dom`, `lucide-react`, `@supabase/supabase-js` (already there via Cloud).
- New entry: `src/main.tsx` mounts `<BrowserRouter>` → `<App>` with `<Routes>` for all public routes.
- Add `vercel.json` rewrite rule per spec.
- Add Google Fonts (Ubuntu + Inter) and Yoco SDK `<script>` to `index.html`. Set `<html lang="en-ZA">`.

### Design system (`src/index.css`)
CSS custom properties for the neumorphic palette (`--surface`, `--primary`, `--accent`, `--shadow-dark`, `--shadow-light`, `--text-body`, `--text-muted`) plus reusable utility classes: `.neu-raised`, `.neu-inset`, `.btn-cta`, `.btn-ghost`, font-family rules. Tailwind config extends with these tokens so components reference `bg-surface`, `text-primary`, etc. — no raw hex in components.

### Shared shell
- `<Navbar>` — floating neumorphic pill, logo + Solutions link, desktop nav (Home, Services, Templates, Portfolio, Blog, Careers, Company, Contact), Spotter link + Work With Us CTA. Mobile hamburger drawer with body-scroll lock + route-change reset. Active page lime dot indicator.
- `<Footer>` — 5-column neumorphic card per spec (logo+tagline, contact, links, legal, socials with custom TikTok SVG), Free Consultation CTA, copyright line.
- `<SEO>` component — sets per-page `<title>`, meta, OG, Twitter, canonical, JSON-LD via `react-helmet-async`.

### Routes (Phase 1)
- `/` Home — hero with 3 feature cards, then every section described in spec lines 433-680ish (problem/solution, 5-pillar services teaser, why-Capacitiq, process, testimonials placeholder, final CTA).
- `/services` — full 5-pillar breakdown.
- `/company` — about / philosophy.
- `/careers` — pulls open careers from DB; shows Sales Spotter card (open), Client Acquisition (closed). JobPosting JSON-LD on page. Apply form posts to `submissions` table (`kind = 'career'`).
- `/contact` — contact form posts to `submissions` (`kind = 'contact'`).
- `/privacy-policy`, `/terms-of-service`, `/template-policy`, `/refund-policy`, `/cookie-policy` — each uses the FALLBACK_CONTENT pattern from spec (hardcoded text renders immediately, DB content overrides if present).

### Database (Lovable Cloud migration)
All tables from spec lines 91-170: `profiles`, `user_roles`, `templates`, `orders`, `submissions`, `careers`, `legal_pages`, `template_waitlist`. All RLS policies from lines 174-251. Column-level revoke on `templates.canva_link`. Seed two career rows.

## Phase 2 — Template shop + cart + checkout

### Routes
- `/templates` — grid of published templates from DB (excluding `canva_link`), category filters, price in ZAR (cents → rand), waitlist email form.
- `/templates/cart` — cart contents from `localStorage` cart store, qty controls, subtotal, Proceed to Checkout.
- `/templates/checkout` — 3-step flow (Information → Payment → Confirmation) exactly per spec:
  - Step 1: customer info + billing form, sticky order summary sidebar.
  - Step 2: Yoco SDK card tokenization → `POST /api/charge`. Card formatting helpers (4-digit groups, MM/YY mask). Error card with Try-again. Loading state disables button.
  - Step 3: success card with order ID and email confirmation copy.

### Serverless function
- `/api/charge.js` per spec lines 96-173: validates POST, calls Yoco charges API, on success inserts into `orders` table via Supabase service role, looks up each template's `canva_link`, emails the customer's link via Resend, sends internal notification to `hello@capacitiq.co.za`.

### Cart state
- `src/lib/cart.ts` — Zustand store backed by `localStorage`, exposes `addItem`, `removeItem`, `clear`, `total`.

## What's NOT in this build (Phase 3, later)
Admin login, admin layout/sidebar, dashboard, templates manager + waitlist tab, orders viewer, submissions viewer, careers manager, legal pages editor, publish-triggered waitlist email blast.

## Technical details

- React Router DOM v6 with `<BrowserRouter>`. Routes declared in `src/App.tsx`.
- Supabase client at `src/lib/supabase.ts` reads `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable Cloud names — the spec's `VITE_SUPABASE_ANON_KEY` will be aliased to the same value).
- Page background `#e8edf0` applied at `<body>` level so every route inherits.
- Form submissions write to `submissions` table with `kind` discriminator (`contact`, `career`, `spotter`, etc.).
- Lucide React for all icons. Custom inline SVG for TikTok.
- Logo: Cloudinary URL used directly in `<img>` tags.

## Open questions / risks

1. **Preview-vs-production gap on checkout:** confirm you're fine that the Yoco flow can only be end-to-end tested after Vercel deploy (or I add a Cloud edge function mirror — extra work).
2. **Spec mentions Paystack** in legal copy but checkout is Yoco-only. I'll keep the legal text references to both as written (it's accurate language for the policy even if Paystack isn't wired).
3. **Spec's Supabase URL is ignored** since you chose Lovable Cloud — the env will point at Lovable's auto-provisioned project. When you deploy to Vercel, set the Vercel env vars to the Lovable Cloud values (visible in the Cloud panel).

Reply "go" to start Phase 1, or tell me what to adjust.
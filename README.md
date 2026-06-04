# BehindTheCode

A polished, open-source, single-publisher video platform — think a Netflix-clean
brand channel rather than a community site. Built with Next.js 16 (Cache
Components), Mux, Supabase (Postgres + Auth + Storage), a minimal monochrome
shadcn-style UI, Tiptap authoring, and optional Stripe monetization.

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpontusab%2Fbehindthecode&root-directory=apps%2Fweb&project-name=behindthecode&repository-name=behindthecode&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,SUPABASE_SECRET_KEY,MUX_TOKEN_ID,MUX_TOKEN_SECRET,MUX_WEBHOOK_SECRET,NEXT_PUBLIC_APP_URL,CRON_SECRET&envDescription=Core%20Supabase%20%2B%20Mux%20credentials%20required%20to%20boot.%20Optional%20OAuth%2C%20AI%20moderation%20and%20Stripe%20vars%20can%20be%20added%20later.&envLink=https%3A%2F%2Fgithub.com%2Fpontusab%2Fbehindthecode%2Fblob%2Fmain%2F.env.example)

One click clones the repo, prompts for the **Core** environment variables, and
builds from `apps/web`. You still need a **Supabase project** (for the database
schema) and a **Mux account** first — see [Deploying](#deploying) for the full
checklist, including the Mux webhook, scheduled-publish cron, and optional
Stripe setup.

## Stack

- **Monorepo:** Turborepo + Bun workspaces
- **App:** Next.js 16 (App Router, `cacheComponents`, Turbopack), React 19.2
- **Video:** Mux (upload, playback, signed playback, captions, Mux Data)
- **Database:** Supabase Postgres (typed data layer, RLS, full-text search)
- **Auth:** Supabase Auth via `@supabase/ssr` (admins + viewers, roles in
  `app_metadata`, optional OAuth/magic link)
- **Storage:** Supabase Storage (thumbnails + branding buckets)
- **UI:** Tailwind v4 + shadcn-style components, custom theme, light/dark
- **Authoring:** Tiptap (→ Markdown) + MDX rendering
- **Monetization (optional):** Stripe subscriptions + one-time purchases
- **Hosting:** Vercel + Supabase

## Layout

```
apps/
  web/            # the single Next.js app (viewer + /admin)
packages/
  db/             # Supabase client, typed repositories, generated DB types
  mux/            # Mux client + helpers (upload, webhook, signed playback)
  ui/             # design system (theme, components, player, editor)
  config/         # shared tsconfig
supabase/
  migrations/     # schema, RLS, triggers, storage buckets, stats functions
```

## Getting started

```bash
bun install

# 1. Start a local Supabase stack (requires Docker)
supabase start
# Copy the printed API URL + anon/service_role keys into apps/web/.env.local
# (a ready-to-use .env.local pointing at the default local stack is included).

cp .env.example .env.local   # for non-local setups, fill in your project keys
bun run seed                 # creates the admin + demo content (optional)
bun run dev
```

The schema lives in `supabase/migrations`. Apply it locally with
`supabase db reset`, and regenerate the typed client with
`supabase gen types typescript --local > packages/db/src/database.types.ts`.

Open http://localhost:3000. The admin lives at `/admin`.

The **first account to sign up automatically becomes an admin**. After that,
manage roles from the admin Users page.

See [`.env.example`](./.env.example) for all environment variables. Only the
Core section is required; sign-in providers, AI moderation, and Stripe
monetization all auto-enable when their variables are present.

## Scripts

- `bun run dev` — start the dev server
- `bun run build` — production build
- `bun run typecheck` — type-check all workspaces
- `bun run seed` — seed admin + demo data
- `bun run seed:admin` — seed only the admin account

## Deploying

1. **Create a Supabase project** at https://supabase.com/dashboard, then push
   the schema with `supabase db push` (link first via `supabase link`). The
   migrations create all tables, RLS policies, triggers, and the
   `thumbnails` / `branding` storage buckets.
2. **Import the repo** into Vercel and set the **Root Directory** to `apps/web`.
   Turborepo handles the workspace build; the framework preset is Next.js.
3. **Add environment variables** from `.env.example` (Core required; the rest
   are opt-in). Use the new Supabase API keys: `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_...`),
   `SUPABASE_SECRET_KEY` (`sb_secret_...`), and `NEXT_PUBLIC_APP_URL` (your
   production URL). The legacy `anon` / `service_role` keys still work as a
   fallback. In the Supabase dashboard, add `https://<your-domain>/auth/callback`
   to the **Auth → URL Configuration** redirect allow-list.
4. **Mux webhook:** in the Mux dashboard add a webhook pointing at
   `https://<your-domain>/api/mux/webhook` and copy the signing secret into
   `MUX_WEBHOOK_SECRET`. This is what marks uploaded assets as ready.
5. **Scheduled publishing:** `apps/web/vercel.json` registers a cron that hits
   `/api/cron/publish` every 5 minutes. It's authorized with `CRON_SECRET`, so
   make sure that variable is set.
6. **Stripe (optional):** set `STRIPE_ENABLED=true` plus the Stripe keys, then
   add a webhook at `https://<your-domain>/api/stripe/webhook` for
   `checkout.session.completed` and `customer.subscription.*` events and copy
   its signing secret into `STRIPE_WEBHOOK_SECRET`. Create your subscription
   Prices in Stripe and register them under **Admin → Monetization**. Gated
   videos require Mux signed playback (`MUX_SIGNING_KEY_ID` /
   `MUX_SIGNING_PRIVATE_KEY`).

After the first deploy, run `bun run seed` against your production project (or
just sign up — the first account becomes an admin).

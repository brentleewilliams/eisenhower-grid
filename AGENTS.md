<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project context (Eisenhower Grid)

Clone of the core Eisenhower Matrix task tool (app.eisenhower.me). Next.js
App Router + TypeScript + Tailwind, deployed on Vercel (project
`eisenhower-grid` under the `brent12`/`brentleewilliams` Vercel account).

## Domains & DNS

- **reasonedinsight.com** (+ `www.`) — the primary/dedicated domain for this
  project. DNS lives directly at **Hover** (its own nameservers, not
  delegated elsewhere). Root has an `A` record; `www` has a `CNAME` to
  Vercel's assigned target. Root does a Vercel-level 308 redirect to `www`.
- **brentlwilliams.com** (+ `www.`) — the owner's personal domain, added
  here as a stepping stone before reasonedinsight.com existed. Its
  nameservers are delegated to **Cloudflare** (`paityn.ns.cloudflare.com`,
  `houston.ns.cloudflare.com`), NOT Hover, even though Hover is the
  registrar — Hover's own DNS tab is inert for it. DNS records for Vercel
  must be added in the Cloudflare dashboard, with proxy status set to
  "DNS only" (grey cloud) — a proxied/orange-cloud record breaks Vercel's
  DDoS/bot-mitigation and SSL issuance. This domain also has an unrelated
  Cloudflare Tunnel record (`scraper.brentlwilliams.com`) for a separate
  project — leave it alone.
  - **This domain may be removed from the project entirely** once
    reasonedinsight.com is confirmed stable — see `proxy.ts` below for why
    it currently needs special-case routing. If/when it's removed from
    Vercel and Cloudflare, delete the `LEGACY_PREFIXED_HOSTS` handling in
    `proxy.ts` and go back to a plain app with no host-based routing.
- New DNS changes are subject to normal propagation lag at the resolver
  level (independent of Vercel's own "Valid Configuration" check, which
  can go green before a given user's local/ISP resolver has picked up the
  change) — `dig <domain>` locally shows the real current TTL/answer if a
  change doesn't seem to be taking effect.

## Routing (`proxy.ts`)

Next.js `basePath` is a single global setting and can't differ per domain,
so per-domain routing is done in `proxy.ts` (Next.js 16's renamed
`middleware.ts`; the exported function must be named `proxy`, not
`middleware`). Only `brentlwilliams.com`/`www.brentlwilliams.com` get
special treatment: `/` redirects to `/eisenhower`, and `/eisenhower/*` is
rewritten to `/*` internally. Every other host (i.e. reasonedinsight.com)
passes through untouched and serves the app at its own root.

## Firebase (Google sign-in + cross-device sync)

- Firebase project: `eisenhower-grid` (console.firebase.google.com).
- Auth: Google sign-in provider. **Authorized domains** (Authentication →
  Settings) must list every domain the app is actually visited from —
  currently `reasonedinsight.com`, `www.reasonedinsight.com`,
  `brentlwilliams.com`, `www.brentlwilliams.com`, plus `localhost` and the
  `*.vercel.app` preview URL. Missing one here is the most common cause of
  "sign-in stopped working" when a domain changes.
- Firestore: each signed-in user's tasks live in a single document at
  `users/{uid}` (see `firestore.rules`, `lib/useTasks.ts`). Signed-out use
  is `localStorage` only and never touches Firestore.
- Config: `lib/firebase.ts` reads `NEXT_PUBLIC_FIREBASE_*` env vars (see
  `.env.local.example`) and degrades gracefully — `isFirebaseConfigured`
  is `false` and the app stays fully functional in local-only mode if
  they're absent (e.g. a fresh clone with no `.env.local` yet). These vars
  also need to be set in Vercel's Environment Variables for production,
  and any change there requires a redeploy to take effect.

## Chat assistant

- Model: OpenAI `gpt-5.6-luna` via the Responses API (`app/api/chat/route.ts`,
  server-only — reads `OPENAI_API_KEY`, never exposed to the client).
- `lib/useChat.ts` owns the client-side loop: it keeps the full Responses-API
  item history in a ref, posts it to `/api/chat` alongside the current
  tasks/goals as JSON context, and — for any `function_call` items in the
  response — executes the matching `useTasks`/`useGoals` action locally,
  appends a `function_call_output`, and re-posts until the model stops
  calling tools. Task/goal mutations from chat go through the same hooks as
  the rest of the UI, so they sync identically (`localStorage` or Firestore).
- `reasoning.effort` is set to `high` in the route — at `medium`, Luna (the
  cheapest/fastest GPT-5.6 tier) was observed hallucinating duplicate tasks
  that didn't exist in the state it was given, ignoring corrections. `high`
  plus an explicit "the state JSON is the only source of truth, don't count
  mentions in the transcript" instruction in the system prompt resolved it.
  If tool-calling accuracy regresses again, that's the first thing to check.

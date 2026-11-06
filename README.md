# InvestoDash

Deal OS for angel investors — pipeline CRM, AI diligence, thesis fit, and side-by-side deal comparison.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Supabase** (auth, Postgres, Storage)
- **Tailwind CSS** + shadcn/ui
- **Recharts**, **jsPDF**, **pdf.js** (client-side deck parsing)

## Quick start

```bash
corepack enable
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and set Supabase and (optional) Anthropic variables. Without `ANTHROPIC_API_KEY`, analysis uses deterministic heuristics for demos.

## Routes

- `/pipeline` — Kanban deal flow (Inbox → Invested)
- `/compare` — Compare 2–4 deals
- `/deals/[id]` — Deal room (upload deck, run analysis, export PDF)
- `/onboarding` — Investment thesis profile

## Scripts

- `pnpm dev` — development server
- `pnpm build` — production build
- `pnpm lint` — ESLint

See [AGENTS.md](./AGENTS.md) for architecture and data model notes.

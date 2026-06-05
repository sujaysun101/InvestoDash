# InvestoDash

InvestoDash is an AI-powered deal OS for angel investors — a persistent CRM plus diligence workspace for managing startup deal flow.

Built for the Codex Creator Challenge.

## Features

- **Pitch deck upload** — PDF and PPTX decks parsed client-side before analysis
- **AI diligence reports** — structured VC-style scoring across team, market, traction, and business model
- **Thesis matching** — score deals against your investment criteria
- **Live web research** — founder and claim cross-checks stored with each analysis
- **Deal pipeline** — Kanban board from Inbox → Invested
- **Deal comparison** — side-by-side scoring across 2–4 deals
- **PDF export** — downloadable diligence reports

## Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (auth, Postgres, Storage)
- Tailwind CSS + shadcn/ui
- Anthropic Claude (server-side analysis)
- Recharts, jsPDF, pdf.js, JSZip

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | For production auth/data | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For production auth/data | Supabase anon key |
| `ANTHROPIC_API_KEY` | For live AI analysis | Anthropic API key |
| `ANTHROPIC_MODEL` | For live AI analysis | Model ID (e.g. `claude-sonnet-4-20250514`) |
| `ENABLE_INTERNAL_DEMO` | Optional | Set to `true` to enable passwordless demo login |

Without Supabase or Anthropic keys, the app runs in **demo mode** with mock deals and heuristic-based analysis.

### Database setup

Apply migrations in `supabase/migrations/` to your Supabase project. The schema includes `thesis`, `deals`, `deal_analysis`, `deal_activity`, `deal_files`, and `usage_counters`.

## Scripts

```bash
pnpm dev      # development server
pnpm build    # production build
pnpm lint     # ESLint
pnpm start    # production server
```

## App routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing page |
| `/login` | Sign in (Google OAuth or internal demo) |
| `/onboarding` | Investment thesis setup |
| `/dashboard` | Kanban deal pipeline |
| `/deals/[id]` | Deal room — upload deck, run analysis, update status |
| `/compare` | Side-by-side deal comparison |

## Demo flow

1. Enable `ENABLE_INTERNAL_DEMO=true` or configure Supabase + Google OAuth
2. Sign in and complete thesis onboarding (or use demo defaults)
3. Open the pipeline at `/dashboard` and click a deal
4. Upload a PDF or PPTX deck, then run analysis
5. Compare deals at `/compare` and export a PDF report

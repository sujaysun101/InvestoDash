# InvestoDash Agent Guide

## Product

InvestoDash is a deal OS for angel investors. It is a persistent CRM plus AI analysis workspace for managing startup deal flow, not a one-off report generator.

## Stack

- Next.js 14 with App Router and TypeScript
- Supabase for auth, Postgres, and Storage
- Tailwind CSS
- shadcn/ui
- Recharts
- jsPDF

## Core UX

- Dark mode is the default experience.
- Use shadcn/ui components and semantic theme tokens throughout.
- Keep the app feeling like an operating system for deals: dense, calm, and information-rich.

## Architecture

- Keep feature areas modular and separated by responsibility.
- Place auth and onboarding logic under `src/features/auth`.
- Place deal pipeline and deal room logic under `src/features/deals`.
- Place AI analysis orchestration under `src/features/analysis`.
- Place reusable UI primitives and shell components under `src/components`.
- Place shared types, validation, and helpers under `src/lib`.

## Data Model Expectations

- `thesis` stores one investment thesis profile per user.
- `deals` stores canonical deal records and pipeline state.
- `deal_analysis` stores structured AI analysis results and thesis-fit results.
- `deal_activity` stores timestamped notes and status changes.
- `deal_files` stores uploaded deck metadata tied to Supabase Storage paths.
- `usage_counters` tracks free-tier analysis consumption.

## AI Rules

- Server-only API calls for Anthropic.
- Parse deck text client-side with pdf.js before sending extracted content to the backend.
- Validate and normalize model JSON responses before persisting them.
- Web research summaries must be stored alongside the analysis result for later export and comparison.

## Implementation Notes

- Prefer Server Components for data loading and Client Components only for interactive surfaces.
- Use route handlers or server actions for writes.
- Do not initialize external clients at module scope when environment variables are required.
- Keep exported analysis and comparison utilities independent from UI components.

## Verification

- Run lint before wrapping up.
- If schema files or setup docs are added, keep them aligned with the shipped code.

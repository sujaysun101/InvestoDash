import Link from "next/link";
import {
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Download,
  FolderKanban,
  GitCompareArrows,
  Globe2,
  Radar,
  Search,
  ShieldAlert,
  Upload,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

const featureCards = [
  {
    icon: Brain,
    title: "AI Diligence Report",
    description: "10+ risk dimensions structured like a real VC memo, not a generic summary.",
  },
  {
    icon: Radar,
    title: "Thesis Matching",
    description: "Define your criteria once and get an instant thesis-fit score on every deal.",
  },
  {
    icon: Globe2,
    title: "Live Web Research",
    description: "Cross-check founders, funding, and claims against public information in seconds.",
  },
  {
    icon: FolderKanban,
    title: "Deal Pipeline",
    description: "Run your funnel from Inbox to Invested in a single persistent deal workspace.",
  },
  {
    icon: GitCompareArrows,
    title: "Deal Comparison",
    description: "Compare 2 to 4 startup opportunities side-by-side before your next decision.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Generate shareable diligence reports for partners, LPs, or internal review.",
  },
];

const strengths = [
  "High-signal founder with prior payments infrastructure exit",
  "Large embedded finance wedge with clear buyer urgency",
  "Tight workflow product that expands naturally into treasury ops",
];

const redFlags = [
  "Revenue quality still concentrated in a small design-partner set",
  "Underwriting model assumptions need more historical loss data",
  "Competitive moat depends on execution speed over long-term data depth",
];

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-[#0f1117] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.26),transparent_35%),radial-gradient(circle_at_80%_18%,rgba(15,196,142,0.16),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_45%)]"
      />

      <section className="relative border-b border-white/8 px-6 pb-20 pt-0 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-12">
          <header className="sticky top-0 z-50 -mx-6 border-b border-white/10 bg-[#0f1117]/90 px-6 py-4 backdrop-blur-md sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/12 shadow-[0_0_40px_rgba(37,99,235,0.24)]">
                  <span className="font-mono text-sm text-blue-300">ID</span>
                </div>
                <div className="min-w-0">
                  <p className="font-display text-xl tracking-tight">InvestoDash</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    AI-powered deal OS
                  </p>
                </div>
              </Link>

              <nav
                aria-label="Marketing"
                className="order-3 flex w-full basis-full flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 text-sm text-white/65 sm:order-none sm:w-auto sm:basis-auto sm:border-0 sm:pt-0 lg:gap-x-8"
              >
                <Link className="transition-colors hover:text-white" href="#how-it-works">
                  How it works
                </Link>
                <Link className="transition-colors hover:text-white" href="#features">
                  Features
                </Link>
                <Link className="transition-colors hover:text-white" href="#sample-report">
                  Sample report
                </Link>
                <Link className="transition-colors hover:text-white" href="#pricing">
                  Pricing
                </Link>
              </nav>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  className="text-sm text-white/70 transition-colors hover:text-white"
                  href="/login"
                >
                  Sign in
                </Link>
                <Button
                  asChild
                  className="h-10 rounded-full bg-blue-600 px-4 text-sm text-white hover:bg-blue-500"
                >
                  <Link href="/login">Get started</Link>
                </Button>
              </div>
            </div>
          </header>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.02fr)_minmax(520px,0.98fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-5 text-xs uppercase tracking-[0.32em] text-blue-300">
                Built for angels and fund analysts
              </p>
              <h1 className="font-display text-[3rem] leading-[0.94] tracking-[-0.04em] text-balance sm:text-[4.4rem] xl:text-[5.2rem]">
                Review Any Pitch Deck Like a VC. In 60 Seconds.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-white/68 sm:text-xl">
                InvestoDash uses AI to generate structured diligence reports, score
                deals against your thesis, and manage your entire deal flow in one
                place.
              </p>

              <div className="relative z-10 mt-8">
                <Button asChild className="h-12 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500">
                  <Link href="/login">
                    Try for Free
                    <ArrowRight />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/8 pt-6">
                <Metric value="<60s" label="to generate a structured memo" />
                <Metric value="3x" label="faster first-pass diligence" />
                <Metric value="1" label="deal brain for every review" />
              </div>
            </div>

            <HeroMockup />
          </div>
        </div>
      </section>

      <section className="border-b border-white/8 px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-[1380px] gap-4 md:grid-cols-3">
          <ProblemPill icon={ShieldAlert} stat="1-2 hrs per deck" label="manual review time burned on each pitch" />
          <ProblemPill icon={Radar} stat="50-100 decks/year" label="typical angel and scout deal flow volume" />
          <ProblemPill icon={Search} stat="No memory" label="spreadsheets and chat tools restart from zero every time" />
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-28 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            eyebrow="How it works"
            title="From raw pitch deck to investment call in three moves."
            description="InvestoDash compresses the messy first pass into a repeatable system your brain can trust."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <StepPanel
              icon={Upload}
              number="01"
              title="Upload pitch deck"
              description="Drop in a PDF or PPTX from your inbox, scout, or founder intro thread."
            />
            <StepPanel
              icon={Brain}
              number="02"
              title="AI runs structured diligence"
              description="Team, market, traction, business model, and live web research get analyzed together."
            />
            <StepPanel
              icon={FolderKanban}
              number="03"
              title="Get the report and track the deal"
              description="Receive a VC-grade memo, thesis fit score, and a persistent place in your pipeline."
            />
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-28 border-y border-white/8 bg-white/[0.02] px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            eyebrow="Features"
            title="One system for signal, memory, and decision velocity."
            description="The workflow is designed for investors who want rigor without turning every intro into a two-hour research session."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 transition-transform duration-300 hover:-translate-y-1 hover:border-blue-400/35 hover:bg-[linear-gradient(180deg,rgba(37,99,235,0.12),rgba(255,255,255,0.03))]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/12 text-blue-300">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-white/64">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sample-report" className="scroll-mt-28 px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            eyebrow="Sample report preview"
            title="A realistic diligence view, not a generic AI paragraph."
            description="This is the kind of structured, finance-grade output you get after uploading a deck into InvestoDash."
          />

          <div className="mt-14 overflow-hidden rounded-[36px] border border-white/10 bg-[#101722] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <div className="grid gap-0 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="border-b border-white/8 p-8 xl:border-b-0 xl:border-r">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-blue-300">
                      NovaPay AI — Series A
                    </p>
                    <h3 className="mt-3 font-display text-4xl tracking-[-0.04em]">
                      Executive Summary
                    </h3>
                    <p className="mt-4 max-w-xl text-base leading-8 text-white/68">
                      NovaPay AI is building an underwriting and payments workflow
                      stack for vertical SaaS platforms selling into SMB merchants.
                      The company shows strong market pull and founder quality,
                      though the current traction base still needs broader proof.
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-400/25 bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-300">
                    STRONG YES
                  </div>
                </div>

                <div className="mt-8 grid gap-4">
                  <ScoreBar label="Team" score={8} color="bg-blue-500" />
                  <ScoreBar label="Market" score={9} color="bg-cyan-400" />
                  <ScoreBar label="Traction" score={6} color="bg-amber-400" />
                  <ScoreBar label="Business Model" score={7} color="bg-emerald-400" />
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <div className="rounded-full border border-amber-400/25 bg-amber-400/12 px-4 py-2 text-sm text-amber-200">
                    Overall Risk Score: 4/10 Medium Risk
                  </div>
                  <div className="rounded-full border border-blue-400/25 bg-blue-500/12 px-4 py-2 text-sm text-blue-200">
                    Thesis Fit: 8/10
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-white/62">
                  Strong match: B2B fintech seed/Series A, NYC-based, $250K check
                  size aligns.
                </p>
              </div>

              <div className="grid gap-0 border-t border-white/8 xl:border-t-0">
                <div className="grid gap-8 p-8 md:grid-cols-[0.92fr_1.08fr]">
                  <div className="flex flex-col gap-5">
                    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-white/72">Conviction map</p>
                        <span className="font-mono text-xs text-white/40">LIVE</span>
                      </div>
                      <RadarMock />
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <ListPanel
                      iconColor="text-emerald-300"
                      items={strengths}
                      title="Strengths"
                      icon={<CheckCircle2 size={18} />}
                    />
                    <ListPanel
                      iconColor="text-rose-300"
                      items={redFlags}
                      title="Red Flags"
                      icon={<XCircle size={18} />}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-28 border-y border-white/8 bg-white/[0.02] px-6 py-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1380px]">
          <SectionIntro
            eyebrow="Pricing"
            title="Start free, upgrade when deal flow becomes real work."
            description="The free tier proves the workflow. Pro unlocks the full operating system."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <PricingCard
              cta="Try for free"
              description="For angels exploring a faster first pass."
              features={[
                "3 deck analyses",
                "Basic diligence report",
                "Sign in to get started",
              ]}
              price="Free"
              title="Free"
            />
            <PricingCard
              cta="Get Pro"
              description="For active angels and fund analysts reviewing deals weekly."
              features={[
                "Unlimited analyses",
                "Thesis scoring",
                "Web research",
                "Pipeline and comparison",
                "PDF export",
                "Priority processing",
              ]}
              highlighted
              price="$49/mo"
              title="Pro"
            />
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1380px] flex-col gap-5 border-t border-white/8 pt-8 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white/70">InvestoDash</p>
            <p className="mt-1">AI diligence and deal flow for angels and funds.</p>
            <p className="mt-2 text-white/40">© {new Date().getFullYear()} InvestoDash</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <Link className="hover:text-white/80" href="/login">
              Sign in
            </Link>
            <Link className="hover:text-white/80" href="#pricing">
              Pricing
            </Link>
            <a className="hover:text-white/80" href="mailto:support@investodash.com">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl tracking-[-0.05em] text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-white/48">{label}</p>
    </div>
  );
}

function HeroMockup() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.28),transparent_48%)] blur-3xl"
      />
      <div className="overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,14,22,0.98),rgba(15,22,34,0.98))] shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="size-2.5 rounded-full bg-rose-400/85" />
            <div className="size-2.5 rounded-full bg-amber-300/85" />
            <div className="size-2.5 rounded-full bg-emerald-400/85" />
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            sample report
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="border-b border-white/8 p-6 xl:border-b-0 xl:border-r">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-blue-300">
                  NovaPay AI
                </p>
                <h2 className="mt-3 font-display text-[2.2rem] tracking-[-0.05em]">
                  AI Diligence Snapshot
                </h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/62">
                  Structured first-pass diligence generated from the pitch deck,
                  thesis profile, and live web research.
                </p>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-4 py-2 text-sm font-medium text-emerald-300">
                STRONG YES
              </div>
            </div>

            <div className="mt-7 grid gap-3">
              <MiniScore label="Team" value="8/10" tone="text-blue-300" />
              <MiniScore label="Market" value="9/10" tone="text-cyan-300" />
              <MiniScore label="Traction" value="6/10" tone="text-amber-200" />
              <MiniScore label="Business" value="7/10" tone="text-emerald-300" />
            </div>

            <div className="mt-7 rounded-[24px] border border-white/8 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/75">Executive summary</p>
                <span className="font-mono text-xs text-white/35">CLAUDE</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Payments and underwriting infrastructure for vertical SaaS
                platforms with strong founder quality and category momentum, but
                still early proof on scaled distribution.
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6">
            <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-white/75">4-factor radar</p>
                <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200">
                  thesis fit 8/10
                </span>
              </div>
              <RadarMock />
            </div>

            <div className="grid gap-3">
              <SignalLine color="bg-emerald-400" label="Strengths" text="Founder-market fit, timing, workflow wedge" />
              <SignalLine color="bg-rose-400" label="Red flags" text="Need broader traction proof and cleaner moat narrative" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProblemPill({
  icon: Icon,
  stat,
  label,
}: {
  icon: typeof ShieldAlert;
  stat: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-[28px] border border-white/10 bg-white/[0.03] px-5 py-5">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/12 text-blue-300">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-2xl tracking-[-0.04em]">{stat}</p>
        <p className="mt-1 text-sm leading-6 text-white/52">{label}</p>
      </div>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{eyebrow}</p>
      <h2 className="mt-4 font-display text-4xl tracking-[-0.04em] sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">
        {description}
      </p>
    </div>
  );
}

function StepPanel({
  icon: Icon,
  number,
  title,
  description,
}: {
  icon: typeof Upload;
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-[30px] border border-white/10 bg-white/[0.03] p-6">
      <div className="flex items-center justify-between">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/12 text-blue-300">
          <Icon size={20} />
        </div>
        <span className="font-mono text-xs tracking-[0.28em] text-white/28">{number}</span>
      </div>
      <h3 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-white/60">{description}</p>
      <div className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 text-white/18 lg:block">
        <ArrowRight size={22} />
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-white/72">{label}</span>
        <span className="font-mono text-white/58">{score}/10</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/8">
        <div
          className={`h-2.5 rounded-full ${color}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );
}

function MiniScore({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <span className="text-sm text-white/68">{label}</span>
      <span className={`font-mono text-sm ${tone}`}>{value}</span>
    </div>
  );
}

function SignalLine({
  color,
  label,
  text,
}: {
  color: string;
  label: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3">
      <div className={`size-2.5 rounded-full ${color}`} />
      <p className="text-sm text-white/62">
        <span className="font-medium text-white/86">{label}:</span> {text}
      </p>
    </div>
  );
}

function ListPanel({
  title,
  items,
  icon,
  iconColor,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  iconColor: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-white/78">{title}</p>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-2xl border border-white/7 bg-black/10 px-4 py-3"
          >
            <div className={`mt-0.5 ${iconColor}`}>{icon}</div>
            <p className="text-sm leading-7 text-white/62">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingCard({
  title,
  price,
  description,
  features,
  cta,
  highlighted = false,
}: {
  title: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-[32px] border p-8 ${
        highlighted
          ? "border-blue-400/35 bg-[linear-gradient(180deg,rgba(37,99,235,0.18),rgba(255,255,255,0.03))] shadow-[0_30px_90px_rgba(37,99,235,0.14)]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{title}</p>
          <p className="mt-3 font-display text-5xl tracking-[-0.05em]">{price}</p>
        </div>
        {highlighted ? (
          <span className="rounded-full border border-blue-300/25 bg-blue-500/14 px-3 py-1 text-xs uppercase tracking-[0.25em] text-blue-200">
            Most Popular
          </span>
        ) : null}
      </div>

      <p className="mt-5 max-w-md text-sm leading-7 text-white/60">{description}</p>

      <div className="mt-8 flex flex-col gap-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-3 text-sm text-white/72">
            <div className="flex size-6 items-center justify-center rounded-full bg-white/8 text-emerald-300">
              <Check size={14} />
            </div>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <Button
        asChild
        className={`mt-8 h-12 rounded-full px-6 ${
          highlighted
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "border-white/12 bg-white/0 text-white hover:bg-white/6"
        }`}
        variant={highlighted ? "default" : "outline"}
      >
        <Link href="/login">{cta}</Link>
      </Button>
    </div>
  );
}

function RadarMock() {
  return (
    <svg
      className="mx-auto h-[220px] w-full max-w-[260px]"
      viewBox="0 0 260 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="translate(130 110)">
        {[90, 65, 40, 18].map((radius) => (
          <polygon
            key={radius}
            points={`0,-${radius} ${radius},0 0,${radius} -${radius},0`}
            stroke="rgba(255,255,255,0.12)"
          />
        ))}
        <line x1="0" y1="-90" x2="0" y2="90" stroke="rgba(255,255,255,0.12)" />
        <line x1="-90" y1="0" x2="90" y2="0" stroke="rgba(255,255,255,0.12)" />
        <polygon
          points="0,-72 81,0 0,54 -63,0"
          fill="rgba(37,99,235,0.24)"
          stroke="rgba(96,165,250,1)"
          strokeWidth="2.4"
        />
        <circle cx="0" cy="-72" r="4" fill="#60A5FA" />
        <circle cx="81" cy="0" r="4" fill="#22D3EE" />
        <circle cx="0" cy="54" r="4" fill="#34D399" />
        <circle cx="-63" cy="0" r="4" fill="#FBBF24" />
      </g>
      <text x="130" y="16" textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="11" letterSpacing="2">
        MARKET
      </text>
      <text x="238" y="114" textAnchor="end" fill="rgba(255,255,255,0.52)" fontSize="11" letterSpacing="2">
        TEAM
      </text>
      <text x="130" y="214" textAnchor="middle" fill="rgba(255,255,255,0.52)" fontSize="11" letterSpacing="2">
        MODEL
      </text>
      <text x="18" y="114" fill="rgba(255,255,255,0.52)" fontSize="11" letterSpacing="2">
        TRACTION
      </text>
    </svg>
  );
}

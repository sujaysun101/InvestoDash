import { Deal, ThesisProfile, UsageCounter } from "@/lib/types";

export const mockThesis: ThesisProfile = {
  sectors: ["Fintech", "AI Infrastructure", "Developer Tools"],
  check_size_range: "$50k-$150k",
  target_stage: ["Pre-Seed", "Seed"],
  geography_preference: "United States + India",
  custom_note:
    "Prefer technical founders with strong distribution insight and early revenue signal.",
};

export const mockUsage: UsageCounter = {
  used: 2,
  limit: 999_999,
  remaining: 999_999,
};

export const mockDeals: Deal[] = [
  {
    id: "deal-aurora",
    company_name: "Aurora Ledger",
    founder_name: "Mina Shah",
    website_url: "https://auroraledger.example.com",
    stage: "Seed",
    sector: "Fintech",
    date_added: "2026-03-28",
    status: "Exploring",
    notes_html:
      "API-first treasury tooling for modern finance teams. Warm intro from prior portfolio founder.",
    usage_remaining: 1,
    activity: [
      {
        id: "a1",
        timestamp: "2026-03-28 09:30",
        title: "Intro added",
        note: "Warm inbound from portfolio founder. Deck uploaded and partner review requested.",
      },
      {
        id: "a2",
        timestamp: "2026-03-29 13:10",
        title: "Exploration call booked",
        note: "Scheduled 45-minute founder meeting for next Tuesday.",
      },
    ],
    analysis: {
      executive_summary:
        "Aurora Ledger is building workflow-native treasury software for fast-moving finance teams. Early customer references and product clarity support a continued exploration path.",
      team_score: {
        score: 8,
        reasoning:
          "Founders show strong fintech operations background and credible GTM intuition.",
      },
      market_score: {
        score: 7,
        reasoning:
          "Large software spend category with clear workflow pain, though competition is active.",
      },
      traction_score: {
        score: 7,
        reasoning:
          "Pilot pipeline and design partners suggest real interest, but scaled retention data is still early.",
      },
      business_model_score: {
        score: 8,
        reasoning:
          "Clear SaaS monetization path with expansion opportunity across finance ops modules.",
      },
      overall_risk_score: 4,
      strengths: [
        "Strong founder-market fit in finance operations.",
        "Clear product wedge with natural account expansion.",
        "Good early proof through design partners and pipeline.",
      ],
      red_flags: [
        "Crowded landscape with incumbent procurement friction.",
        "Need clearer implementation timeline for enterprise customers.",
        "Limited evidence on multi-product adoption.",
      ],
      missing_info: [
        "Retention and payback data after implementation.",
        "More detail on security and compliance posture.",
        "Customer concentration and pipeline composition.",
      ],
      recommendation: {
        verdict: "EXPLORE",
        rationale:
          "There is enough product clarity and founder signal to justify deeper diligence.",
      },
      thesis_fit_score: 9,
      thesis_fit_reason:
        "Strong overlap with fintech infrastructure and seed-stage workflow software.",
      web_context:
        "Public mentions suggest early fundraising momentum and confirm the founders' prior finance tooling backgrounds. Independent web context supports the general category thesis, though scale claims remain lightly substantiated.",
      analyzed_at: "2026-03-29T16:20:00.000Z",
    },
  },
  {
    id: "deal-lattice",
    company_name: "Lattice Forge",
    founder_name: "Ethan Cole",
    website_url: "https://latticeforge.example.com",
    stage: "Pre-Seed",
    sector: "Developer Tools",
    date_added: "2026-03-27",
    status: "Inbox",
    notes_html:
      "Observability and deployment orchestration for AI-native developer platforms.",
    usage_remaining: 1,
    activity: [
      {
        id: "l1",
        timestamp: "2026-03-27 18:20",
        title: "Deck received",
        note: "Cold inbound from founder. Interesting infra wedge but very early.",
      },
    ],
    analysis: null,
  },
  {
    id: "deal-orbit",
    company_name: "Orbit Health AI",
    founder_name: "Sarah Kim",
    website_url: "https://orbithealth.example.com",
    stage: "Series A",
    sector: "Healthtech",
    date_added: "2026-03-23",
    status: "Due Diligence",
    notes_html:
      "Provider workflow automation with payer integrations and AI summarization.",
    usage_remaining: 1,
    activity: [
      {
        id: "o1",
        timestamp: "2026-03-24 11:45",
        title: "Diligence started",
        note: "Requested customer references and funnel conversion metrics.",
      },
      {
        id: "o2",
        timestamp: "2026-03-30 15:00",
        title: "Partner sync",
        note: "Good traction story, but implementation complexity remains a concern.",
      },
    ],
    analysis: {
      executive_summary:
        "Orbit Health AI targets provider workflow automation with a credible enterprise story and meaningful commercial traction. Healthcare deployment complexity increases execution risk despite strong category demand.",
      team_score: {
        score: 8,
        reasoning:
          "Leadership combines clinical workflow and software commercialization experience.",
      },
      market_score: {
        score: 8,
        reasoning: "Large pain point with budget ownership, though sales cycles are long.",
      },
      traction_score: {
        score: 9,
        reasoning: "The company shows strong deployment momentum and enterprise demand.",
      },
      business_model_score: {
        score: 7,
        reasoning:
          "Revenue model is clear, but implementation and integration load affect margins.",
      },
      overall_risk_score: 5,
      strengths: [
        "Clear buyer pain and budget owner.",
        "Credible enterprise traction and strong references.",
        "Helpful workflow wedge inside existing clinical systems.",
      ],
      red_flags: [
        "Integration cycles may slow deployment.",
        "Healthcare compliance burden may compress velocity.",
        "Series A pricing leaves less room for angle-sized conviction.",
      ],
      missing_info: [
        "Implementation margin profile by customer segment.",
        "Net retention by cohort.",
        "Regulatory roadmap and risk ownership.",
      ],
      recommendation: {
        verdict: "EXPLORE",
        rationale:
          "The business is compelling but needs a deeper diligence pass on deployment quality and pricing.",
      },
      thesis_fit_score: 5,
      thesis_fit_reason:
        "Strong company quality, but it sits only partially inside the stated thesis focus.",
      web_context:
        "Public coverage appears to validate the company's provider workflow focus and early fundraising history. The web record supports market presence but does not independently verify all commercial efficiency claims.",
      analyzed_at: "2026-03-30T17:35:00.000Z",
    },
  },
  {
    id: "deal-summit",
    company_name: "Summit Grid",
    founder_name: "Arjun Patel",
    website_url: "https://summitgrid.example.com",
    stage: "Seed",
    sector: "Climate",
    date_added: "2026-03-20",
    status: "Passed",
    notes_html:
      "Good market, but felt too services-heavy versus our current thesis.",
    usage_remaining: 1,
    activity: [
      {
        id: "s1",
        timestamp: "2026-03-26 14:20",
        title: "Passed",
        note: "Team is solid, but thesis fit and software leverage were not strong enough.",
      },
    ],
    analysis: null,
  },
  {
    id: "deal-meridian",
    company_name: "Meridian Stack",
    founder_name: "Noah Brooks",
    website_url: "https://meridianstack.example.com",
    stage: "Seed",
    sector: "AI Infrastructure",
    date_added: "2026-03-29",
    status: "Reviewing",
    notes_html: "Inference optimization layer for enterprise AI deployments.",
    usage_remaining: 1,
    activity: [
      {
        id: "m1",
        timestamp: "2026-03-29 10:05",
        title: "Review started",
        note: "Initial deck looks strong. Need founder background and customer design partners.",
      },
    ],
    analysis: null,
  },
  {
    id: "deal-polaris",
    company_name: "Polaris Pay",
    founder_name: "Tina Alvarez",
    website_url: "https://polarispay.example.com",
    stage: "Seed",
    sector: "Fintech",
    date_added: "2026-03-18",
    status: "Invested",
    notes_html: "Portfolio company. Great progress post-check.",
    usage_remaining: 1,
    analysis: null,
    activity: [],
  },
];

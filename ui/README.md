# TwinCycle AI — Web UI

Contract-driven MVP for AI-powered device lifecycle assessment.

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

## Quick Start

```bash
cd ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS v4** + **shadcn/ui**
- **Recharts** for radar chart
- **lucide-react** for icons

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Single-page wizard
│   └── globals.css         # Tailwind + shadcn tokens
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── ScenarioToggle.tsx  # Scenario A/B switch
│   ├── WizardProgress.tsx  # 3-step progress
│   ├── ProfileForm.tsx     # Step 1
│   ├── AIResults.tsx       # Step 2
│   ├── RecommendationCard.tsx
│   ├── ScoresChart.tsx     # Radar chart
│   ├── CarbonBargaining.tsx # Step 3
│   └── LoadingSkeleton.tsx # Loading + error states
├── lib/utils.ts
└── types.ts                # Contract-aligned types
public/
└── demo_outputs/
    ├── scenario_A.json
    └── scenario_B.json
```

## Scenario Data

JSON files in `/public/demo_outputs/` follow the contract defined in `contracts/assess.v1.example.json`.
Toggle between Scenario A (older device, budget-focused) and Scenario B (newer device, sustainability-focused) using the top bar.

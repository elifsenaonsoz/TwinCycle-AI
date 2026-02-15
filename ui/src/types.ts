export interface AssessResponse {
  request_id: string;
  timestamp_utc: string;
  model_version: string;
  inputs_echo: InputsEcho;
  rul_estimate: RulEstimate;
  decision_summary: DecisionSummary;
  recommendations: Recommendation[];
  disclaimer: Disclaimer;
}

export interface InputsEcho {
  device: {
    brand: string;
    model: string;
    age_months: number;
  };
  signals: {
    battery_health_percent: number;
    charge_cycles: number;
    frame_drop_rate: number;
    repair_history_count: number;
  };
  user_preferences: {
    budget_priority: string;
    sustainability_priority: string;
    performance_priority: string;
    prefers_financing: boolean;
  };
}

export interface RulEstimate {
  rul_months_min: number;
  rul_months_max: number;
  confidence: string;
  confidence_score: number;
  key_drivers: string[];
}

export interface DecisionSummary {
  recommended_primary_option_id: string;
  rationale: string;
  pareto_note: string;
}

export interface Scores {
  cost_score: number;
  sustainability_score: number;
  performance_score: number;
  overall_score: number;
}

export interface EstimatedImpacts {
  rul_gain_months_min: number;
  rul_gain_months_max: number;
  co2_impact_score: number;
  ewaste_reduction_score: number;
}

export interface UIConfig {
  cta_label: string;
  badge: string;
  icon: string;
}

export interface Triggers {
  open_incentive_flow: boolean;
}

export interface Recommendation {
  option_id: string;
  title: string;
  tagline: string;
  category: string;
  why_this: string[];
  scores: Scores;
  estimated_impacts: EstimatedImpacts;
  assumptions: string[];
  next_steps: string[];
  ui: UIConfig;
  triggers: Triggers;
}

export interface Disclaimer {
  type: string;
  text: string;
}

export type Scenario = "A" | "B";
export type WizardStep = 1 | 2 | 3;

export interface IncentiveValue {
  cash_amount_try: number | null;
  carbon_points: number | null;
  perk: "donation" | "tree" | "extra_data" | "none";
}

export interface IncentivePackage {
  package_id: "cash" | "carbon_points" | "hybrid";
  title: string;
  description: string;
  value: IncentiveValue;
  ui: {
    badge: string;
    cta_label: string;
  };
}

export interface IncentiveResponse {
  request_id: string;
  model_version: string;
  selected_option_id: string;
  packages: IncentivePackage[];
  accept_score: number;
  impact_score: number;
  notes: string[];
  disclaimer: Disclaimer;
}

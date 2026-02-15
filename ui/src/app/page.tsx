"use client";

import { useState, useEffect, useCallback } from "react";
import { AssessResponse, Scenario, WizardStep } from "@/types";
import { ScenarioToggle } from "@/components/ScenarioToggle";
import { WizardProgress } from "@/components/WizardProgress";
import { ProfileForm } from "@/components/ProfileForm";
import { AIResults } from "@/components/AIResults";
import { CarbonBargaining } from "@/components/CarbonBargaining";
import { LoadingSkeleton, ErrorState } from "@/components/LoadingSkeleton";
import { Recycle } from "lucide-react";

export default function Home() {
  const [shotMode, setShotMode] = useState(false);
  const [scenario, setScenario] = useState<Scenario>("A");
  const [step, setStep] = useState<WizardStep>(1);
  const [data, setData] = useState<AssessResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const fetchData = useCallback(async (s: Scenario) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/demo_outputs/scenario_${s}.json`);
      if (!res.ok) throw new Error(`Veri yüklenemedi (HTTP ${res.status})`);
      const json: AssessResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(scenario);
  }, [scenario, fetchData]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setShotMode(params.get("shot") === "1");
  }, []);

  const handleScenarioChange = (s: Scenario) => {
    setScenario(s);
    setSelectedOptionId(null);
    if (step > 1) setStep(2);
  };

  const handleEvaluate = () => {
    setStep(2);
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
  };

  const handleContinueToStep3 = () => {
    setStep(3);
  };

  const step3Available =
    data?.recommendations.some(
      (r) =>
        r.option_id === selectedOptionId &&
        (r.triggers.open_incentive_flow || r.option_id === "tradein_new")
    ) || false;

  const selectedRec =
    data?.recommendations.find((r) => r.option_id === selectedOptionId) || null;

  return (
    <div className="min-h-screen bg-background" data-shot={shotMode ? "1" : "0"}>
      {/* Header */}
      <header
        className={`border-b z-50 ${shotMode
            ? "bg-background"
            : "bg-white/80 backdrop-blur-sm sticky top-0"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${shotMode ? "h-14" : "h-16"}`}>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500 text-white">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight">
                TwinCycle
                <span className="text-emerald-600"> AI</span>
              </span>
            </div>
            {!shotMode && <ScenarioToggle scenario={scenario} onChange={handleScenarioChange} />}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WizardProgress currentStep={step} step3Available={step3Available} />

        {loading && <LoadingSkeleton />}

        {error && !loading && (
          <ErrorState
            message={error}
            onRetry={() => fetchData(scenario)}
          />
        )}

        {!loading && !error && (
          <div className="pb-16">
            {step === 1 && <ProfileForm onEvaluate={handleEvaluate} />}

            {step === 2 && data && (
              <AIResults
                data={data}
                selectedOptionId={selectedOptionId}
                onSelectOption={handleSelectOption}
                onContinue={handleContinueToStep3}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <CarbonBargaining
                scenario={scenario}
                selectedRecommendation={selectedRec}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground text-center">
            TwinCycle AI — MVP v1.0 · Karar destek amaçlıdır
          </p>
        </div>
      </footer>
    </div>
  );
}

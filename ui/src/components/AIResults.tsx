"use client";

import { useMemo, useState } from "react";
import { AssessResponse, Recommendation } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendationCard } from "./RecommendationCard";
import { ScoresChart } from "./ScoresChart";
import {
  Clock,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Info,
  CheckCircle2,
} from "lucide-react";

interface AIResultsProps {
  data: AssessResponse;
  selectedOptionId: string | null;
  onSelectOption: (optionId: string) => void;
  onContinue: () => void;
  onBack: () => void;
}

const driverLabelMap: Record<string, string> = {
  battery_health_percent: "Batarya Sağlığı",
  charge_cycles: "Şarj Döngüsü",
  frame_drop_rate: "Takılma Oranı",
  repair_history_count: "Onarım Geçmişi",
  device_age_months: "Cihaz Yaşı",
};

function getConfidenceBadge(score: number) {
  if (score >= 0.8) return { label: "Yüksek", variant: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (score >= 0.6) {
    return {
      label: "Orta-Yüksek",
      variant: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }
  return { label: "Orta", variant: "bg-orange-50 text-orange-700 border-orange-200" };
}

export function AIResults({
  data,
  selectedOptionId,
  onSelectOption,
  onContinue,
  onBack,
}: AIResultsProps) {
  const [completedForOptionId, setCompletedForOptionId] = useState<string | null>(null);

  const confidence = getConfidenceBadge(data.rul_estimate.confidence_score);
  const selectedRec = data.recommendations.find((r) => r.option_id === selectedOptionId);
  const canOpenIncentive =
    selectedRec?.triggers.open_incentive_flow || selectedRec?.option_id === "tradein_new";

  const continueLabel = useMemo(() => {
    if (!selectedRec) return "Önce Seçim Yap";
    return canOpenIncentive ? "Teşviklere Devam Et" : "Özetle Bitir";
  }, [canOpenIncentive, selectedRec]);

  const handleContinue = () => {
    if (!selectedRec) return;
    if (canOpenIncentive) {
      onContinue();
      return;
    }
    setCompletedForOptionId(selectedRec.option_id);
  };

  const showCompleted =
    !!selectedRec && !canOpenIncentive && completedForOptionId === selectedRec.option_id;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* RUL */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Tahmini Kalan Ömür (RUL)</p>
                <p className="text-3xl font-bold">
                  {data.rul_estimate.rul_months_min}–{data.rul_estimate.rul_months_max} ay
                </p>
              </div>
            </div>
            <Badge variant="outline" className={`${confidence.variant} text-xs`}>
              {confidence.label}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.rul_estimate.key_drivers.map((driver) => (
              <Badge key={driver} variant="secondary" className="text-xs">
                {driverLabelMap[driver] || driver}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Decision Summary */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/30 to-muted/10">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-base">Karar Özeti</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {data.decision_summary.rationale}
          </p>
          <div className="flex items-start gap-2 pt-1">
            <Info className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic">
              {data.decision_summary.pareto_note}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Cards */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Seçenekler</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.recommendations.map((rec: Recommendation) => (
            <RecommendationCard
              key={rec.option_id}
              rec={rec}
              isSelected={selectedOptionId === rec.option_id}
              isRecommended={
                data.decision_summary.recommended_primary_option_id === rec.option_id
              }
              onSelect={onSelectOption}
            />
          ))}
        </div>
      </div>

      {/* Radar Chart */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ScoresChart recommendations={data.recommendations} />
        </CardContent>
      </Card>

      {showCompleted && (
        <Card className="border-0 shadow-sm bg-emerald-50/70 border-emerald-200">
          <CardContent className="p-5 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <p className="text-sm text-emerald-800">
              Akış tamamlandı. Bu seçenek için özet değerlendirme üretildi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center italic px-4">
        {data.disclaimer.text}
      </p>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <div className="flex flex-col items-end gap-1">
          <Button
            onClick={handleContinue}
            size="lg"
            className="px-8"
            disabled={!selectedRec}
          >
            {continueLabel}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {!selectedRec && (
            <p className="text-[11px] text-muted-foreground">Devam etmek için bir seçenek seç.</p>
          )}
        </div>
      </div>
    </div>
  );
}

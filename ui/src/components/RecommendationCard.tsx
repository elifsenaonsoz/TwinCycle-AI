"use client";

import { Recommendation } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    BatteryCharging,
    RefreshCcw,
    Rocket,
    Leaf,
    Recycle,
    ArrowRight,
    CheckCircle2,
    ListChecks,
} from "lucide-react";

interface RecommendationCardProps {
    rec: Recommendation;
    isSelected: boolean;
    isRecommended: boolean;
    onSelect: (optionId: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
    "battery-charging": <BatteryCharging className="w-6 h-6" />,
    "refresh-ccw": <RefreshCcw className="w-6 h-6" />,
    rocket: <Rocket className="w-6 h-6" />,
};

const badgeVariantMap: Record<string, string> = {
    "Lowest cost": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Lowest CO₂": "bg-teal-50 text-teal-700 border-teal-200",
    "Top choice": "bg-blue-50 text-blue-700 border-blue-200",
    "Max performance": "bg-orange-50 text-orange-700 border-orange-200",
    "Balanced": "bg-violet-50 text-violet-700 border-violet-200",
};

const badgeLabelMap: Record<string, string> = {
    "Lowest cost": "En Düşük Maliyet",
    "Lowest CO₂": "En Düşük CO₂",
    "Top choice": "Önerilen",
    "Max performance": "En Yüksek Performans",
    "Balanced": "Dengeli",
};

export function RecommendationCard({
    rec,
    isSelected,
    isRecommended,
    onSelect,
}: RecommendationCardProps) {
    const badgeStyle = badgeVariantMap[rec.ui.badge] || "bg-muted text-muted-foreground";
    const badgeLabel = badgeLabelMap[rec.ui.badge] || rec.ui.badge;

    return (
        <Card
            className={`
        relative cursor-pointer transition-all duration-300 border-2 hover:shadow-lg
        ${isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-transparent shadow-sm hover:border-muted-foreground/20"}
      `}
            onClick={() => onSelect(rec.option_id)}
        >
            {isRecommended && (
                <div className="absolute -top-3 left-4">
                    <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        ★ Önerilen
                    </span>
                </div>
            )}

            <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {iconMap[rec.ui.icon] || <Rocket className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="font-semibold text-base">{rec.title}</h3>
                            <p className="text-sm text-muted-foreground">{rec.tagline}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className={`${badgeStyle} text-xs font-medium`}>
                        {badgeLabel}
                    </Badge>
                </div>
                <div className="min-h-5">
                    <Badge
                        variant="outline"
                        aria-hidden={!isSelected}
                        className={`text-[11px] px-2.5 py-0.5 border border-primary/30 text-primary bg-primary/5 transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}
                    >
                        Seçildi
                    </Badge>
                </div>

                {/* Overall Score */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <span className="text-3xl font-bold text-foreground">
                        {Math.round(rec.scores.overall_score * 100)}
                    </span>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Genel Skor</p>
                        <p className="text-xs text-muted-foreground">/100</p>
                    </div>
                </div>

                {/* Score Bars */}
                <div className="space-y-3">
                    <ScoreBar label="Maliyet" value={rec.scores.cost_score} color="bg-emerald-500" />
                    <ScoreBar label="Sürdürülebilirlik" value={rec.scores.sustainability_score} color="bg-blue-500" />
                    <ScoreBar label="Performans" value={rec.scores.performance_score} color="bg-orange-500" />
                </div>

                {/* Estimated Impacts */}
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-muted/30">
                    <ImpactItem
                        icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        label="RUL Kazanımı"
                        value={`${rec.estimated_impacts.rul_gain_months_min}–${rec.estimated_impacts.rul_gain_months_max} ay`}
                    />
                    <ImpactItem
                        icon={<Leaf className="w-4 h-4 text-green-500" />}
                        label="CO₂ Skoru"
                        value={`${Math.round(rec.estimated_impacts.co2_impact_score * 100)}%`}
                    />
                    <ImpactItem
                        icon={<Recycle className="w-4 h-4 text-blue-500" />}
                        label="E-Atık Azaltma"
                        value={`${Math.round(rec.estimated_impacts.ewaste_reduction_score * 100)}%`}
                    />
                </div>

                {/* Why This */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Neden Bu?
                    </p>
                    <ul className="space-y-1.5">
                        {rec.why_this.map((reason, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-emerald-500 mt-0.5">•</span>
                                {reason}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Next Steps */}
                <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                        <ListChecks className="w-3.5 h-3.5" />
                        Sonraki Adımlar
                    </p>
                    <ul className="space-y-1.5">
                        {rec.next_steps.map((step, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <span className="text-xs bg-muted text-muted-foreground w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-medium">
                                    {i + 1}
                                </span>
                                {step}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* CTA */}
                <Button
                    className="w-full mt-1"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(rec.option_id);
                    }}
                >
                    {rec.ui.cta_label}
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </CardContent>
        </Card>
    );
}

function ScoreBar({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-28 shrink-0">{label}</span>
            <div className="flex-1 relative">
                <Progress value={value * 100} className="h-2" />
                <div
                    className={`absolute top-0 left-0 h-full rounded-full ${color} transition-all duration-500`}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
            <span className="text-xs font-medium w-8 text-right">
                {Math.round(value * 100)}
            </span>
        </div>
    );
}

function ImpactItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex flex-col items-center text-center gap-1">
            {icon}
            <span className="text-[10px] text-muted-foreground">{label}</span>
            <span className="text-xs font-semibold">{value}</span>
        </div>
    );
}

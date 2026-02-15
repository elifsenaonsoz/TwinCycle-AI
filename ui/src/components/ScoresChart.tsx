"use client";

import { Recommendation } from "@/types";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
} from "recharts";

interface ScoresChartProps {
    recommendations: Recommendation[];
}

const COLORS = ["#10b981", "#3b82f6", "#f97316"];
const LABELS: Record<string, string> = {
    repair_battery: "Batarya Değişimi",
    refurb_buy: "Yenilenmiş",
    tradein_new: "Yeni Cihaz",
};

export function ScoresChart({ recommendations }: ScoresChartProps) {
    const data = [
        {
            axis: "Maliyet",
            ...Object.fromEntries(
                recommendations.map((r) => [r.option_id, Math.round(r.scores.cost_score * 100)])
            ),
        },
        {
            axis: "Sürdürülebilirlik",
            ...Object.fromEntries(
                recommendations.map((r) => [r.option_id, Math.round(r.scores.sustainability_score * 100)])
            ),
        },
        {
            axis: "Performans",
            ...Object.fromEntries(
                recommendations.map((r) => [r.option_id, Math.round(r.scores.performance_score * 100)])
            ),
        },
    ];

    return (
        <div className="w-full max-w-md mx-auto">
            <h4 className="text-sm font-semibold text-center mb-2 text-muted-foreground">
                Seçenek Karşılaştırması
            </h4>
            <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis
                        dataKey="axis"
                        tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickCount={5}
                    />
                    {recommendations.map((rec, i) => (
                        <Radar
                            key={rec.option_id}
                            name={LABELS[rec.option_id] || rec.title}
                            dataKey={rec.option_id}
                            stroke={COLORS[i % COLORS.length]}
                            fill={COLORS[i % COLORS.length]}
                            fillOpacity={0.12}
                            strokeWidth={2}
                        />
                    ))}
                    <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}

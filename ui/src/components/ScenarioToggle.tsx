"use client";

import { Scenario } from "@/types";

interface ScenarioToggleProps {
    scenario: Scenario;
    onChange: (s: Scenario) => void;
}

export function ScenarioToggle({ scenario, onChange }: ScenarioToggleProps) {
    return (
        <div className="inline-flex flex-col items-end gap-1.5">
            <div className="text-[11px] text-muted-foreground text-right">
                <span className="font-medium text-foreground">Senaryo:</span>{" "}
                A: sürdürülebilirlik • B: bütçe/yoğun kullanım
            </div>
            <div className="inline-flex items-center rounded-xl bg-muted p-1 gap-1 shadow-sm">
                {(["A", "B"] as Scenario[]).map((s) => (
                    <button
                        key={s}
                        onClick={() => onChange(s)}
                        className={`
              min-w-28 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${scenario === s
                                ? "bg-white text-foreground shadow-sm ring-1 ring-border"
                                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                            }
            `}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>
    );
}

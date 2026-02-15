"use client";

import { WizardStep } from "@/types";
import { Check } from "lucide-react";

interface WizardProgressProps {
    currentStep: WizardStep;
    step3Available: boolean;
}

const steps = [
    {
        num: 1 as WizardStep,
        label: "Profil",
        mobileLabel: "Profil",
        description: "Cihaz ve tercih bilgilerini doğrula",
    },
    {
        num: 2 as WizardStep,
        label: "Sonuçlar",
        mobileLabel: "Sonuçlar",
        description: "RUL tahmini ve önerileri incele",
    },
    {
        num: 3 as WizardStep,
        label: "Teşvik",
        mobileLabel: "Teşvik",
        description: "Teşvik paketini seç ve özet oluştur",
    },
];

export function WizardProgress({ currentStep, step3Available }: WizardProgressProps) {
    return (
        <div className="flex items-center justify-center w-full max-w-3xl mx-auto py-8">
            {steps.map((step, index) => {
                const isActive = currentStep === step.num;
                const isCompleted = currentStep > step.num;
                const isDisabled = step.num === 3 && !step3Available;

                return (
                    <div key={step.num} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted ? "bg-emerald-500 text-white" : ""}
                  ${isActive ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : ""}
                  ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
                  ${isDisabled ? "opacity-40" : ""}
                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : step.num}
                            </div>
                            <span
                                className={`text-xs whitespace-nowrap ${isActive ? "text-foreground font-semibold" : "text-muted-foreground font-medium"
                                    } ${isDisabled ? "opacity-40" : ""}`}
                            >
                                <span className="hidden sm:inline">{step.label}</span>
                                <span className="sm:hidden">{step.mobileLabel}</span>
                            </span>
                            <span
                                className={`hidden sm:block text-[11px] leading-tight text-center max-w-28 ${isActive ? "text-foreground/80 font-medium" : "text-muted-foreground"
                                    } ${isDisabled ? "opacity-40" : ""}`}
                            >
                                {isActive ? step.description : " "}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div
                                className={`h-[2px] flex-1 mx-4 mt-[-1.5rem] transition-all duration-300 ${currentStep > step.num ? "bg-emerald-500" : "bg-muted"
                                    }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

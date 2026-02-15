"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Battery, Activity, RotateCcw, Gauge } from "lucide-react";

interface ProfileFormProps {
  onEvaluate: () => void;
}

interface FormState {
  brand: string;
  model: string;
  ageMonths: string;
  batteryHealth: string;
  chargeCycles: string;
  frameDropRate: string;
  repairHistory: string;
  budgetPriority: "low" | "medium" | "high";
  sustainabilityPriority: "low" | "medium" | "high";
  performancePriority: "low" | "medium" | "high";
  prefersFinancing: boolean;
}

const initialState: FormState = {
  brand: "",
  model: "",
  ageMonths: "",
  batteryHealth: "",
  chargeCycles: "",
  frameDropRate: "",
  repairHistory: "",
  budgetPriority: "medium",
  sustainabilityPriority: "medium",
  performancePriority: "medium",
  prefersFinancing: false,
};

export function ProfileForm({ onEvaluate }: ProfileFormProps) {
  const [form, setForm] = useState<FormState>(initialState);

  const isFormValid = useMemo(() => {
    const required = [
      form.brand,
      form.model,
      form.ageMonths,
      form.batteryHealth,
      form.chargeCycles,
      form.frameDropRate,
      form.repairHistory,
    ];
    return required.every((v) => v.trim().length > 0);
  }, [
    form.ageMonths,
    form.batteryHealth,
    form.brand,
    form.chargeCycles,
    form.frameDropRate,
    form.model,
    form.repairHistory,
  ]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">Profil Bilgileri</h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Cihaz durumunu ve önceliklerinizi paylaşın.
          Sistem bu profile göre en uygun öneri kartlarını oluşturur.
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cihaz Bilgisi</CardTitle>
          <CardDescription>Marka/model ve temel durum alanlarını girin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            label="Marka"
            id="device_brand"
            type="text"
            placeholder="Apple"
            value={form.brand}
            onChange={(value) => setForm((prev) => ({ ...prev, brand: value }))}
            icon={<Smartphone className="w-4 h-4" />}
          />
          <InputField
            label="Model"
            id="device_model"
            type="text"
            placeholder="iPhone 13"
            value={form.model}
            onChange={(value) => setForm((prev) => ({ ...prev, model: value }))}
            icon={<Smartphone className="w-4 h-4" />}
          />
          <InputField
            label="Cihaz Yaşı (ay)"
            id="device_age_months"
            type="number"
            placeholder="24"
            value={form.ageMonths}
            onChange={(value) => setForm((prev) => ({ ...prev, ageMonths: value }))}
            icon={<Smartphone className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kullanım Sinyalleri</CardTitle>
          <CardDescription>RUL tahmini için gerekli sinyalleri tamamlayın.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Batarya Sağlığı (%)"
            id="battery_health_percent"
            type="number"
            placeholder="85"
            value={form.batteryHealth}
            onChange={(value) => setForm((prev) => ({ ...prev, batteryHealth: value }))}
            icon={<Battery className="w-4 h-4" />}
          />
          <InputField
            label="Şarj Döngüsü"
            id="charge_cycles"
            type="number"
            placeholder="500"
            value={form.chargeCycles}
            onChange={(value) => setForm((prev) => ({ ...prev, chargeCycles: value }))}
            icon={<Activity className="w-4 h-4" />}
          />
          <InputField
            label="Takılma Oranı"
            id="frame_drop_rate"
            type="number"
            placeholder="0.05"
            step="0.01"
            value={form.frameDropRate}
            onChange={(value) => setForm((prev) => ({ ...prev, frameDropRate: value }))}
            icon={<Gauge className="w-4 h-4" />}
          />
          <InputField
            label="Onarım Geçmişi"
            id="repair_history_count"
            type="number"
            placeholder="0"
            value={form.repairHistory}
            onChange={(value) => setForm((prev) => ({ ...prev, repairHistory: value }))}
            icon={<RotateCcw className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Öncelikler</CardTitle>
          <CardDescription>Karar motorunun ağırlıklarını belirleyin.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectField
            label="Bütçe Önceliği"
            id="budget_priority"
            value={form.budgetPriority}
            onChange={(value) =>
              setForm((prev) => ({ ...prev, budgetPriority: value as FormState["budgetPriority"] }))
            }
            options={["low", "medium", "high"]}
          />
          <SelectField
            label="Sürdürülebilirlik Önceliği"
            id="sustainability_priority"
            value={form.sustainabilityPriority}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                sustainabilityPriority: value as FormState["sustainabilityPriority"],
              }))
            }
            options={["low", "medium", "high"]}
          />
          <SelectField
            label="Performans Önceliği"
            id="performance_priority"
            value={form.performancePriority}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                performancePriority: value as FormState["performancePriority"],
              }))
            }
            options={["low", "medium", "high"]}
          />
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Finansman Tercihi</label>
            <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border px-3 py-2">
              <input
                type="checkbox"
                id="prefers_financing"
                checked={form.prefersFinancing}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, prefersFinancing: e.target.checked }))
                }
                className="w-4 h-4 rounded border-input accent-primary"
              />
              <span className="text-sm text-muted-foreground">Taksitli ödeme tercih ederim</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col items-end gap-1">
        <Button
          size="lg"
          disabled={!isFormValid}
          onClick={onEvaluate}
          className="px-8"
        >
          Sonuçları Gör
          <span className="ml-2">→</span>
        </Button>
        {!isFormValid && (
          <p className="text-[11px] text-muted-foreground">Devam için zorunlu alanları doldur.</p>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  id,
  type,
  placeholder,
  step,
  icon,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  step?: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          step={step}
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm
            placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
            transition-all"
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  id,
  options,
  value,
  onChange,
}: {
  label: string;
  id: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1
          transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

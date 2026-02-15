"use client";

import { useEffect, useMemo, useState } from "react";
import { IncentivePackage, IncentiveResponse, Recommendation, Scenario } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Banknote,
    Leaf,
    Layers,
    ArrowLeft,
    Sparkles,
    CheckCircle2,
    Gift,
} from "lucide-react";

interface CarbonBargainingProps {
  scenario: Scenario;
  selectedRecommendation: Recommendation | null;
  onBack: () => void;
}

const iconMap: Record<IncentivePackage["package_id"], React.ReactNode> = {
  cash: <Banknote className="w-6 h-6" />,
  carbon_points: <Leaf className="w-6 h-6" />,
  hybrid: <Layers className="w-6 h-6" />,
};

const colorMap: Record<IncentivePackage["package_id"], string> = {
  cash: "text-emerald-600 bg-emerald-50",
  carbon_points: "text-green-600 bg-green-50",
  hybrid: "text-violet-600 bg-violet-50",
};

export function CarbonBargaining({
  scenario,
  selectedRecommendation,
  onBack,
}: CarbonBargainingProps) {
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [incentiveData, setIncentiveData] = useState<IncentiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const file = scenario === "A" ? "incentive_A.json" : "incentive_B.json";
    let mounted = true;

    async function fetchIncentive() {
      setLoading(true);
      setError(null);
      setSelectedPkg(null);
      try {
        const res = await fetch(`/demo_outputs/${file}`);
        if (!res.ok) {
          throw new Error(`Teşvik verisi yüklenemedi (HTTP ${res.status})`);
        }
        const json: IncentiveResponse = await res.json();
        if (mounted) {
          setIncentiveData(json);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Teşvik verisi okunamadı");
          setIncentiveData(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchIncentive();
    return () => {
      mounted = false;
    };
  }, [scenario]);

  const selectedPackage = useMemo(
    () => incentiveData?.packages.find((p) => p.package_id === selectedPkg) || null,
    [incentiveData, selectedPkg]
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium">
          <Gift className="w-4 h-4" />
          Teşvik Paketleri
        </div>
        <h2 className="text-xl font-bold">Karbon Pazarlığı</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Eski cihazınızın değerini nasıl almak istersiniz? Size en uygun paketi seçin.
        </p>
      </div>

      {loading && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Teşvik teklifleri yükleniyor...
          </CardContent>
        </Card>
      )}

      {error && !loading && (
        <Card>
          <CardContent className="p-6 text-sm text-red-600">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && incentiveData && (
        <>
          {/* Global incentive scores */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/40 to-muted/10">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Kabul Olasılığı</p>
                  <p className="text-xl font-bold">{Math.round(incentiveData.accept_score * 100)}/100</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Teklifin bu profile uygunluğu</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Çevresel Etki</p>
                  <p className="text-xl font-bold">{Math.round(incentiveData.impact_score * 100)}/100</p>
                  <p className="text-[11px] text-muted-foreground mt-1">Karbon/e-atık fayda tahmini</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Package Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {incentiveData.packages.map((pkg) => {
              const isSelected = selectedPkg === pkg.package_id;
              return (
                <Card
                  key={pkg.package_id}
                  className={`
                group cursor-pointer transition-all duration-300 border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
                ${isSelected ? "border-primary shadow-lg ring-2 ring-primary/20" : "border-transparent shadow-sm hover:shadow-md hover:border-muted-foreground/20"}
              `}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedPkg(pkg.package_id)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" ||
                      e.key === " " ||
                      e.code === "Space" ||
                      e.key === "Spacebar"
                    ) {
                      e.preventDefault();
                      setSelectedPkg(pkg.package_id);
                    }
                  }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className={`p-3 rounded-xl w-fit ${colorMap[pkg.package_id]}`}>
                      {iconMap[pkg.package_id]}
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-base">{pkg.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                      </div>
                      <Badge
                        variant="outline"
                        aria-hidden={!isSelected}
                        className={`text-[11px] px-2.5 py-0.5 shrink-0 border border-primary/30 text-primary bg-primary/5 transition-opacity ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        Seçili
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {pkg.ui.badge}
                    </Badge>
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Teklif Değeri</p>
                      <p className="text-sm font-medium">{formatPackageValue(pkg.value)}</p>
                    </div>
                    <div className="pt-2">
                      <div
                        tabIndex={0}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none ${
                          isSelected
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted/60 text-muted-foreground border border-border shadow-sm group-hover:bg-muted/80 group-hover:text-foreground group-hover:border-foreground/20 group-hover:shadow"
                        }`}
                      >
                        {pkg.ui.cta_label}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notlar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {incentiveData.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    {note}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Summary Card */}
          {selectedPkg && selectedRecommendation && (
            <Card className="border-0 shadow-sm bg-gradient-to-br from-muted/40 to-muted/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Özet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Seçilen Opsiyon</span>
                  <span className="font-medium">{selectedRecommendation.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Teşvik Paketi</span>
                  <span className="font-medium">{selectedPackage?.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kabul Olasılığı</span>
                  <span className="font-medium">{Math.round(incentiveData.accept_score * 100)}/100</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Çevresel Etki</span>
                  <span className="font-medium">{Math.round(incentiveData.impact_score * 100)}/100</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri
            </Button>
            <div className="flex flex-col items-end gap-1">
              <Button
                size="lg"
                disabled={!selectedPkg}
                onClick={() => setShowDialog(true)}
                className="px-8"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Teklif Oluştur
              </Button>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {selectedPkg
                  ? "Seçiminize göre teklif özetini oluşturacağız."
                  : "Devam etmek için bir paket seç."}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Summary Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Teklif Özeti
            </DialogTitle>
            <DialogDescription>
              Seçimlerinize göre oluşturulmuş teklif detayları
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedRecommendation && incentiveData && (
              <div className="space-y-3">
                <SummaryRow label="Seçilen Paket" value={selectedPackage?.title || "—"} />
                <SummaryRow
                  label="Seçilen Opsiyon"
                  value={selectedRecommendation.title || selectedRecommendation.option_id}
                />
                <SummaryRow
                  label="Kabul Olasılığı"
                  value={`${Math.round(incentiveData.accept_score * 100)}/100`}
                />
                <SummaryRow
                  label="Çevresel Etki"
                  value={`${Math.round(incentiveData.impact_score * 100)}/100`}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Kapat
            </Button>
            <Button onClick={() => setShowDialog(false)}>Teklifi Onayla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function formatPackageValue(value: {
  cash_amount_try: number | null;
  carbon_points: number | null;
  perk: "donation" | "tree" | "extra_data" | "none";
}): string {
  const perkLabelMap = {
    donation: "Bağış",
    tree: "Fidan",
    extra_data: "Ek Data",
    none: "",
  } as const;

  const chunks: string[] = [];
  if (typeof value.cash_amount_try === "number") {
    chunks.push(`${value.cash_amount_try.toLocaleString("tr-TR")} ₺`);
  }
  if (typeof value.carbon_points === "number") {
    chunks.push(`${value.carbon_points.toLocaleString("tr-TR")} Karbon Puanı`);
  }
  if (value.perk !== "none") {
    const perkLabel = perkLabelMap[value.perk];
    if (perkLabel) {
      chunks.push(perkLabel);
    }
  }
  return chunks.length ? chunks.join(" • ") : "—";
}

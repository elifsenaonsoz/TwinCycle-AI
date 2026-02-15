"use client";

import { Card, CardContent } from "@/components/ui/card";

export function LoadingSkeleton() {
    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="text-center space-y-1">
                <p className="text-sm font-medium">Analiz hazırlanıyor</p>
                <p className="text-xs text-muted-foreground">
                    Sinyaller işleniyor, öneri kartları oluşturuluyor...
                </p>
            </div>
            {/* Header skeleton */}
            <div className="flex justify-center">
                <div className="h-10 w-48 bg-muted rounded-lg" />
            </div>

            {/* Progress skeleton */}
            <div className="flex justify-center gap-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted" />
                        <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* Card skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-0 shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-muted" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 w-3/4 bg-muted rounded" />
                                    <div className="h-3 w-1/2 bg-muted rounded" />
                                </div>
                            </div>
                            <div className="h-16 bg-muted rounded-lg" />
                            <div className="space-y-2">
                                <div className="h-2 bg-muted rounded w-full" />
                                <div className="h-2 bg-muted rounded w-full" />
                                <div className="h-2 bg-muted rounded w-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-2/3" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                            </div>
                            <div className="h-10 bg-muted rounded-lg" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-center space-y-1">
                <p className="text-sm font-medium">Veri yüklenirken bir sorun oluştu</p>
                <p className="text-muted-foreground text-sm">{message}</p>
            </div>
            <button
                onClick={onRetry}
                className="text-sm font-medium text-primary hover:underline"
            >
                Tekrar dene
            </button>
        </div>
    );
}

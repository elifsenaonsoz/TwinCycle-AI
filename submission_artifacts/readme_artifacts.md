# Submission Artifacts — TwinCycle AI

Bu klasör, Turkcell "Yarının Teknoloji Liderleri" başvuru formunun
**Pilot Uygulamalar** ve **Ekler** alanları için gerekli tüm kanıtları içerir.

## Klasör Yapısı

```
submission_artifacts/
├── screenshots/
│   ├── 01_profil_formu.png        — Adım 1: Cihaz profil giriş ekranı
│   ├── 02_ai_sonuclar.png         — Adım 2: AI sonuç kartları (RUL + 3 öneri)
│   ├── 03_tesvik_akisi.png        — Adım 3: Teşvik paketleri + Onay
│   ├── 04_senaryo_1_sonuc.png     — Senaryo 1: Sustainability ağırlıklı sonuç
│   ├── 05_senaryo_2_sonuc.png     — Senaryo 2: Performance ağırlıklı sonuç
│   └── 06_skor_karsilastirma.png  — Seçenek bazlı skor karşılaştırma grafiği
├── api_samples/
│   ├── senaryo_1_sustainability.json  — Sustainability ağırlıklı /assess çıktısı
│   └── senaryo_2_performance.json     — Performance ağırlıklı /assess çıktısı
├── architecture/
│   └── mimari_diyagram.png        — Tek sayfa mimari akış diyagramı
└── readme_artifacts.md            — Bu dosya
```

## Senaryo Özeti

| Senaryo | Profil | Öneri | RUL Aralığı | Confidence |
|---------|--------|-------|-------------|------------|
| 1 – Sustainability | Samsung Galaxy S21, 36 ay, sürd. yüksek | Batarya Değişimi (repair_battery) | 4–13 ay | medium (0.44) |
| 2 – Performance | Apple iPhone 14, 24 ay, perf. yüksek | Refurbished Cihaz (refurb_buy) | 10–18 ay | medium-high (0.61) |

## Kanıt Karşılık Tablosu

| Ek # | Dosya Adı | İçerik | Neyi Kanıtlıyor? |
|------|-----------|--------|-------------------|
| 1 | `01_profil_formu.png` | Cihaz profil giriş ekranı | Kullanıcı arayüzü ve girdi toplama akışı |
| 2 | `02_ai_sonuclar.png` | AI sonuç ekranı (RUL + confidence + 3 kart) | Karar destek çıktılarının görsel sunumu |
| 3 | `03_tesvik_akisi.png` | Teşvik paketleri ekranı | Trade-in teşvik akışı (nakit/karbon/hibrit) |
| 4 | `04_senaryo_1_sonuc.png` | Senaryo 1 sonuç ekranı | Sustainability ağırlıklı demo test kanıtı |
| 5 | `05_senaryo_2_sonuc.png` | Senaryo 2 sonuç ekranı | Performance ağırlıklı demo test kanıtı |
| 6 | `06_skor_karsilastirma.png` | Skor karşılaştırma grafiği / radar | Çok boyutlu karar desteğinin görselleştirilmesi |
| 7 | `senaryo_1_sustainability.json` | /assess JSON çıktısı – Senaryo 1 | API sözleşme uyumu ve gerçek model çıktısı |
| 8 | `senaryo_2_performance.json` | /assess JSON çıktısı – Senaryo 2 | Farklı profillerle adaptif sonuç üretimi |
| 9 | `mimari_diyagram.png` | Tek sayfa mimari akış (UI→Engine→Outputs) | Teknik mimari ve Phase-2 yol haritası |

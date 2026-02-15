# Contract-Driven MVP Skeleton
Bu proje, cihaz değerlendirme ve teşvik önerisi akışını sözleşme (contract) odaklı başlatır.
Amaç, backend ve UI ekiplerinin aynı JSON sözleşmeleri üzerinden paralel ilerlemesidir.
Ekran 1: Assess sonucu ile RUL tahmini, özet karar ve 3 öneri kartı gösterilir.
Ekran 2: Kullanıcı bir kart seçer; seçime göre incentive paketleri listelenir.
Ekran 3: Paket onayı sonrası etki özeti ve yasal bilgilendirme sunulur.
Yaklaşım: Önce contracts/, sonra core mantığı, en son UI entegrasyonu geliştirilir.
- Single Source of Truth: contracts/
D1 planı: JSON senaryoları ile `core/demo_outputs/` altında hızlı uçtan uca doğrulama yapılır.
D1 kapsamında iş kuralları stub fonksiyonlar ve deterministik örnek çıktılarla test edilir.
Standart notu: `rul_estimate.key_drivers` alanı feature isimleri listesi olarak sabittir.
UI notu: Feature isimleri kullanıcıya etiketli adlarla gösterilir (Batarya Sağlığı, Şarj Döngüsü, Cihaz Yaşı).
Standart notu: `confidence` string alanı serbesttir ve analitik bağlam için taşınır.
UI notu: Confidence rozeti `confidence_score` üzerinden sınıflandırılır, `confidence` metninden türetilmez.
D2 planı: FastAPI ile `/assess` ve `/incentive` endpointleri sözleşmelere birebir bağlanır.
D2 kapsamında şema validasyonu, request_id izlenebilirliği ve model_version yönetimi eklenir.
UI klasörü şimdilik placeholder durumundadır; entegrasyon D2 sonrası açılacaktır.

"""Generate two custom scenarios for Turkcell submission."""

import json
import pathlib
from engine import assess_logic

OUT = pathlib.Path(__file__).resolve().parent.parent / "submission_artifacts" / "api_samples"
OUT.mkdir(parents=True, exist_ok=True)

# --- Senaryo-1 (sustainability ağırlıklı) ---
# Kullanıcı girdileri:
#   age_months: 36, battery_score: 4 (~60%), heat_score: 2, performance_score: 3
#   usage_intensity: 3, priority: sustainability, wipe_anxiety: 4
scenario_1_input = {
    "device": {"brand": "Samsung", "model": "Galaxy S21", "age_months": 36},
    "signals": {
        "battery_health_percent": 60,   # battery_score 4 → düşük sağlık
        "charge_cycles": 900,           # yüksek kullanım yoğunluğu
        "frame_drop_rate": 0.15,        # orta performans sorunu
        "repair_history_count": 1,
    },
    "user_preferences": {
        "budget_priority": "medium",
        "sustainability_priority": "high",    # priority: sustainability
        "performance_priority": "medium",
        "prefers_financing": False,
    },
}

# --- Senaryo-2 (performance ağırlıklı) ---
# Kullanıcı girdileri:
#   age_months: 24, battery_score: 2 (~80%), heat_score: 2, performance_score: 5
#   usage_intensity: 5, priority: performance, wipe_anxiety: 2
scenario_2_input = {
    "device": {"brand": "Apple", "model": "iPhone 14", "age_months": 24},
    "signals": {
        "battery_health_percent": 80,   # battery_score 2 → iyi ama bkz. performans
        "charge_cycles": 650,           # yoğun kullanım
        "frame_drop_rate": 0.22,        # performans_score 5 → ciddi sorun
        "repair_history_count": 0,
    },
    "user_preferences": {
        "budget_priority": "medium",
        "sustainability_priority": "low",
        "performance_priority": "high",       # priority: performance
        "prefers_financing": True,
    },
}

s1 = assess_logic(scenario_1_input)
s2 = assess_logic(scenario_2_input)

(OUT / "senaryo_1_sustainability.json").write_text(
    json.dumps(s1, ensure_ascii=False, indent=2) + "\n"
)
(OUT / "senaryo_2_performance.json").write_text(
    json.dumps(s2, ensure_ascii=False, indent=2) + "\n"
)

print("=== Senaryo 1 – Sustainability Ağırlıklı ===")
print(f"  RUL: {s1['rul_estimate']['rul_months_min']}-{s1['rul_estimate']['rul_months_max']} ay")
print(f"  Confidence: {s1['rul_estimate']['confidence']} ({s1['rul_estimate']['confidence_score']})")
print(f"  Önerilen: {s1['decision_summary']['recommended_primary_option_id']}")
print(f"  Rationale: {s1['decision_summary']['rationale'][:120]}...")

print()
print("=== Senaryo 2 – Performance Ağırlıklı ===")
print(f"  RUL: {s2['rul_estimate']['rul_months_min']}-{s2['rul_estimate']['rul_months_max']} ay")
print(f"  Confidence: {s2['rul_estimate']['confidence']} ({s2['rul_estimate']['confidence_score']})")
print(f"  Önerilen: {s2['decision_summary']['recommended_primary_option_id']}")
print(f"  Rationale: {s2['decision_summary']['rationale'][:120]}...")

print()
print(f"Dosyalar kaydedildi: {OUT}")

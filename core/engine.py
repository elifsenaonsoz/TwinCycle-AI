"""Contract-driven assess engine."""

from __future__ import annotations

import hashlib
import json
import math
import random
from datetime import datetime, timezone
from typing import Any


MODEL_VERSION = "mvp-contract-v1.0.0"


def clamp(value: float, min_value: float, max_value: float) -> float:
    """Clamp a numeric value into [min_value, max_value]."""
    return max(min_value, min(max_value, value))


def map_priority(priority: str) -> float:
    """Map textual priority level into numeric weight."""
    mapping = {"low": 1.0, "medium": 2.0, "high": 3.0}
    if priority not in mapping:
        raise ValueError(f"Invalid priority: {priority}")
    return mapping[priority]


def _stable_seed(payload: dict[str, Any]) -> int:
    """Create a deterministic seed from input payload."""
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True)
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def _validate_input_payload(input_payload: dict[str, Any]) -> None:
    """Validate required input structure and numeric ranges."""
    required_top = {"device", "signals", "user_preferences"}
    if not isinstance(input_payload, dict) or not required_top.issubset(input_payload.keys()):
        raise ValueError("input_payload must include device, signals, user_preferences")

    device = input_payload["device"]
    signals = input_payload["signals"]
    prefs = input_payload["user_preferences"]

    for key in ("brand", "model"):
        if not isinstance(device.get(key), str) or not device[key]:
            raise ValueError(f"device.{key} must be non-empty string")
    if not isinstance(device.get("age_months"), int) or device["age_months"] < 0:
        raise ValueError("device.age_months must be int >= 0")

    if not isinstance(signals.get("battery_health_percent"), int):
        raise ValueError("signals.battery_health_percent must be int")
    if not 0 <= signals["battery_health_percent"] <= 100:
        raise ValueError("signals.battery_health_percent must be in [0, 100]")
    if not isinstance(signals.get("charge_cycles"), int) or signals["charge_cycles"] < 0:
        raise ValueError("signals.charge_cycles must be int >= 0")
    if not isinstance(signals.get("frame_drop_rate"), (int, float)):
        raise ValueError("signals.frame_drop_rate must be float")
    if not 0 <= float(signals["frame_drop_rate"]) <= 1:
        raise ValueError("signals.frame_drop_rate must be in [0, 1]")
    if not isinstance(signals.get("repair_history_count"), int) or signals["repair_history_count"] < 0:
        raise ValueError("signals.repair_history_count must be int >= 0")

    for key in ("budget_priority", "sustainability_priority", "performance_priority"):
        if prefs.get(key) not in {"low", "medium", "high"}:
            raise ValueError(f"user_preferences.{key} must be low|medium|high")
    if not isinstance(prefs.get("prefers_financing"), bool):
        raise ValueError("user_preferences.prefers_financing must be bool")


def _compute_rul_and_confidence(input_payload: dict[str, Any]) -> tuple[dict[str, Any], float, float]:
    """Compute RUL estimate, confidence and base RUL point from heuristics."""
    device = input_payload["device"]
    signals = input_payload["signals"]

    age_months = device["age_months"]
    battery_health_percent = signals["battery_health_percent"]
    charge_cycles = signals["charge_cycles"]
    frame_drop_rate = float(signals["frame_drop_rate"])
    repair_history_count = signals["repair_history_count"]

    rul_point = 24.0
    rul_point -= clamp(age_months / 6.0, 0.0, 12.0)
    rul_point -= (100 - battery_health_percent) / 10.0
    rul_point -= charge_cycles / 400.0
    rul_point -= frame_drop_rate * 10.0
    rul_point -= repair_history_count * 1.5
    rul_point = clamp(rul_point, 1.0, 30.0)

    risk = (
        age_months / 48.0
        + ((100 - battery_health_percent) / 60.0)
        + (charge_cycles / 1200.0)
        + (frame_drop_rate / 0.4)
        + (repair_history_count / 4.0)
    )
    confidence_score = clamp(1.0 - (risk / 5.0), 0.35, 0.9)

    if confidence_score >= 0.8:
        confidence = "high"
    elif confidence_score >= 0.6:
        confidence = "medium-high"
    else:
        confidence = "medium"

    margin = 2.0 + (1.0 - confidence_score) * 4.0
    rul_min = int(max(1, math.floor(rul_point - margin)))
    rul_max = int(min(30, math.ceil(rul_point + margin)))

    contributions = {
        "battery_health_percent": (100 - battery_health_percent) / 60.0,
        "charge_cycles": charge_cycles / 1200.0,
        "frame_drop_rate": frame_drop_rate / 0.4,
        "repair_history_count": repair_history_count / 4.0,
        "device_age_months": age_months / 48.0,
    }
    key_drivers = [
        name
        for name, _ in sorted(contributions.items(), key=lambda item: item[1], reverse=True)[:3]
    ]

    rul_estimate = {
        "rul_months_min": rul_min,
        "rul_months_max": rul_max,
        "confidence": confidence,
        "confidence_score": round(confidence_score, 2),
        # key_drivers is a feature-name list for direct UI labeling.
        "key_drivers": key_drivers,
    }
    return rul_estimate, confidence_score, rul_point


def _build_estimated_impacts(rng: random.Random) -> dict[str, dict[str, Any]]:
    """Create deterministic-but-varied estimated impacts for each option."""
    repair_min = rng.randint(8, 12)
    repair_max = min(16, repair_min + rng.randint(4, 6))

    refurb_min = rng.randint(16, 22)
    refurb_max = min(30, refurb_min + rng.randint(6, 9))

    tradein_min = rng.randint(28, 35)
    tradein_max = min(45, tradein_min + rng.randint(8, 12))

    return {
        "repair_battery": {
            "rul_gain_months_min": repair_min,
            "rul_gain_months_max": repair_max,
            "co2_impact_score": round(rng.uniform(0.82, 0.93), 2),
            "ewaste_reduction_score": round(rng.uniform(0.80, 0.92), 2),
        },
        "refurb_buy": {
            "rul_gain_months_min": refurb_min,
            "rul_gain_months_max": refurb_max,
            "co2_impact_score": round(rng.uniform(0.69, 0.82), 2),
            "ewaste_reduction_score": round(rng.uniform(0.62, 0.78), 2),
        },
        "tradein_new": {
            "rul_gain_months_min": tradein_min,
            "rul_gain_months_max": tradein_max,
            "co2_impact_score": round(rng.uniform(0.45, 0.62), 2),
            "ewaste_reduction_score": round(rng.uniform(0.35, 0.55), 2),
        },
    }


def _compute_option_scores(input_payload: dict[str, Any]) -> dict[str, dict[str, float]]:
    """Compute cost/sustainability/performance and weighted overall scores."""
    signals = input_payload["signals"]
    prefs = input_payload["user_preferences"]
    age_months = input_payload["device"]["age_months"]

    battery = signals["battery_health_percent"]
    charge = signals["charge_cycles"]
    frame = float(signals["frame_drop_rate"])
    repairs = signals["repair_history_count"]

    heavy_usage = clamp((charge / 1200.0 + frame / 0.4 + repairs / 4.0) / 3.0, 0.0, 1.2)
    battery_degradation = clamp((100 - battery) / 100.0, 0.0, 1.0)

    repair_cost = clamp(0.90 - max(age_months - 24, 0) * 0.002, 0.75, 0.95)
    repair_sust = clamp(0.90 - max(repairs - 1, 0) * 0.03, 0.75, 0.95)
    repair_perf = clamp(0.66 - heavy_usage * 0.10 - battery_degradation * 0.06, 0.42, 0.74)

    refurb_cost = clamp(0.72 - heavy_usage * 0.04, 0.58, 0.80)
    refurb_sust = clamp(0.78 - heavy_usage * 0.03, 0.65, 0.85)
    refurb_perf = clamp(0.81 + heavy_usage * 0.07, 0.70, 0.92)

    tradein_cost = 0.48 + (0.10 if prefs["prefers_financing"] else 0.0) - heavy_usage * 0.02
    tradein_cost = clamp(tradein_cost, 0.35, 0.68)
    tradein_sust = clamp(0.58 - heavy_usage * 0.04, 0.40, 0.70)
    tradein_perf = clamp(0.93 + heavy_usage * 0.03, 0.90, 0.99)

    weights = {
        "cost": map_priority(prefs["budget_priority"]),
        "sust": map_priority(prefs["sustainability_priority"]),
        "perf": map_priority(prefs["performance_priority"]),
    }
    total_weight = weights["cost"] + weights["sust"] + weights["perf"]
    weights = {k: v / total_weight for k, v in weights.items()}

    def overall(cost: float, sust: float, perf: float) -> float:
        return round(
            cost * weights["cost"] + sust * weights["sust"] + perf * weights["perf"],
            2,
        )

    return {
        "repair_battery": {
            "cost_score": round(repair_cost, 2),
            "sustainability_score": round(repair_sust, 2),
            "performance_score": round(repair_perf, 2),
            "overall_score": overall(repair_cost, repair_sust, repair_perf),
        },
        "refurb_buy": {
            "cost_score": round(refurb_cost, 2),
            "sustainability_score": round(refurb_sust, 2),
            "performance_score": round(refurb_perf, 2),
            "overall_score": overall(refurb_cost, refurb_sust, refurb_perf),
        },
        "tradein_new": {
            "cost_score": round(tradein_cost, 2),
            "sustainability_score": round(tradein_sust, 2),
            "performance_score": round(tradein_perf, 2),
            "overall_score": overall(tradein_cost, tradein_sust, tradein_perf),
        },
    }


def _build_recommendations(
    input_payload: dict[str, Any],
    scores: dict[str, dict[str, float]],
    impacts: dict[str, dict[str, Any]],
    recommended_option_id: str,
) -> list[dict[str, Any]]:
    """Build RecommendationCardV1-compatible recommendation cards."""
    prefs = input_payload["user_preferences"]

    repair_badge = "Lowest CO₂" if prefs["sustainability_priority"] == "high" else "Lowest cost"
    refurb_badge = "Top choice" if recommended_option_id == "refurb_buy" else "Balanced"

    recommendations = [
        {
            "option_id": "repair_battery",
            "title": "Batarya Değişimi",
            "tagline": "Düşük maliyetle hızlı iyileştirme",
            "category": "repair",
            "why_this": [
                "Başlangıç maliyeti en düşük seçenektir.",
                "Cihazı elde tutarak e-atık etkisini azaltır.",
                "Servis süresi kısa olduğu için geçiş maliyeti düşüktür.",
            ],
            "scores": scores["repair_battery"],
            "estimated_impacts": impacts["repair_battery"],
            "assumptions": [
                "Yetkili serviste parça stoğu mevcuttur.",
                "Ekran ve anakart tarafında ek arıza yoktur.",
                "Kullanım profili benzer seviyede kalacaktır.",
            ],
            "next_steps": [
                "Servis randevusu oluştur.",
                "Veri yedeğini al.",
                "Parça ve işçilik teklifini onayla.",
                "Değişim sonrası sağlık raporunu doğrula.",
            ],
            "ui": {
                "cta_label": "Servis planla",
                "badge": repair_badge,
                "icon": "battery-charging",
            },
            "triggers": {"open_incentive_flow": False},
        },
        {
            "option_id": "refurb_buy",
            "title": "Refurbished Cihaz Al",
            "tagline": "Dengeli maliyet ve performans",
            "category": "refurb",
            "why_this": [
                "Yeni cihaza göre daha düşük toplam maliyetle güncel performans sunar.",
                "Yenilenmiş ürün tercihi çevresel etkiyi dengeler.",
                "Orta-uzun vadede stabil kullanım ömrü sağlar.",
            ],
            "scores": scores["refurb_buy"],
            "estimated_impacts": impacts["refurb_buy"],
            "assumptions": [
                "A kalite yenilenmiş stok mevcuttur.",
                "Minimum 12 ay garanti sağlanır.",
            ],
            "next_steps": [
                "Uygun model ve kapasiteyi seç.",
                "Garanti ve iade koşullarını doğrula.",
                "Eski cihazdan veri transfer planını oluştur.",
            ],
            "ui": {
                "cta_label": "Refurb seçenekleri",
                "badge": refurb_badge,
                "icon": "refresh-ccw",
            },
            "triggers": {"open_incentive_flow": False},
        },
        {
            "option_id": "tradein_new",
            "title": "Eskiyi Ver, Yeniye Geç",
            "tagline": "En yüksek performans ve en uzun ömür",
            "category": "trade_in",
            "why_this": [
                "Donanım sıçramasıyla en yüksek performans seviyesini sağlar.",
                "Yoğun kullanımda en uzun RUL kazanımını üretir.",
                "Trade-in ve finansman seçenekleri başlangıç maliyetini dengeleyebilir.",
            ],
            "scores": scores["tradein_new"],
            "estimated_impacts": impacts["tradein_new"],
            "assumptions": [
                "Trade-in kampanyası aktiftir.",
                "Seçilen model stokta mevcuttur.",
                "Finansman uygunluğu kontrolü başarılıdır.",
            ],
            "next_steps": [
                "Trade-in değerini hesapla.",
                "Teşvik ve finansman seçeneklerini karşılaştır.",
                "Sipariş ve teslimat planını onayla.",
            ],
            "ui": {
                "cta_label": "Teşvikleri gör",
                "badge": "Max performance",
                "icon": "rocket",
            },
            "triggers": {"open_incentive_flow": True},
        },
    ]

    return recommendations


def _build_rationale(
    recommended_option_id: str,
    input_payload: dict[str, Any],
    rul_estimate: dict[str, Any],
) -> str:
    """Build concise 1-2 sentence rationale based on winner and inputs."""
    prefs = input_payload["user_preferences"]
    signals = input_payload["signals"]

    if recommended_option_id == "repair_battery":
        rationale = (
            "Bütçe ve sürdürülebilirlik dengesi mevcut cihaz üzerinde onarımı öne çıkarıyor; "
            f"batarya sağlığı %{signals['battery_health_percent']} ve RUL aralığı "
            f"{rul_estimate['rul_months_min']}-{rul_estimate['rul_months_max']} ay olduğu için "
            "batarya yenileme güçlü bir kısa-orta vade iyileştirme sunuyor."
        )
        if prefs["sustainability_priority"] == "high" and not prefs["prefers_financing"]:
            rationale += (
                " Ayrıca veri silme kaygısı etkisini azaltmak için cihazı elde tutma yaklaşımı "
                "bu senaryoda daha uygun."
            )
        return rationale

    if recommended_option_id == "refurb_buy":
        return (
            "Maliyet-performans dengesi bu profilde refurb seçeneğini öne çıkarıyor; "
            "onarıma göre daha güçlü performans artışı sunarken yeni cihaza göre daha kontrollü "
            "toplam maliyet ve çevresel etki sağlıyor."
        )

    return (
        "Performans önceliği ve kullanım yoğunluğu trade-in seçeneğini öne çıkarıyor; "
        "yeni nesil cihaza geçiş bu profilde en yüksek performans ve en uzun kullanım "
        "ömrü kazanımını sağlıyor."
    )


def assess_logic(input_payload: dict[str, Any]) -> dict[str, Any]:
    """Generate an assess response compatible with assess.v1 contract."""
    _validate_input_payload(input_payload)

    seed = _stable_seed(input_payload)
    rng = random.Random(seed + 42)

    rul_estimate, _, _ = _compute_rul_and_confidence(input_payload)
    scores = _compute_option_scores(input_payload)
    impacts = _build_estimated_impacts(rng)

    option_order = ["refurb_buy", "repair_battery", "tradein_new"]
    order_index = {option_id: idx for idx, option_id in enumerate(option_order)}
    recommended_option_id = max(
        scores.items(),
        key=lambda item: (item[1]["overall_score"], -order_index[item[0]]),
    )[0]

    recommendations = _build_recommendations(
        input_payload=input_payload,
        scores=scores,
        impacts=impacts,
        recommended_option_id=recommended_option_id,
    )

    timestamp_utc = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    request_id = f"req_{seed:08x}"

    decision_summary = {
        "recommended_primary_option_id": recommended_option_id,
        "rationale": _build_rationale(recommended_option_id, input_payload, rul_estimate),
        "pareto_note": (
            "repair_battery en düşük maliyet; refurb_buy dengeli maliyet-performans; "
            "tradein_new en yüksek performans ve en uzun RUL kazanımı sağlar."
        ),
    }

    response = {
        "request_id": request_id,
        "timestamp_utc": timestamp_utc,
        "model_version": MODEL_VERSION,
        "inputs_echo": {
            "device": input_payload["device"],
            "signals": input_payload["signals"],
            "user_preferences": input_payload["user_preferences"],
        },
        "rul_estimate": rul_estimate,
        "decision_summary": decision_summary,
        "recommendations": recommendations,
        "disclaimer": {
            "type": "advisory",
            "text": "Bu çıktı karar destek amaçlıdır; nihai fiyat ve kampanyalar kanal doğrulamasına tabidir.",
        },
    }

    expected_keys = {
        "request_id",
        "timestamp_utc",
        "model_version",
        "inputs_echo",
        "rul_estimate",
        "decision_summary",
        "recommendations",
        "disclaimer",
    }
    assert set(response.keys()) == expected_keys, "Top-level assess key set mismatch"

    return response


def run_assess(input_payload: dict[str, Any]) -> dict[str, Any]:
    """Compatibility wrapper for assess logic."""
    return assess_logic(input_payload)


if __name__ == "__main__":
    scenario_a_input = {
        "device": {"brand": "Samsung", "model": "Galaxy S22", "age_months": 31},
        "signals": {
            "battery_health_percent": 76,
            "charge_cycles": 702,
            "frame_drop_rate": 0.09,
            "repair_history_count": 1,
        },
        "user_preferences": {
            "budget_priority": "medium",
            "sustainability_priority": "high",
            "performance_priority": "medium",
            "prefers_financing": False,
        },
    }

    scenario_b_input = {
        "device": {"brand": "Apple", "model": "iPhone 13", "age_months": 36},
        "signals": {
            "battery_health_percent": 69,
            "charge_cycles": 982,
            "frame_drop_rate": 0.19,
            "repair_history_count": 2,
        },
        "user_preferences": {
            "budget_priority": "high",
            "sustainability_priority": "medium",
            "performance_priority": "medium",
            "prefers_financing": True,
        },
    }

    print("=== Scenario A ===")
    print(json.dumps(assess_logic(scenario_a_input), ensure_ascii=False, indent=2))
    print("=== Scenario B ===")
    print(json.dumps(assess_logic(scenario_b_input), ensure_ascii=False, indent=2))

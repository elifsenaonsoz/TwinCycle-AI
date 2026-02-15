"""Contract-driven incentive engine."""

from __future__ import annotations

import hashlib
import json
import random
from typing import Any


MODEL_VERSION = "mvp-contract-v1.0.0"


def clamp(value: float, min_value: float, max_value: float) -> float:
    """Clamp numeric value to a fixed range."""
    return max(min_value, min(max_value, value))


def map_priority(priority: str) -> float:
    """Map textual priority to numeric scale."""
    mapping = {"low": 1.0, "medium": 2.0, "high": 3.0}
    if priority not in mapping:
        raise ValueError(f"Invalid priority: {priority}")
    return mapping[priority]


def _stable_seed(input_payload: dict[str, Any], selected_option_id: str) -> int:
    """Generate deterministic seed from input payload and selected option."""
    raw = json.dumps(
        {"input_payload": input_payload, "selected_option_id": selected_option_id},
        ensure_ascii=False,
        sort_keys=True,
    )
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def _validate_input_payload(input_payload: dict[str, Any]) -> None:
    """Validate minimal input structure for incentive generation."""
    if not isinstance(input_payload, dict):
        raise ValueError("input_payload must be a dict")

    required_top = {"device", "signals", "user_preferences"}
    if not required_top.issubset(input_payload.keys()):
        raise ValueError("input_payload must include device, signals, user_preferences")

    signals = input_payload["signals"]
    prefs = input_payload["user_preferences"]

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


def incentive_logic(input_payload: dict, selected_option_id: str = "tradein_new") -> dict:
    """Generate incentive response compatible with incentive.v1 schema."""
    _validate_input_payload(input_payload)
    if not isinstance(selected_option_id, str) or not selected_option_id:
        raise ValueError("selected_option_id must be a non-empty string")

    signals = input_payload["signals"]
    prefs = input_payload["user_preferences"]

    sustainability_priority = prefs["sustainability_priority"]
    budget_priority = prefs["budget_priority"]
    prefers_financing = prefs["prefers_financing"]

    sustainability_weight = map_priority(sustainability_priority)
    budget_weight = map_priority(budget_priority)
    sustain_bias = sustainability_weight - budget_weight

    wipe_anxiety = (prefers_financing is False) and (sustainability_priority == "high")
    heavy_usage = (
        signals["charge_cycles"] >= 850
        or float(signals["frame_drop_rate"]) >= 0.15
        or signals["repair_history_count"] >= 2
    )

    seed = _stable_seed(input_payload, selected_option_id)
    rng = random.Random(seed + 42)

    if sustain_bias > 0:
        carbon_points_amount = rng.randint(16000, 22000)
        cash_amount = rng.randint(7500, 12000)
    elif sustain_bias < 0:
        cash_amount = rng.randint(13000, 17000)
        carbon_points_amount = rng.randint(7000, 12000)
    else:
        cash_amount = rng.randint(10000, 14500)
        carbon_points_amount = rng.randint(11000, 17000)

    hybrid_cash_amount = rng.randint(8500, 12000)
    hybrid_carbon_points = rng.randint(6000, 10000)

    if sustain_bias > 0:
        hybrid_carbon_points += rng.randint(400, 1200)
        hybrid_cash_amount -= rng.randint(300, 900)
    elif sustain_bias < 0:
        hybrid_cash_amount += rng.randint(400, 1200)
        hybrid_carbon_points -= rng.randint(300, 900)

    hybrid_cash_amount = max(hybrid_cash_amount, 7000)
    hybrid_carbon_points = max(hybrid_carbon_points, 5000)

    if heavy_usage:
        cash_amount += rng.randint(600, 1600)
        hybrid_cash_amount += rng.randint(300, 800)
    if sustainability_priority == "high":
        carbon_points_amount += rng.randint(600, 1800)
        hybrid_carbon_points += rng.randint(200, 800)

    cash_amount = int(clamp(cash_amount, 7000, 18000))
    carbon_points_amount = int(clamp(carbon_points_amount, 6000, 24000))
    hybrid_cash_amount = int(clamp(hybrid_cash_amount, 7000, 13000))
    hybrid_carbon_points = int(clamp(hybrid_carbon_points, 5000, 12000))

    cash_perk = "extra_data" if (heavy_usage or prefers_financing) else "none"
    carbon_perk = "tree" if sustainability_priority == "high" else "donation"
    hybrid_perk = "donation" if sustainability_priority == "high" else "none"

    packages = [
        {
            "package_id": "cash",
            "title": "Nakit Takas Paketi",
            "description": "Anlık nakit indirim ile ilk maliyeti hızlı düşürür.",
            "value": {
                "cash_amount_try": cash_amount,
                "carbon_points": None,
                "perk": cash_perk,
            },
            "ui": {
                "badge": "Nakit avantaj",
                "cta_label": "Nakit paketi seç",
            },
        },
        {
            "package_id": "carbon_points",
            "title": "Karbon Puan Paketi",
            "description": "Sürdürülebilirlik katkısını yüksek karbon puanı ile ödüllendirir.",
            "value": {
                "cash_amount_try": None,
                "carbon_points": carbon_points_amount,
                "perk": carbon_perk,
            },
            "ui": {
                "badge": "Karbon etkisi",
                "cta_label": "Karbon puanı seç",
            },
        },
        {
            "package_id": "hybrid",
            "title": "Hibrit Denge Paketi",
            "description": "Nakit ve karbon puanını dengeli biçimde birleştirir.",
            "value": {
                "cash_amount_try": hybrid_cash_amount,
                "carbon_points": hybrid_carbon_points,
                "perk": hybrid_perk,
            },
            "ui": {
                "badge": "Dengeli teklif",
                "cta_label": "Hibrit paketi seç",
            },
        },
    ]

    max_cash_reference = 17000.0
    max_carbon_reference = 22000.0
    cash_norm = clamp(cash_amount / max_cash_reference, 0.0, 1.0)
    carbon_norm = clamp(carbon_points_amount / max_carbon_reference, 0.0, 1.0)

    accept_score = (
        0.45
        + 0.22 * (budget_weight / 3.0)
        + 0.18 * cash_norm
        + (0.07 if prefers_financing else 0.0)
        + (0.04 if heavy_usage else 0.0)
    )
    impact_score = (
        0.40
        + 0.30 * (sustainability_weight / 3.0)
        + 0.22 * carbon_norm
        + (0.05 if sustainability_priority == "high" else 0.0)
    )
    accept_score = round(clamp(accept_score, 0.0, 1.0), 2)
    impact_score = round(clamp(impact_score, 0.0, 1.0), 2)

    notes = []
    if wipe_anxiety:
        notes.append("Veri silme süreci sertifikalı yürütülür ve teslimde silme sertifikası sağlanır.")
    if heavy_usage:
        notes.append("Yüksek kullanım sinyalleri nedeniyle nakit/hibrit seçenekleri kısa vadeli maliyet baskısını azaltır.")
    if sustainability_priority == "high":
        notes.append("Karbon puanı paketi bu profilde çevresel etki skorunu güçlendirir.")
    if budget_priority == "high":
        notes.append("Bütçe önceliği yüksek olduğu için nakit paketinin kabul olasılığı yükselmiştir.")
    if not notes:
        notes.append("Paket değerleri cihaz durumu ve kullanıcı önceliklerine göre dengelenmiştir.")

    response = {
        "request_id": f"req_{seed:08x}_INC",
        "model_version": MODEL_VERSION,
        "selected_option_id": selected_option_id,
        "packages": packages,
        "accept_score": accept_score,
        "impact_score": impact_score,
        "notes": notes,
        "disclaimer": {
            "type": "advisory",
            "text": "Teşvik değerleri kanal ve kampanya koşullarına göre işlem anında güncellenebilir.",
        },
    }

    expected_keys = {
        "request_id",
        "model_version",
        "selected_option_id",
        "packages",
        "accept_score",
        "impact_score",
        "notes",
        "disclaimer",
    }
    assert set(response.keys()) == expected_keys, "Top-level key set mismatch"

    package_ids = {p["package_id"] for p in response["packages"]}
    assert package_ids == {"cash", "carbon_points", "hybrid"}, "Invalid package ids"

    assert 0 <= float(response["accept_score"]) <= 1, "accept_score out of range"
    assert 0 <= float(response["impact_score"]) <= 1, "impact_score out of range"
    assert len(response["notes"]) >= 1, "notes must contain at least one item"

    return response


def run_incentive(input_payload: dict, selected_option_id: str = "tradein_new") -> dict:
    """Compatibility wrapper for incentive generation."""
    return incentive_logic(input_payload, selected_option_id=selected_option_id)

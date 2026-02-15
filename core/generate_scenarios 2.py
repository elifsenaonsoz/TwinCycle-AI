"""Generate contract-driven assess and incentive demo scenarios."""

from __future__ import annotations

import copy
import json
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
CONTRACTS_DIR = ROOT / "contracts"
CORE_OUTPUT_DIR = ROOT / "core" / "demo_outputs"
UI_OUTPUT_DIR = ROOT / "ui" / "public" / "demo_outputs"


def load_json(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")
    rel = path.relative_to(ROOT)
    print(f"WROTE: {rel}")


def assert_same_keyset(reference: Any, candidate: Any, path: str = "$") -> None:
    if isinstance(reference, dict):
        assert isinstance(candidate, dict), f"{path} must be object"
        ref_keys = set(reference.keys())
        cand_keys = set(candidate.keys())
        assert ref_keys == cand_keys, (
            f"{path} key mismatch; missing={sorted(ref_keys - cand_keys)}, "
            f"extra={sorted(cand_keys - ref_keys)}"
        )
        for key in reference:
            assert_same_keyset(reference[key], candidate[key], f"{path}.{key}")
        return

    if isinstance(reference, list):
        assert isinstance(candidate, list), f"{path} must be array"
        if not reference:
            return
        assert len(candidate) >= 1, f"{path} must not be empty"
        ref_item = reference[0]
        for idx, cand_item in enumerate(candidate):
            assert_same_keyset(ref_item, cand_item, f"{path}[{idx}]")


def assert_assess_contract(
    reference: dict[str, Any], scenario: dict[str, Any], scenario_name: str
) -> None:
    assert_same_keyset(reference, scenario)

    decision = scenario["decision_summary"]
    assert "rationale" in decision and decision["rationale"], "decision_summary.rationale missing"
    assert "pareto_note" in decision and decision["pareto_note"], "decision_summary.pareto_note missing"

    recommendations = scenario["recommendations"]
    assert len(recommendations) == 3, "recommendations must contain exactly 3 cards"

    tradein = next(
        (card for card in recommendations if card["option_id"] == "tradein_new"),
        None,
    )
    assert tradein is not None, "tradein_new card missing"
    assert tradein["triggers"]["open_incentive_flow"] is True, "tradein_new trigger must be true"
    assert tradein["ui"]["cta_label"] == "Teşvikleri gör", "tradein_new cta_label mismatch"

    prefs = scenario["inputs_echo"]["user_preferences"]
    signals = scenario["inputs_echo"]["signals"]
    rationale = decision["rationale"]

    if scenario_name == "scenario_A":
        assert prefs["sustainability_priority"] == "high", "scenario_A sustainability_priority must be high"
        assert prefs["prefers_financing"] is False, "scenario_A prefers_financing must be false"
        assert "wipe anxiety" in rationale.lower(), "scenario_A rationale must mention wipe anxiety"
    elif scenario_name == "scenario_B":
        assert prefs["budget_priority"] == "high", "scenario_B budget_priority must be high"
        assert prefs["prefers_financing"] is True, "scenario_B prefers_financing must be true"
        assert signals["charge_cycles"] >= 900, "scenario_B heavy usage charge_cycles too low"
        assert signals["frame_drop_rate"] >= 0.16, "scenario_B heavy usage frame_drop_rate too low"
        assert signals["repair_history_count"] >= 2, "scenario_B heavy usage repair_history_count too low"


def assert_incentive_schema(
    incentive: dict[str, Any], schema: dict[str, Any], scenario_name: str
) -> None:
    required_top = set(schema["required"])
    assert set(incentive.keys()) == required_top, f"{scenario_name} top-level key mismatch"

    assert isinstance(incentive["request_id"], str) and incentive["request_id"], "request_id invalid"
    assert isinstance(incentive["model_version"], str) and incentive["model_version"], "model_version invalid"
    assert incentive["selected_option_id"] == "tradein_new", "selected_option_id must be tradein_new"

    packages = incentive["packages"]
    assert isinstance(packages, list) and len(packages) == 3, "packages must have exactly 3 items"
    ids = [p["package_id"] for p in packages]
    assert set(ids) == {"cash", "carbon_points", "hybrid"}, "packages must include cash/carbon_points/hybrid"

    for pkg in packages:
        assert set(pkg.keys()) == {"package_id", "title", "description", "value", "ui"}, "package keys invalid"
        assert isinstance(pkg["title"], str) and pkg["title"], "package title invalid"
        assert isinstance(pkg["description"], str) and pkg["description"], "package description invalid"

        value = pkg["value"]
        assert set(value.keys()) == {"cash_amount_try", "carbon_points", "perk"}, "value keys invalid"

        cash_amount = value["cash_amount_try"]
        carbon_points = value["carbon_points"]
        assert cash_amount is None or isinstance(cash_amount, int), "cash_amount_try must be integer|null"
        assert carbon_points is None or isinstance(carbon_points, int), "carbon_points must be integer|null"
        assert value["perk"] in {"donation", "tree", "extra_data", "none"}, "perk enum invalid"

        ui = pkg["ui"]
        assert set(ui.keys()) == {"badge", "cta_label"}, "ui keys invalid"
        assert isinstance(ui["badge"], str) and ui["badge"], "ui.badge invalid"
        assert isinstance(ui["cta_label"], str) and ui["cta_label"], "ui.cta_label invalid"

    for score_key in ("accept_score", "impact_score"):
        score = incentive[score_key]
        assert isinstance(score, (int, float)), f"{score_key} must be number"
        assert 0 <= float(score) <= 1, f"{score_key} must be in [0, 1]"

    notes = incentive["notes"]
    assert isinstance(notes, list) and len(notes) >= 1, "notes must contain at least one item"
    assert all(isinstance(item, str) and item for item in notes), "notes items must be non-empty strings"

    disclaimer = incentive["disclaimer"]
    assert set(disclaimer.keys()) == {"type", "text"}, "disclaimer keys invalid"
    assert isinstance(disclaimer["type"], str) and disclaimer["type"], "disclaimer.type invalid"
    assert isinstance(disclaimer["text"], str) and disclaimer["text"], "disclaimer.text invalid"


def build_scenario_a(base: dict[str, Any]) -> dict[str, Any]:
    scenario = copy.deepcopy(base)
    scenario["request_id"] = "req_20260215_A001"
    scenario["timestamp_utc"] = "2026-02-15T15:20:00Z"

    scenario["inputs_echo"]["device"] = {
        "brand": "Samsung",
        "model": "Galaxy S22",
        "age_months": 31,
    }
    scenario["inputs_echo"]["signals"] = {
        "battery_health_percent": 76,
        "charge_cycles": 702,
        "frame_drop_rate": 0.09,
        "repair_history_count": 1,
    }
    scenario["inputs_echo"]["user_preferences"] = {
        "budget_priority": "medium",
        "sustainability_priority": "high",
        "performance_priority": "medium",
        "prefers_financing": False,
    }

    scenario["rul_estimate"] = {
        "rul_months_min": 8,
        "rul_months_max": 15,
        "confidence": "medium-high",
        "confidence_score": 0.71,
        "key_drivers": [
            "battery_health_percent",
            "charge_cycles",
            "device_age_months",
        ],
    }

    scenario["decision_summary"] = {
        "recommended_primary_option_id": "repair_battery",
        "rationale": (
            "Sürdürülebilirlik önceliği yüksek ve finansman tercih edilmediği için "
            "cihazı elde tutup batarya yenileme en dengeli yol; wipe anxiety etkisini "
            "azaltmak için cihaz devretme ve veri silme adımı minimize ediliyor."
        ),
        "pareto_note": (
            "repair_battery sürdürülebilirlikte güçlü; refurb_buy dengeli ikinci seçenek; "
            "tradein_new performans zirvesi ama daha yüksek çevresel maliyet."
        ),
    }

    return scenario


def build_scenario_b(base: dict[str, Any]) -> dict[str, Any]:
    scenario = copy.deepcopy(base)
    scenario["request_id"] = "req_20260215_B001"
    scenario["timestamp_utc"] = "2026-02-15T16:05:00Z"

    scenario["inputs_echo"]["device"] = {
        "brand": "Apple",
        "model": "iPhone 13",
        "age_months": 36,
    }
    scenario["inputs_echo"]["signals"] = {
        "battery_health_percent": 69,
        "charge_cycles": 982,
        "frame_drop_rate": 0.19,
        "repair_history_count": 2,
    }
    scenario["inputs_echo"]["user_preferences"] = {
        "budget_priority": "high",
        "sustainability_priority": "medium",
        "performance_priority": "medium",
        "prefers_financing": True,
    }

    scenario["rul_estimate"] = {
        "rul_months_min": 4,
        "rul_months_max": 9,
        "confidence": "medium-high",
        "confidence_score": 0.79,
        "key_drivers": [
            "charge_cycles",
            "frame_drop_rate",
            "repair_history_count",
        ],
    }

    scenario["decision_summary"] = {
        "recommended_primary_option_id": "refurb_buy",
        "rationale": (
            "Bütçe önceliği yüksek ve finansman açık, ancak heavy usage sinyalleri "
            "(yüksek charge_cycles, frame_drop_rate ve tekrar eden onarım geçmişi) "
            "nedeniyle kısa vadeli tamir yerine refurb seçeneği toplam maliyeti daha iyi dengeler."
        ),
        "pareto_note": (
            "repair_battery en düşük ilk maliyet; refurb_buy yüksek kullanım altında daha dengeli "
            "ömür/maliyet; tradein_new en yüksek performans fakat bütçe baskısı için ikincil."
        ),
    }

    return scenario


def build_incentive_a(model_version: str) -> dict[str, Any]:
    return {
        "request_id": "req_20260215_A001_INC",
        "model_version": model_version,
        "selected_option_id": "tradein_new",
        "packages": [
            {
                "package_id": "cash",
                "title": "Nakit Takas Paketi",
                "description": "Eski cihaz değeri anlık nakit indirim olarak yansıtılır.",
                "value": {
                    "cash_amount_try": 11250,
                    "carbon_points": None,
                    "perk": "none",
                },
                "ui": {
                    "badge": "Hızlı nakit",
                    "cta_label": "Nakit paketi seç",
                },
            },
            {
                "package_id": "carbon_points",
                "title": "Karbon Puan Avantajı",
                "description": "Sürdürülebilirlik odaklı senaryoda en yüksek karbon puan getirisi.",
                "value": {
                    "cash_amount_try": None,
                    "carbon_points": 19800,
                    "perk": "tree",
                },
                "ui": {
                    "badge": "En yüksek karbon etkisi",
                    "cta_label": "Karbon puanı seç",
                },
            },
            {
                "package_id": "hybrid",
                "title": "Hibrit Denge Paketi",
                "description": "Nakit ve karbon puanını dengeli bir şekilde birleştirir.",
                "value": {
                    "cash_amount_try": 6800,
                    "carbon_points": 8200,
                    "perk": "donation",
                },
                "ui": {
                    "badge": "Dengeli teklif",
                    "cta_label": "Hibrit paketi seç",
                },
            },
        ],
        "accept_score": 0.74,
        "impact_score": 0.91,
        "notes": [
            "Veri silme süreci sertifikalı olarak yürütülür ve teslimde belge sağlanır.",
            "Karbon puanı paketi bu senaryoda en cazip çevresel etkiyi sunar.",
        ],
        "disclaimer": {
            "type": "advisory",
            "text": "Teşvik değerleri kanal, stok ve kampanya koşullarına göre işlem anında değişebilir.",
        },
    }


def build_incentive_b(model_version: str) -> dict[str, Any]:
    return {
        "request_id": "req_20260215_B001_INC",
        "model_version": model_version,
        "selected_option_id": "tradein_new",
        "packages": [
            {
                "package_id": "cash",
                "title": "Maksimum Nakit Paketi",
                "description": "Bütçe ve yüksek kullanım profili için en yüksek nakit teklif.",
                "value": {
                    "cash_amount_try": 14900,
                    "carbon_points": None,
                    "perk": "extra_data",
                },
                "ui": {
                    "badge": "En yüksek nakit",
                    "cta_label": "Nakit paketi seç",
                },
            },
            {
                "package_id": "carbon_points",
                "title": "Karbon Puan Paketi",
                "description": "Nakit yerine karbon puanı odaklı alternatif teklif.",
                "value": {
                    "cash_amount_try": None,
                    "carbon_points": 9800,
                    "perk": "tree",
                },
                "ui": {
                    "badge": "Çevresel alternatif",
                    "cta_label": "Karbon puanı seç",
                },
            },
            {
                "package_id": "hybrid",
                "title": "Orta Seviye Hibrit Paket",
                "description": "Nakit ve karbon puanını orta seviyede birleştiren teklif.",
                "value": {
                    "cash_amount_try": 8100,
                    "carbon_points": 5200,
                    "perk": "none",
                },
                "ui": {
                    "badge": "Orta denge",
                    "cta_label": "Hibrit paketi seç",
                },
            },
        ],
        "accept_score": 0.86,
        "impact_score": 0.67,
        "notes": [
            "Yüksek kullanım profilinde nakit paketi toplam maliyet baskısını hızlı azaltır.",
            "Hibrit paket orta seviyede nakit ve puan dengesini korur.",
        ],
        "disclaimer": {
            "type": "advisory",
            "text": "Teşvik değerleri işlem anındaki takas skoru ve kampanya kurallarına bağlıdır.",
        },
    }


def generate() -> None:
    assess_template = load_json(CONTRACTS_DIR / "assess.v1.example.json")
    incentive_schema = load_json(CONTRACTS_DIR / "incentive.v1.schema.json")

    scenario_a = build_scenario_a(assess_template)
    scenario_b = build_scenario_b(assess_template)
    incentive_a = build_incentive_a(assess_template["model_version"])
    incentive_b = build_incentive_b(assess_template["model_version"])

    # Assess contract checks
    assert_assess_contract(assess_template, scenario_a, "scenario_A")
    assert_assess_contract(assess_template, scenario_b, "scenario_B")

    # Incentive schema checks (lightweight required-key and type checks)
    assert_incentive_schema(incentive_a, incentive_schema, "incentive_A")
    assert_incentive_schema(incentive_b, incentive_schema, "incentive_B")

    outputs = {
        CORE_OUTPUT_DIR / "scenario_A.json": scenario_a,
        CORE_OUTPUT_DIR / "scenario_B.json": scenario_b,
        UI_OUTPUT_DIR / "scenario_A.json": scenario_a,
        UI_OUTPUT_DIR / "scenario_B.json": scenario_b,
        CORE_OUTPUT_DIR / "incentive_A.json": incentive_a,
        CORE_OUTPUT_DIR / "incentive_B.json": incentive_b,
        UI_OUTPUT_DIR / "incentive_A.json": incentive_a,
        UI_OUTPUT_DIR / "incentive_B.json": incentive_b,
    }

    for path, payload in outputs.items():
        write_json(path, payload)

    print("CONTRACT_OK: scenario_A")
    print("CONTRACT_OK: scenario_B")
    print("SCHEMA_OK: incentive_A")
    print("SCHEMA_OK: incentive_B")


if __name__ == "__main__":
    generate()

"""Core assess engine placeholder."""


def classify_confidence_bucket(confidence_score: float) -> str:
    """TODO: Keep bucket thresholds aligned with UI design tokens."""
    if confidence_score < 0.40:
        return "low"
    if confidence_score < 0.75:
        return "medium"
    return "high"


def run_assess(inputs: dict) -> dict:
    """TODO: Implement /assess logic.

    - key_drivers must remain a list of feature names (strings).
    - confidence can be free text; UI badge should be derived from confidence_score.
    """
    raise NotImplementedError("TODO: implement assess engine")

"""Placeholder risk-scoring logic.

Implements the documented label-generation rules from the synthetic dataset
(see README) so the /score endpoint returns contract-shaped output before
Sarthak's real LightGBM model (S2) is wired in during C3.
"""

RULES = [
    ("lines_changed", lambda f: f.get("lines_changed", 0) > 800, 0.20),
    ("deploy_hour", lambda f: f.get("deploy_hour", 12) > 20, 0.25),
    ("oncall_coverage", lambda f: f.get("oncall_coverage", 1.0) < 0.75, 0.30),
]


def score_deployment(features: dict) -> dict:
    contributions = []

    for name, condition, weight in RULES:
        if condition(features):
            contributions.append((name, weight))

    incidents = features.get("incidents_last_30d", 0)
    if incidents > 0:
        contributions.append(("incidents_last_30d", min(incidents * 0.05, 0.25)))

    if features.get("secrets_detected_count", 0) > 0:
        return {
            "risk": "High",
            "score": 1.0,
            "top_factors": [{"feature": "secrets_detected_count", "contribution_pct": 100.0}],
        }

    raw_score = min(sum(weight for _, weight in contributions), 1.0)

    if raw_score >= 0.6:
        risk = "High"
    elif raw_score >= 0.3:
        risk = "Medium"
    else:
        risk = "Low"

    contributions.sort(key=lambda c: c[1], reverse=True)
    total_weight = sum(weight for _, weight in contributions) or 1.0
    top_factors = [
        {"feature": name, "contribution_pct": round(weight / total_weight * 100, 1)}
        for name, weight in contributions[:3]
    ]

    return {
        "risk": risk,
        "score": round(raw_score, 2),
        "top_factors": top_factors,
    }

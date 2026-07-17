# DeployGate: AI Deployment Risk Gate

*"A credit score for every deployment — it predicts the risk, explains it, writes the fix, applies it on your command, and watches production to learn from every deploy."*

DeployGate scores every deployment **Low / Medium / High** risk before it's allowed to proceed, using a deterministic ML core (LightGBM + SHAP) surrounded by specialized agents for signal collection, remediation advice, automated fixes, and post-deploy monitoring.

## Status: Round 1 Prototype (C1 — Gate Spine)

This stage wires up the core gating mechanism: a two-job GitHub Actions pipeline where the `deploy` job only runs if the `risk-gate` job passes.

## Repository Structure

```
.
├── .github/workflows/
│   └── risk-gate.yml     # Two-job pipeline: risk-gate -> deploy
├── app/                   # Placeholder demo app (swapped for the real app in K1)
│   ├── main.py
│   └── requirements.txt
├── datasets/              # Synthetic training data + label rules (S1)
├── runbooks/              # RAG knowledge base for the Advisor agent (A1)
└── README.md
```

## How the Gate Works (C1 Prototype)

- `risk-gate.yml` defines two jobs:
  - **risk-gate**: evaluates a risk score and fails the job if risk is High or Medium.
  - **deploy**: declares `needs: risk-gate`, so it only runs if the gate job succeeds.
- The risk score is currently **hardcoded** via the `RISK_SCORE` env var in the workflow file (`High`, `Medium`, or `Low`). This will be replaced by a live call to the `/score` endpoint (C2) and the real LightGBM model (C3).

### Demo the blocked/allowed states

1. Set `RISK_SCORE: "High"` in `.github/workflows/risk-gate.yml`, push/open a PR — the `risk-gate` job fails and `deploy` is skipped.
2. Change it to `RISK_SCORE: "Low"`, push again — `risk-gate` passes and `deploy` runs.

## Label-Generation Rules (Synthetic Dataset)

Documented for transparency (S1 deliverable, filled in as the dataset lands):
- `lines_changed > 800` → +20% risk
- `deploy_hour > 20` (evening) → +25% risk
- `oncall_coverage < 0.75` → +30% risk
- Leaked secret detected → auto-high risk

## Team

| Person | Track |
|---|---|
| Chaitanya | Gate + Integration (spine) |
| Sarthak | Dataset + Model + SHAP |
| Aditya | Advisor + Gitleaks (GenAI) |
| Kritika | Demo App + Telemetry + Dashboard |

See `DeployGate_Complete_Documentation.md` for the full project write-up.

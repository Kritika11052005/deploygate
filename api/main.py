"""C2: /score endpoint.

Placeholder logic today (api/scoring.py); Sarthak's real LightGBM model
swaps in behind score_deployment() during C3 with no contract changes.
"""
from fastapi import FastAPI
from pydantic import BaseModel

from api.scoring import score_deployment

app = FastAPI(title="DeployGate Risk Scoring API")


class Features(BaseModel):
    deploy_hour: int
    day_of_week: int
    lines_changed: int
    files_touched: int
    service_criticality: str
    incidents_last_30d: int
    oncall_coverage: float
    author_success_rate: float
    secrets_detected_count: int = 0


@app.post("/score")
def score(features: Features):
    return score_deployment(features.dict())

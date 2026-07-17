"""Placeholder demo app for the risk-gate pipeline.

This stands in for Kritika's real telemetry-enabled app (K1) until it lands.
"""
from fastapi import FastAPI

app = FastAPI(title="DeployGate Demo App")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/")
def root():
    return {"message": "DeployGate placeholder app is live"}

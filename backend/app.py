from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from risk_engine import calculate_risk


app = FastAPI(
    title="Landslide AI — NER Risk Intelligence",
    description="Explainable landslide risk monitoring API for the North Eastern Region.",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RiskRequest(BaseModel):
    rainfall: float = Field(..., ge=0, le=500)
    slope: float = Field(..., ge=0, le=90)
    elevation: float = Field(..., ge=0, le=5000)
    soil_moisture: float = Field(..., ge=0, le=100)
    vegetation_loss: float = Field(..., ge=0, le=100)


@app.get("/")
def root():
    return {
        "system": "Landslide AI",
        "status": "online",
        "version": "2.0.0",
        "region": "North Eastern Region",
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "risk_engine": "online",
        "mode": "prototype",
    }


@app.post("/api/risk")
def predict_risk(request: RiskRequest):
    return calculate_risk(
        rainfall=request.rainfall,
        slope=request.slope,
        elevation=request.elevation,
        soil_moisture=request.soil_moisture,
        vegetation_loss=request.vegetation_loss,
    )

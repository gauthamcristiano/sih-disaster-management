from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from risk_engine import calculate_risk


app = FastAPI(
    title="Landslide AI Risk Intelligence",
    description="AI-assisted landslide risk monitoring system for the North Eastern Region.",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RiskRequest(BaseModel):
    rainfall: float = Field(ge=0, le=500)
    slope: float = Field(ge=0, le=90)
    elevation: float = Field(ge=0, le=5000)
    soil_moisture: float = Field(ge=0, le=100)
    vegetation_loss: float = Field(ge=0, le=100)


@app.get("/")
def root():
    return {
        "system": "Landslide AI Risk Intelligence",
        "status": "online",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "risk_engine": "online"
    }


@app.post("/api/risk")
def predict_risk(request: RiskRequest):

    result = calculate_risk(
        rainfall=request.rainfall,
        slope=request.slope,
        elevation=request.elevation,
        soil_moisture=request.soil_moisture,
        vegetation_loss=request.vegetation_loss,
    )

    return result

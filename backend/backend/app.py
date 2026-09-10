from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from risk_engine import calculate_landslide_risk


app = FastAPI(
    title="Landslide AI Risk Monitoring System",
    description="AI-assisted landslide risk assessment platform",
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
    rainfall: float
    slope: float
    elevation: float
    soil_moisture: float
    vegetation_loss: float


@app.get("/")
def root():
    return {
        "system": "Landslide AI Risk Monitoring System",
        "status": "online"
    }


@app.post("/api/risk")
def predict_risk(data: RiskRequest):

    result = calculate_landslide_risk(
        rainfall=data.rainfall,
        slope=data.slope,
        elevation=data.elevation,
        soil_moisture=data.soil_moisture,
        vegetation_loss=data.vegetation_loss
    )

    return result

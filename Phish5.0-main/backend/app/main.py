from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
import app.models  # noqa: F401 - ensure models are registered
from app.api import auth, dashboard, analyzer, simulations, training, threats, users
from app.api import bulk_analyzer, ai_campaigns, ai_risk_prediction

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PhishGuard AI",
    description="Human-Centric Cyber Defense Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(analyzer.router)
app.include_router(simulations.router)
app.include_router(training.router)
app.include_router(threats.router)
app.include_router(users.router)
app.include_router(bulk_analyzer.router)
app.include_router(ai_campaigns.router)
app.include_router(ai_risk_prediction.router)


@app.get("/")
def root():
    return {"message": "PhishGuard AI API", "version": "1.0.0", "status": "operational"}


@app.get("/health")
def health():
    return {"status": "healthy"}

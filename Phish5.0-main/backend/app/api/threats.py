from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.analysis import ThreatReportCreate, ThreatReportResponse
from app.models.threat_report import ThreatReport
from app.models.user import User
from app.core.deps import get_current_user

router = APIRouter(prefix="/threat-reports", tags=["Threat Reports"])

PHISHING_CATEGORIES = [
    "Bank Verification Scam",
    "Payroll Update Scam",
    "Delivery Fraud",
    "Job Offer Scam",
    "Tech Support Scam",
    "CEO Fraud",
    "Account Verification",
    "IT Password Reset",
    "Prize/Lottery Scam",
    "Uncategorized",
]


@router.post("", response_model=ThreatReportResponse)
def submit_threat_report(
    data: ThreatReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Anonymize: store only category, subject, domain — not full email
    report = ThreatReport(
        email_content=data.email_content[:500],  # limit stored content
        reported_by=current_user.id,
        category=data.category,
        subject=data.subject,
        sender_domain=data.sender_domain,
        severity=data.severity,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=List[ThreatReportResponse])
def list_threat_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(ThreatReport).order_by(ThreatReport.created_at.desc()).limit(50).all()


@router.get("/stats")
def get_threat_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = db.query(ThreatReport).all()
    category_counts = {}
    for r in reports:
        category_counts[r.category] = category_counts.get(r.category, 0) + 1

    top_categories = sorted(category_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    severity_counts = {"low": 0, "medium": 0, "high": 0, "critical": 0}
    for r in reports:
        if r.severity in severity_counts:
            severity_counts[r.severity] += 1

    return {
        "total_reports": len(reports),
        "top_categories": [{"name": k, "count": v} for k, v in top_categories],
        "severity_distribution": severity_counts,
        "phishing_themes": [
            {"theme": "Bank Verification Scams", "count": category_counts.get("Bank Verification Scam", 0), "region": "Global"},
            {"theme": "Payroll Update Scams", "count": category_counts.get("Payroll Update Scam", 0), "region": "North America"},
            {"theme": "Delivery Fraud", "count": category_counts.get("Delivery Fraud", 0), "region": "Europe"},
            {"theme": "Job Offer Scams", "count": category_counts.get("Job Offer Scam", 0), "region": "Asia"},
            {"theme": "CEO Fraud", "count": category_counts.get("CEO Fraud", 0), "region": "Global"},
        ],
    }


@router.get("/categories")
def get_categories():
    return {"categories": PHISHING_CATEGORIES}


@router.get("/{report_id}/analyze")
def analyze_threat_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from fastapi import HTTPException
    from app.services.ai_service import analyze_email

    report = db.query(ThreatReport).filter(ThreatReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Threat report not found")

    # Use the AI service to analyze the email content
    # The analyze_email function returns a robust JSON including classification, risk_level, explanation, and prevention_advice
    analysis_result = analyze_email(report.email_content, mode="enterprise")
    
    return analysis_result

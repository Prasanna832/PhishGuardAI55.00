import io
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.bulk_analysis import BulkAnalysisResult
from app.schemas.bulk_analysis import BulkAnalyzeRequest, BulkAnalyzeResponse, BulkAnalysisResultResponse
from app.services.bulk_analysis_service import analyze_bulk_emails

router = APIRouter(tags=["Bulk Email Analyzer"])


@router.post("/analyze/bulk", response_model=BulkAnalyzeResponse)
def bulk_analyze(
    request: BulkAnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.emails:
        raise HTTPException(status_code=400, detail="No emails provided")
    if len(request.emails) > 100:
        raise HTTPException(status_code=400, detail="Maximum 100 emails per batch")

    emails = [{"email_id": e.email_id, "email_content": e.email_content} for e in request.emails]
    result = analyze_bulk_emails(emails, db)
    return BulkAnalyzeResponse(
        total=result["total"],
        results=[BulkAnalysisResultResponse.model_validate(r) for r in result["results"]],
        summary=result["summary"],
    )


@router.get("/analyze/bulk/history")
def bulk_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.query(BulkAnalysisResult).order_by(BulkAnalysisResult.created_at.desc()).limit(200).all()
    return [BulkAnalysisResultResponse.model_validate(r) for r in records]


@router.get("/analyze/bulk/report")
def bulk_report_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.query(BulkAnalysisResult).order_by(BulkAnalysisResult.created_at.desc()).limit(50).all()
    if not records:
        raise HTTPException(status_code=404, detail="No analysis results found")

    try:
        from fpdf import FPDF
    except ImportError:
        raise HTTPException(status_code=500, detail="PDF generation library not available")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Title
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "PhishGuard AI - Bulk Analysis Report", ln=True, align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", ln=True, align="C")
    pdf.ln(8)

    # Summary
    total = len(records)
    phishing = sum(1 for r in records if r.classification == "Phishing")
    suspicious = sum(1 for r in records if r.classification == "Suspicious")
    safe = sum(1 for r in records if r.classification == "Safe")

    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Summary", ln=True)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Total Analyzed: {total}", ln=True)
    pdf.cell(0, 6, f"Phishing: {phishing}  |  Suspicious: {suspicious}  |  Safe: {safe}", ln=True)
    pdf.ln(6)

    # Table header
    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(40, 40, 60)
    pdf.set_text_color(255, 255, 255)
    pdf.cell(10, 7, "#", border=1, fill=True, align="C")
    pdf.cell(30, 7, "Classification", border=1, fill=True, align="C")
    pdf.cell(20, 7, "Trust", border=1, fill=True, align="C")
    pdf.cell(20, 7, "Risk", border=1, fill=True, align="C")
    pdf.cell(110, 7, "Explanation", border=1, fill=True)
    pdf.ln()

    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 8)
    for i, r in enumerate(records, 1):
        explanation = (r.analysis_explanation or "")[:80]
        pdf.cell(10, 6, str(i), border=1, align="C")
        pdf.cell(30, 6, r.classification, border=1, align="C")
        pdf.cell(20, 6, str(int(r.trust_score)), border=1, align="C")
        pdf.cell(20, 6, r.risk_level, border=1, align="C")
        pdf.cell(110, 6, explanation, border=1)
        pdf.ln()

    pdf_bytes = pdf.output()
    buffer = io.BytesIO(pdf_bytes)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=phishguard_bulk_report.pdf"},
    )

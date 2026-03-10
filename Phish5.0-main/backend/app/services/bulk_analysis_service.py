import json
from typing import List
from sqlalchemy.orm import Session
from app.models.bulk_analysis import BulkAnalysisResult
from app.services.ai_service import analyze_email


def analyze_bulk_emails(emails: List[dict], db: Session) -> dict:
    """Analyze multiple emails and store results in database."""
    results = []
    for item in emails:
        email_content = item["email_content"]
        analysis = analyze_email(email_content, mode="enterprise")

        suspicious_phrases = json.dumps(
            analysis.get("suspicious_phrases", [])
        )
        techniques = analysis.get("detected_social_engineering_techniques", [])
        explanation = analysis.get("explanation", "")
        if techniques and techniques != ["None detected"]:
            explanation += " | Techniques: " + ", ".join(techniques)

        record = BulkAnalysisResult(
            email_content=email_content[:500],
            classification=analysis.get("classification", "Unknown"),
            trust_score=analysis.get("trust_score", 50),
            risk_level=analysis.get("risk_level", "Medium"),
            suspicious_phrases=suspicious_phrases,
            analysis_explanation=explanation,
        )
        db.add(record)
        db.flush()

        results.append(record)

    db.commit()

    for r in results:
        db.refresh(r)

    # Build summary
    total = len(results)
    phishing_count = sum(1 for r in results if r.classification == "Phishing")
    suspicious_count = sum(1 for r in results if r.classification == "Suspicious")
    safe_count = sum(1 for r in results if r.classification == "Safe")
    avg_trust = sum(r.trust_score for r in results) / total if total > 0 else 0

    summary = {
        "total_analyzed": total,
        "phishing": phishing_count,
        "suspicious": suspicious_count,
        "safe": safe_count,
        "average_trust_score": round(avg_trust, 1),
    }

    return {"total": total, "results": results, "summary": summary}

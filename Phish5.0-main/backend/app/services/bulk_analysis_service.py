import json
from typing import List
from sqlalchemy.orm import Session

from app.models.bulk_analysis import BulkAnalysisResult
from app.services.ai_service import analyze_email


def classify_email(trust_score: float) -> tuple[str, str]:
    """
    Determine classification and risk level based on trust score.
    """
    if trust_score >= 80:
        return "Safe", "Low"
    elif trust_score >= 50:
        return "Suspicious", "Medium"
    else:
        return "Phishing", "High"


def analyze_bulk_emails(emails: List[dict], db: Session) -> dict:
    """
    Analyze multiple emails and store results in database.
    """

    results = []

    for item in emails:
        email_content = item["email_content"]

        # AI analysis
        analysis = analyze_email(email_content, mode="enterprise")

        trust_score = analysis.get("trust_score", 50)

        # Override classification using trust score
        classification, risk_level = classify_email(trust_score)

        suspicious_phrases = json.dumps(
            analysis.get("suspicious_phrases", [])
        )

        techniques = analysis.get(
            "detected_social_engineering_techniques", []
        )

        explanation = analysis.get("explanation", "")

        if techniques and techniques != ["None detected"]:
            explanation += " | Techniques: " + ", ".join(techniques)

        record = BulkAnalysisResult(
            email_content=email_content[:500],
            classification=classification,
            trust_score=trust_score,
            risk_level=risk_level,
            suspicious_phrases=suspicious_phrases,
            analysis_explanation=explanation,
        )

        db.add(record)
        db.flush()

        results.append(record)

    db.commit()

    for r in results:
        db.refresh(r)

    total = len(results)

    phishing_count = sum(
        1 for r in results if r.classification == "Phishing"
    )

    suspicious_count = sum(
        1 for r in results if r.classification == "Suspicious"
    )

    safe_count = sum(
        1 for r in results if r.classification == "Safe"
    )

    avg_trust = (
        sum(r.trust_score for r in results) / total if total > 0 else 0
    )

    summary = {
        "total_analyzed": total,
        "phishing": phishing_count,
        "suspicious": suspicious_count,
        "safe": safe_count,
        "average_trust_score": round(avg_trust, 1),
    }

    return {
        "total": total,
        "results": results,
        "summary": summary,
    }
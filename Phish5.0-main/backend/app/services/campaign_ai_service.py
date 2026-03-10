import json
import re
from typing import Optional
from openai import OpenAI
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.ai_campaign import AICampaign


def _get_client() -> Optional[OpenAI]:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your_openai_api_key_here":
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None


def _sanitize_domain(name: str) -> str:
    """Sanitize a company name for use as an email domain component."""
    return re.sub(r'[^a-z0-9]', '', name.lower())


def generate_campaign(company_name: str, target_department: str, attack_style: str, db: Session) -> dict:
    """Generate an AI phishing attack campaign and store in database."""
    client = _get_client()

    prompt = f"""You are a cybersecurity red team specialist creating a realistic phishing attack campaign for testing purposes.

Company: {company_name}
Target Department: {target_department}
Attack Style: {attack_style}

Generate a full phishing campaign. Respond ONLY with valid JSON (no markdown):

{{
  "campaign_name": "<creative campaign codename>",
  "email_subject": "<realistic email subject line>",
  "email_body": "<full realistic phishing email body>",
  "attack_vector": "<description of the attack vector>",
  "phishing_link": "https://phishguard-sim.test/campaign",
  "risk_level": "Low|Medium|High|Critical"
}}"""

    result = None
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=800,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            result = json.loads(raw)
        except Exception as e:
            print(f"OpenAI error in campaign generation: {e}")

    if not result:
        result = _fallback_campaign(company_name, target_department, attack_style)

    campaign = AICampaign(
        campaign_name=result.get("campaign_name", f"Campaign-{attack_style}"),
        target_department=target_department,
        attack_type=attack_style,
        email_subject=result.get("email_subject", ""),
        email_body=result.get("email_body", ""),
        phishing_link=result.get("phishing_link", "https://phishguard-sim.test/campaign"),
        risk_level=result.get("risk_level", "High"),
    )
    db.add(campaign)
    db.commit()
    db.refresh(campaign)

    return campaign


def _fallback_campaign(company_name: str, target_department: str, attack_style: str) -> dict:
    templates = {
        "credential harvesting": {
            "campaign_name": f"Operation Credential Storm - {company_name}",
            "email_subject": f"[URGENT] {company_name} Security Alert: Verify Your Account",
            "email_body": f"""Dear {target_department} Team Member,

Our security system has detected multiple unauthorized access attempts on your {company_name} account from an unrecognized device in Eastern Europe.

To prevent unauthorized access and potential data breach, you must verify your identity immediately:

1. Click the secure verification link below
2. Enter your current credentials
3. Set up enhanced security protection

Verify Your Account Now: [PHISHING_LINK]

WARNING: Your account will be locked within 2 hours if verification is not completed.

This is an automated security alert from {company_name} IT Security.
Do not reply to this email.

{company_name} Cybersecurity Team
security@{_sanitize_domain(company_name)}.com""",
            "attack_vector": "Credential harvesting via fake account verification page with urgency tactics",
            "phishing_link": "https://phishguard-sim.test/campaign",
            "risk_level": "Critical",
        },
        "payroll update": {
            "campaign_name": f"Operation PayDay - {company_name}",
            "email_subject": f"Action Required: {company_name} Payroll System Migration",
            "email_body": f"""Dear {target_department} Employee,

We are migrating to a new payroll processing system effective this pay period. All employees must update their direct deposit information to ensure uninterrupted salary payments.

Please update your banking details before the deadline:
[PHISHING_LINK]

Deadline: End of business today

Failure to update will result in your next paycheck being held until manual processing is completed, which may take 2-3 additional business days.

If you have questions, contact payroll@{_sanitize_domain(company_name)}.com

Human Resources Department
{company_name}""",
            "attack_vector": "Payroll fraud via fake HR system with financial urgency",
            "phishing_link": "https://phishguard-sim.test/campaign",
            "risk_level": "High",
        },
        "it password reset": {
            "campaign_name": f"Operation Reset Wave - {company_name}",
            "email_subject": f"[IT Support] Mandatory Password Reset - {company_name}",
            "email_body": f"""Hello,

As part of our quarterly security compliance, all {target_department} department passwords must be reset by end of day.

Your current password expires in: 3 hours

Reset your password now: [PHISHING_LINK]

This is mandatory per {company_name} security policy SP-2024-Q4.

If you experience any issues, contact the IT Help Desk.

IT Support Team
{company_name}""",
            "attack_vector": "Password harvesting via fake IT support portal",
            "phishing_link": "https://phishguard-sim.test/campaign",
            "risk_level": "High",
        },
        "fake delivery": {
            "campaign_name": f"Operation Package Trap - {company_name}",
            "email_subject": "Failed Package Delivery - Immediate Action Required",
            "email_body": f"""Dear Customer,

We attempted to deliver your package today but no one was available to sign for it.

Package Details:
- Tracking: #PKG{company_name[:3].upper()}2024{target_department[:2].upper()}789
- Weight: 2.3 lbs
- Sender: {company_name} Corporate Office

Your package will be returned to sender in 24 hours unless you confirm your delivery preferences:
[PHISHING_LINK]

Express Logistics International
Customer Service""",
            "attack_vector": "Fake delivery notification with malicious tracking link",
            "phishing_link": "https://phishguard-sim.test/campaign",
            "risk_level": "Medium",
        },
        "ceo fraud": {
            "campaign_name": f"Operation Executive Override - {company_name}",
            "email_subject": "Confidential - Urgent Request from CEO",
            "email_body": f"""Hi,

I need your help with something confidential. I'm currently in back-to-back board meetings and can't take calls.

We have an urgent situation that requires immediate action from the {target_department} department. I need you to review and process a critical document through our secure portal:

[PHISHING_LINK]

Please handle this with the utmost discretion. Do not discuss this with anyone until I follow up with you directly.

Time-sensitive - please complete within the hour.

Best regards,
CEO, {company_name}

Sent from my iPhone""",
            "attack_vector": "CEO impersonation / Business Email Compromise (BEC) with authority pressure",
            "phishing_link": "https://phishguard-sim.test/campaign",
            "risk_level": "Critical",
        },
    }

    style_lower = attack_style.lower()
    for key, template in templates.items():
        if key in style_lower:
            return template

    # Default
    return templates["credential harvesting"]

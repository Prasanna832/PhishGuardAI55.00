import json
import re
from typing import Optional
from openai import OpenAI
from app.core.config import settings


def _get_client() -> Optional[OpenAI]:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY != "your-openai-api-key":
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None


def analyze_email(email_content: str, mode: str = "enterprise") -> dict:
    client = _get_client()

    if mode == "vulnerable_user":
        style = "Use very simple language suitable for elderly users, students, or non-technical people."
    else:
        style = "Use technical cybersecurity language suitable for enterprise security professionals."

    prompt = f"""You are a cybersecurity AI expert analyzing an email for phishing indicators.
{style}

Analyze the following email and respond ONLY with a valid JSON object (no markdown, no extra text):

Email:
{email_content}

Required JSON format:
{{
  "classification": "Safe|Suspicious|Phishing",
  "trust_score": <integer 0-100, where 100 is fully trusted>,
  "risk_level": "Low|Medium|High|Critical",
  "explanation": "<detailed explanation>",
  "detected_social_engineering_techniques": ["technique1", "technique2"],
  "suspicious_phrases": ["phrase1", "phrase2"],
  "awareness_coach": "<explanation of why attackers use these tactics and real-world scam pattern>",
  "prevention_advice": ["advice1", "advice2", "advice3"]
}}"""

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000,
            )
            raw = response.choices[0].message.content.strip()
            # Strip markdown code blocks if present
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI error: {e}")

    # Fallback heuristic analysis
    return _heuristic_analyze(email_content)


def _heuristic_analyze(email_content: str) -> dict:
    content_lower = email_content.lower()
    phishing_keywords = [
        "verify your account", "click here", "urgent", "password reset",
        "suspended", "confirm your", "payroll", "unusual activity",
        "your account has been", "immediately", "expires", "limited time",
        "act now", "winner", "prize", "congratulations", "free gift",
        "bank account", "credit card", "social security", "login credentials"
    ]
    found_phrases = [kw for kw in phishing_keywords if kw in content_lower]
    score = len(found_phrases)

    if score >= 4:
        classification = "Phishing"
        trust_score = max(5, 20 - score * 3)
        risk_level = "Critical"
    elif score >= 2:
        classification = "Suspicious"
        trust_score = max(20, 60 - score * 8)
        risk_level = "High"
    elif score >= 1:
        classification = "Suspicious"
        trust_score = 70
        risk_level = "Medium"
    else:
        classification = "Safe"
        trust_score = 90
        risk_level = "Low"

    techniques = []
    if any(w in content_lower for w in ["urgent", "immediately", "expires", "act now"]):
        techniques.append("Urgency / Time Pressure")
    if any(w in content_lower for w in ["bank", "paypal", "amazon", "microsoft", "apple"]):
        techniques.append("Brand Impersonation")
    if any(w in content_lower for w in ["click here", "verify", "confirm"]):
        techniques.append("Call to Action Manipulation")
    if any(w in content_lower for w in ["account", "password", "login"]):
        techniques.append("Credential Harvesting")

    return {
        "classification": classification,
        "trust_score": trust_score,
        "risk_level": risk_level,
        "explanation": f"Heuristic analysis detected {score} phishing indicator(s). "
                       f"Found suspicious phrases: {', '.join(found_phrases[:3]) if found_phrases else 'none'}.",
        "detected_social_engineering_techniques": techniques if techniques else ["None detected"],
        "suspicious_phrases": found_phrases[:5] if found_phrases else [],
        "awareness_coach": "This email exhibits common phishing patterns. Attackers use urgency and brand impersonation "
                           "to trick victims into clicking malicious links or revealing credentials. "
                           "Always verify sender identity through official channels.",
        "prevention_advice": [
            "Never click links in unsolicited emails",
            "Verify the sender's email domain carefully",
            "Contact the organization directly using official contact information",
        ],
    }


def generate_simulation(company_name: str, department: str, simulation_type: str) -> dict:
    client = _get_client()

    prompt = f"""You are a cybersecurity trainer creating a realistic phishing simulation email for training purposes.

Company: {company_name}
Department: {department}
Simulation Type: {simulation_type}

Generate a realistic phishing email that employees might receive. Respond ONLY with valid JSON (no markdown):

{{
  "subject": "<email subject>",
  "body": "<full email body with realistic content, include a fake link placeholder [PHISHING_LINK]>",
  "phishing_link": "https://phishguard-sim.test/click",
  "social_engineering_technique": "<main technique used>",
  "red_flags": ["flag1", "flag2", "flag3"]
}}"""

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
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI error: {e}")

    return _fallback_simulation(company_name, department, simulation_type)


def _fallback_simulation(company_name: str, department: str, simulation_type: str) -> dict:
    templates = {
        "account verification": {
            "subject": f"URGENT: Verify Your {company_name} Account",
            "body": f"""Dear {department} Team Member,

We have detected unusual activity on your {company_name} account. To protect your security, 
your account access has been temporarily restricted.

Please verify your account immediately by clicking the link below:

[PHISHING_LINK]

This link will expire in 24 hours. Failure to verify will result in permanent account suspension.

Regards,
{company_name} IT Security Team""",
        },
        "payroll update": {
            "subject": f"Action Required: Update Your {company_name} Payroll Information",
            "body": f"""Dear {department} Employee,

Our payroll system is upgrading to a new platform. All employees must update their 
direct deposit information by end of day to ensure uninterrupted payment.

Update your payroll details here: [PHISHING_LINK]

Please complete this immediately to avoid payment delays.

HR Department
{company_name}""",
        },
        "it password reset": {
            "subject": f"[IT Support] Your {company_name} Password Expires Today",
            "body": f"""Dear User,

Your {company_name} network password is set to expire today at 5:00 PM.

To avoid being locked out of your account, please reset your password now:
[PHISHING_LINK]

If you have questions, contact IT at helpdesk@{company_name.lower().replace(' ', '')}.support

{company_name} IT Department""",
        },
        "ceo fraud": {
            "subject": f"Confidential Request from CEO",
            "body": f"""Hi,

I need your urgent help with a sensitive matter. I'm currently in a board meeting 
and cannot take calls. We need to process an urgent wire transfer today.

Please click this secure link to proceed: [PHISHING_LINK]

Please keep this confidential until completed.

Thanks,
CEO, {company_name}""",
        },
        "delivery scam": {
            "subject": "Package Delivery Failed - Action Required",
            "body": f"""Dear Customer,

We attempted to deliver your package but were unable to complete the delivery.

Your package will be returned to sender unless you confirm your delivery details:
[PHISHING_LINK]

Tracking: #PH{company_name[:3].upper()}2024789

Express Delivery Service""",
        },
    }

    template_key = simulation_type.lower()
    for key in templates:
        if key in template_key:
            t = templates[key]
            return {
                "subject": t["subject"],
                "body": t["body"],
                "phishing_link": "https://phishguard-sim.test/click",
                "social_engineering_technique": "Urgency + Authority",
                "red_flags": [
                    "Urgency language pressuring immediate action",
                    "Generic greeting not personalized",
                    "Suspicious link domain",
                ],
            }

    default = templates["account verification"]
    return {
        "subject": default["subject"],
        "body": default["body"],
        "phishing_link": "https://phishguard-sim.test/click",
        "social_engineering_technique": "Urgency + Fear",
        "red_flags": ["Urgency language", "Suspicious link", "Generic sender"],
    }


def generate_training(simulation_type: str, mistake_description: str) -> dict:
    client = _get_client()

    prompt = f"""You are a cybersecurity trainer creating personalized security awareness training.

Simulation Type: {simulation_type}
Mistake Made: {mistake_description}

Generate training content. Respond ONLY with valid JSON (no markdown):

{{
  "title": "<training module title>",
  "mistake_description": "<clear explanation of what mistake occurred>",
  "why_dangerous": "<explanation of why this is dangerous>",
  "prevention_tips": ["tip1", "tip2", "tip3"],
  "awareness_lesson": "<short awareness lesson paragraph>",
  "full_content": "<complete training content combining all sections>"
}}"""

    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=900,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI error: {e}")

    return _fallback_training(simulation_type, mistake_description)


def _fallback_training(simulation_type: str, mistake_description: str) -> dict:
    return {
        "title": f"Security Awareness: {simulation_type.title()} Phishing",
        "mistake_description": mistake_description or "You clicked on a simulated phishing link.",
        "why_dangerous": "Clicking phishing links can expose your credentials, install malware, "
                         "and give attackers access to sensitive company data. Real phishing attacks "
                         "can lead to data breaches costing millions of dollars.",
        "prevention_tips": [
            "Always verify the sender's email address before clicking any links",
            "Hover over links to preview the destination URL before clicking",
            "When in doubt, contact the supposed sender directly through official channels",
        ],
        "awareness_lesson": f"Phishing attacks using '{simulation_type}' tactics are among the most common "
                            "cyber threats today. Attackers craft convincing emails that create urgency or "
                            "fear to bypass your critical thinking. By recognizing these patterns, you become "
                            "the most powerful defense in your organization's security posture.",
        "full_content": f"# Security Training: {simulation_type.title()}\n\n"
                        f"**What happened:** {mistake_description}\n\n"
                        "**Why it's dangerous:** Phishing attacks can lead to credential theft, malware infection, "
                        "and data breaches.\n\n"
                        "**Prevention Tips:**\n"
                        "1. Verify sender addresses carefully\n"
                        "2. Hover over links before clicking\n"
                        "3. Contact senders through official channels when suspicious\n\n"
                        "**Remember:** Think before you click!",
    }


def evaluate_employee(name: str, department: str, clicks: int, reports: int, completed_trainings: int, risk_score: float) -> dict:
    client = _get_client()

    prompt = f"""You are an HR Security Administrator evaluating an employee's cyber behavior.

Employee: {name}
Department: {department}
Phishing links clicked: {clicks}
Suspicious links reported (correctly): {reports}
Training modules completed: {completed_trainings}
Current System Risk Score (0-100, 100 being worst): {risk_score}

Based on these statistics, provide an insightful evaluation of this employee.
Respond ONLY with a valid JSON object matching the following structure:

{{
  "classification": "Good Performing|Monitor Closely|Training Needed Critical",
  "summary": "<2-3 sentence summary of their behavior pattern>",
  "recommended_actions": ["action 1", "action 2"]
}}
"""
    if client:
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.4,
                max_tokens=500,
            )
            raw = response.choices[0].message.content.strip()
            raw = re.sub(r"^```(?:json)?\s*", "", raw)
            raw = re.sub(r"\s*```$", "", raw)
            return json.loads(raw)
        except Exception as e:
            print(f"OpenAI error in evaluate_employee: {e}")

    # Fallback heuristic
    if clicks > reports and clicks > 2:
        classification = "Training Needed Critical"
        summary = f"{name} frequently falls for simulated attacks and rarely reports them. Immediate intervention is required."
        recommended_actions = ["Enroll in mandatory remedial phishing training", "Restrict access privileges until trained"]
    elif risk_score < 30 and reports >= clicks:
        classification = "Good Performing"
        summary = f"{name} demonstrates strong security awareness, frequently reporting suspicious activity."
        recommended_actions = ["Acknowledge good behavior", "Continue standard quarterly simulations"]
    else:
        classification = "Monitor Closely"
        summary = f"{name} shows inconsistent security behavior with occasional lapses. They benefit from continued targeted training."
        recommended_actions = ["Increase frequency of mild simulations", "Highlight specific phishing patterns in next training module"]

    return {
        "classification": classification,
        "summary": summary,
        "recommended_actions": recommended_actions
    }


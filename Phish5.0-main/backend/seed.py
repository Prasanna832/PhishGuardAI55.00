"""Seed script to create demo data for PhishGuard AI"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
import app.models  # noqa
from app.models.user import User
from app.models.simulation import Simulation
from app.models.interaction import Interaction
from app.models.training import Training
from app.models.threat_report import ThreatReport
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Create admin user
    admin = db.query(User).filter(User.email == "admin@phishguard.ai").first()
    if not admin:
        admin = User(
            name="Admin User",
            email="admin@phishguard.ai",
            password=get_password_hash("admin123"),
            role="admin",
            department="IT",
            risk_score=15.0,
        )
        db.add(admin)
        db.flush()
        print(f"Created admin user: admin@phishguard.ai / admin123")

    # Create demo employees
    employees_data = [
        ("Sarah Johnson", "sarah@company.com", "Finance", 45.0),
        ("Mike Chen", "mike@company.com", "IT", 20.0),
        ("Lisa Brown", "lisa@company.com", "HR", 65.0),
        ("David Wilson", "david@company.com", "Operations", 30.0),
        ("Emma Davis", "emma@company.com", "Marketing", 55.0),
        ("James Taylor", "james@company.com", "Sales", 80.0),
        ("Anna Martinez", "anna@company.com", "Engineering", 10.0),
        ("Robert Lee", "robert@company.com", "Legal", 40.0),
    ]

    employees = []
    for name, email, dept, risk in employees_data:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                name=name,
                email=email,
                password=get_password_hash("demo123"),
                role="employee",
                department=dept,
                risk_score=risk,
                created_at=datetime.utcnow() - timedelta(days=random.randint(10, 90)),
            )
            db.add(user)
        employees.append(user)
    
    db.flush()
    print(f"Created {len(employees_data)} demo employees")

    # Create demo simulations
    sims_data = [
        ("URGENT: Verify Your Account Now", "IT Password Reset", "All Employees", "Acme Corp", True),
        ("Payroll System Update Required", "Payroll Update", "Finance", "Acme Corp", True),
        ("CEO: Confidential Wire Transfer", "CEO Fraud", "Finance", "Acme Corp", True),
        ("Package Delivery Failed", "Delivery Scam", "All Employees", "Acme Corp", False),
    ]

    sims = []
    for subject, sim_type, dept, company, is_active in sims_data:
        sim = db.query(Simulation).filter(Simulation.subject == subject).first()
        if not sim:
            sim = Simulation(
                subject=subject,
                body=f"Dear Team,\n\nThis is a phishing simulation of type: {sim_type}.\n\nPlease click here to verify: https://phishguard-sim.test/click\n\nRegards,\n{company} IT Team",
                phishing_link="https://phishguard-sim.test/click",
                department=dept,
                simulation_type=sim_type,
                company_name=company,
                created_by=admin.id,
                is_active=is_active,
                created_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            )
            db.add(sim)
        sims.append(sim)
    
    db.flush()
    print(f"Created {len(sims_data)} demo simulations")

    # Create interactions (ensure employees exist first)
    db.flush()
    all_users = db.query(User).filter(User.role == "employee").all()
    all_sims = db.query(Simulation).all()
    
    interactions_created = 0
    for sim in all_sims[:3]:
        for user in all_users[:5]:
            existing = db.query(Interaction).filter(
                Interaction.user_id == user.id,
                Interaction.simulation_id == sim.id,
            ).first()
            if not existing:
                action = random.choice(["clicked", "clicked", "reported", "ignored", "ignored"])
                interaction = Interaction(
                    user_id=user.id,
                    simulation_id=sim.id,
                    clicked=action == "clicked",
                    reported=action == "reported",
                    ignored=action == "ignored",
                    action=action,
                    timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 20), hours=random.randint(0, 23)),
                )
                db.add(interaction)
                interactions_created += 1

    print(f"Created {interactions_created} demo interactions")

    # Create trainings
    training_contents = [
        "IT Password Reset Phishing Training",
        "Payroll Fraud Awareness",
        "CEO Fraud Detection",
    ]
    trainings_created = 0
    for user in all_users[:4]:
        for title in training_contents[:2]:
            existing = db.query(Training).filter(
                Training.user_id == user.id,
                Training.title == title,
            ).first()
            if not existing:
                completed = random.random() > 0.4
                training = Training(
                    user_id=user.id,
                    title=title,
                    content=f"# {title}\n\nThis training teaches you how to identify phishing attacks.\n\n**Key Points:**\n1. Always verify sender addresses\n2. Don't click suspicious links\n3. Report to IT immediately",
                    mistake_description="Clicked on a simulated phishing link",
                    why_dangerous="Phishing can lead to credential theft and data breaches",
                    prevention_tips="Verify sender • Hover links • Contact IT",
                    completed=completed,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 15)),
                    completed_at=datetime.utcnow() - timedelta(days=random.randint(0, 5)) if completed else None,
                )
                db.add(training)
                trainings_created += 1
    
    print(f"Created {trainings_created} demo trainings")

    # Create threat reports
    threat_data = [
        ("Bank account suspicious activity", "Bank Verification Scam", "security@fake-bank.net", "high"),
        ("Your package couldn't be delivered", "Delivery Fraud", "noreply@dlvry-alerts.com", "medium"),
        ("Congratulations! You've won", "Prize/Lottery Scam", "winner@prize-claim.net", "medium"),
        ("IT: Password expires today", "IT Password Reset", "helpdesk@corp-it-support.net", "high"),
        ("Urgent: Update payroll info", "Payroll Update Scam", "hr@payroll-update.info", "critical"),
    ]
    
    reports_created = 0
    for subject, category, domain, severity in threat_data:
        report = ThreatReport(
            email_content=f"Subject: {subject}\nThis is a phishing email attempting to steal credentials.",
            reported_by=admin.id,
            category=category,
            subject=subject,
            sender_domain=domain,
            severity=severity,
            created_at=datetime.utcnow() - timedelta(days=random.randint(1, 20)),
        )
        db.add(report)
        reports_created += 1

    print(f"Created {reports_created} demo threat reports")

    db.commit()
    print("\n✅ Demo data seeded successfully!")
    print("\nLogin credentials:")
    print("  Admin: admin@phishguard.ai / admin123")
    print("  Employee: sarah@company.com / demo123")

except Exception as e:
    db.rollback()
    print(f"Error: {e}")
    raise
finally:
    db.close()

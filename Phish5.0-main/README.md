# 🛡️ PhishGuard AI – Human-Centric Cyber Defense Platform

A **production-ready, fully functional full-stack cybersecurity platform** that combines AI-powered phishing detection, simulation generation, security awareness training, and real-time threat intelligence.

---

## 🏗️ Architecture

```
Phish5.0/
├── backend/              # FastAPI Python backend
│   ├── app/
│   │   ├── api/          # REST API endpoints
│   │   ├── core/         # Auth, security, config
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # AI service, risk scoring
│   │   ├── database.py   # DB connection
│   │   └── main.py       # FastAPI app entry point
│   ├── seed.py           # Demo data seeder
│   ├── requirements.txt  # Python dependencies
│   └── .env              # Environment variables
│
└── frontend/             # React + Vite frontend
    ├── src/
    │   ├── pages/        # All application pages
    │   ├── layouts/      # App layout with sidebar
    │   ├── services/     # API layer (Axios) + AuthContext
    │   ├── App.jsx       # Routes & auth protection
    │   └── index.css     # Tailwind + custom cyber styles
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- (Optional) OpenAI API key for AI features

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload
# → http://localhost:8000
```

#### Seed Demo Data

```bash
cd backend
python seed.py
```

This creates:
- **Admin account**: `admin@phishguard.ai` / `admin123`
- 8 demo employees with realistic risk scores
- 4 phishing simulations
- Sample interactions and training modules
- 5 community threat reports

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:5173
```

### 3. Environment Variables

`backend/.env`:
```
OPENAI_API_KEY=your_openai_api_key_here
SECRET_KEY=phishguard-super-secret-key-change-in-production
DATABASE_URL=sqlite:///./phishguard.db
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## 🔒 Features

### 1️⃣ Cyber Intelligence Dashboard
- Real-time stats: employees, active simulations, company risk index, click rate
- 7-day risk trend area chart
- Risk distribution donut chart (Low/Medium/High)
- High-risk employees table with visual risk bars

### 2️⃣ AI Email Phishing Analyzer
- Paste any suspicious email for instant AI analysis
- Returns: classification, trust score, risk level
- Detects social engineering techniques
- Highlights suspicious phrases
- Animated scanning UI with risk gauge
- Two modes: **Enterprise** (technical) / **Simple Mode** (non-technical users)
- AI Awareness Coach explanation

### 3️⃣ Phishing Simulation Generator
- Generate realistic AI-powered phishing emails
- Simulation types: Account Verification, Payroll Update, IT Password Reset, CEO Fraud, Delivery Scam
- Configurable by company name and department
- Automatically saved to database

### 4️⃣ Simulations Monitor
- Track all simulations with status
- View click/report/ignore rates per simulation
- Send simulations to all employees
- Real-time results modal

### 5️⃣ AI Security Training Center
- Auto-generated micro-training when employees click phishing links
- Training cards with expandable content
- Completion tracking and progress bar
- Completion reduces employee risk score

### 6️⃣ Risk Scoring Engine
- Dynamic risk scores based on behavior:
  - Clicks × 20 points
  - Failed simulations × 15 points
  - Suspicious interactions × 10 points
  - Completed training × -10 points
- Risk levels: Low (0-30), Medium (31-60), High (61-100)
- Department-level risk bar chart
- Per-employee risk recalculation

### 7️⃣ Global Phishing Intelligence Map
- Interactive threat heatmap with regional hotspots
- Top phishing themes bar chart
- Category distribution pie chart
- Global threat statistics

### 8️⃣ Community Threat Sharing
- Submit phishing email reports (anonymized)
- Category classification and severity tagging
- Community threat feed
- Aggregated statistics

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with JWT |
| GET | `/auth/me` | Get current user |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/dashboard/risk-trend` | 7-day risk trend |
| GET | `/dashboard/risk-distribution` | Risk level distribution |
| GET | `/dashboard/high-risk-employees` | Top risk employees |
| POST | `/analyze` | Analyze email for phishing |
| POST | `/simulations/generate` | Generate AI simulation |
| GET | `/simulations` | List all simulations |
| POST | `/simulations/send` | Send simulation to users |
| POST | `/simulations/interact` | Record user interaction |
| GET | `/simulations/results/{id}` | Get simulation results |
| POST | `/training/generate` | Generate training module |
| GET | `/training` | List user's trainings |
| POST | `/training/{id}/complete` | Mark training complete |
| POST | `/threat-reports` | Submit threat report |
| GET | `/threat-reports` | List community reports |
| GET | `/threat-reports/stats` | Threat statistics |
| GET | `/users` | List all users |
| GET | `/users/{id}/risk` | Get user risk details |

---

## 🎨 Tech Stack

**Frontend:**
- React 18 + Vite
- Tailwind CSS (dark cyber theme)
- Framer Motion (page transitions, animations)
- Recharts (analytics charts)
- Lucide React (icons)
- Axios (API layer)
- React Router v6

**Backend:**
- FastAPI (Python)
- SQLAlchemy ORM
- SQLite (default) / PostgreSQL supported
- JWT authentication (python-jose)
- bcrypt password hashing
- Pydantic v2 schemas
- OpenAI API (with heuristic fallback)

---

## 🔐 Security Notes

- JWT tokens stored in localStorage (24hr expiry)
- Passwords hashed with bcrypt
- Email content in threat reports truncated to 500 chars for anonymization
- CORS configured for dev (restrict in production)
- Change `SECRET_KEY` in production
- Use PostgreSQL in production (set `DATABASE_URL`)

---

## 🌐 Production Deployment

```bash
# Backend (with PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend (build static files)
npm run build
# Serve dist/ with nginx/caddy
```

---

## 📸 UI Pages

| Page | Route |
|------|-------|
| Login | `/login` |
| Register | `/register` |
| Dashboard | `/dashboard` |
| Email Analyzer | `/analyzer` |
| Simulation Generator | `/simulations/generate` |
| Simulations Monitor | `/simulations` |
| Training Center | `/training` |
| Risk Scoring | `/risk` |
| Threat Intelligence Map | `/threat-map` |
| Community Reports | `/threats` |
# 🎓 UniAdvisor — AI-Powered University Recommender System

> A production-grade, full-stack intelligent academic advisor that recommends courses, career paths, study materials, events, and generates semester plans — powered by hybrid AI/ML.

---

## ✨ Features

| Module | Description |
|---|---|
| 📚 **Course Recommender** | TF-IDF + cosine similarity, prerequisite-aware, GPA-aware difficulty filter |
| 🗺️ **Career Path Advisor** | Hybrid content filtering matched to skills & career goals |
| 📖 **Study Materials** | Curated resource recommendations by domain & difficulty |
| 🎯 **Event & Club Finder** | Interest-aligned campus events and clubs |
| 📅 **Semester Planner** | Credit-balanced, prerequisite-respecting 4-semester roadmap |
| 🤖 **RAG Chatbot** | Groq LLaMA + university knowledge base (fallback to rule-based) |
| 📊 **Analytics Dashboard** | Recharts-powered engagement, domain, and performance insights |
| 🔐 **Google OAuth** | Real OAuth 2.0 + demo login for quick testing |
| ⭐ **Feedback Loop** | Rating system to continuously improve recommendations |
| 💡 **Explainable AI** | Every recommendation shows reason, match score, and peer insights |

---

## 🏗️ Tech Stack

### Backend
- **FastAPI** + Uvicorn (async REST API)
- **SQLAlchemy** + SQLite (user profiles, interactions, feedback)
- **scikit-learn** — TF-IDF vectorizer + cosine similarity
- **pandas / numpy** — data processing
- **Groq API** — LLaMA 3 LLM for RAG chatbot
- **Google OAuth 2.0** — authentication

### Frontend
- **React 19** + **Vite 8**
- **Tailwind CSS 3** — dark green-accent design system
- **Recharts** — Bar, Pie, Line, Radar charts
- **React Router v6** — client-side routing
- **Axios** — API client
- **Lucide React** — icons

### ML / AI
- **Content-Based Filtering** — TF-IDF on course/career features + cosine similarity
- **Hybrid Scoring** — 70% content similarity + 30% popularity signal
- **Prerequisite-Aware** — dependency graph filtering
- **GPA-Aware** — difficulty capping based on student GPA
- **RAG Pipeline** — University knowledge base → LLM context → Groq API

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py                  ← FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example             ← Copy to .env and fill secrets
│   ├── auth/
│   │   └── oauth.py             ← Google OAuth 2.0 + demo login
│   ├── routes/
│   │   ├── users.py             ← POST/GET /user/profile
│   │   ├── courses.py           ← POST /recommend/courses
│   │   ├── events.py            ← POST /recommend/events
│   │   ├── materials.py         ← POST /recommend/materials
│   │   ├── career.py            ← POST /recommend/career
│   │   ├── semester.py          ← POST /recommend/semester-plan
│   │   ├── feedback.py          ← POST /feedback/
│   │   ├── chatbot.py           ← POST /chatbot/query
│   │   └── analytics.py         ← GET /analytics/dashboard
│   ├── utils/
│   │   └── recommender.py       ← Core hybrid recommender engine
│   ├── chatbot/
│   │   └── chatbot.py           ← RAG chatbot with Groq API
│   ├── database/
│   │   └── db.py                ← SQLAlchemy models + init
│   └── data/
│       ├── courses.csv          ← 33 university courses
│       ├── events.csv           ← 20 events & clubs
│       ├── careers.csv          ← 12 career paths with salaries
│       └── materials.csv        ← 20 study resources
│
└── frontend/
    ├── src/
    │   ├── App.jsx              ← Router + protected routes
    │   ├── main.jsx
    │   ├── index.css            ← Tailwind + custom design system
    │   ├── api/
    │   │   └── client.js        ← Axios API layer (all endpoints)
    │   ├── context/
    │   │   └── AuthContext.jsx  ← Global auth + profile state
    │   ├── components/
    │   │   └── Layout.jsx       ← Sidebar nav layout
    │   └── pages/
    │       ├── LoginPage.jsx    ← Google OAuth + demo login
    │       ├── DashboardPage.jsx
    │       ├── ProfilePage.jsx  ← Profile editor with chip selectors
    │       ├── RecommendationsPage.jsx ← Tabbed: courses/events/materials/career
    │       ├── ChatbotPage.jsx  ← Chat UI with quick prompts
    │       ├── AnalyticsPage.jsx ← Charts dashboard
    │       └── SemesterPlanPage.jsx ← Collapsible semester cards
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start

### 1. Clone & Setup

```bash
git clone <your-repo>
cd project
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env to add your GROQ_API_KEY (optional) and Google OAuth credentials (optional)

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**API Docs:** http://localhost:8000/docs (Swagger UI)

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**App:** http://localhost:5173

---

## 🔑 Environment Variables

```env
# backend/.env

# Groq API (optional - chatbot falls back to rule-based without it)
GROQ_API_KEY=gsk_your_key_here   # Free at console.groq.com

# Google OAuth (optional - demo login works without it)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/callback
FRONTEND_URL=http://localhost:5173

# Database (SQLite by default, no setup needed)
DATABASE_URL=sqlite:///./university_recommender.db
```

### Getting a Free Groq API Key
1. Go to https://console.groq.com
2. Sign up (free)
3. Create an API key
4. Add it to `backend/.env` as `GROQ_API_KEY`

### Setting up Google OAuth
1. Go to https://console.cloud.google.com
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized redirect URI: `http://localhost:8000/auth/callback`
5. Copy Client ID and Secret to `.env`

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/auth/login` | Get Google OAuth URL |
| `POST` | `/auth/demo-login` | Demo login (no OAuth needed) |
| `GET` | `/auth/me?token=...` | Get current user |
| `POST` | `/user/profile` | Create/update student profile |
| `GET` | `/user/profile/{id}` | Get student profile |
| `POST` | `/recommend/courses` | Get course recommendations |
| `GET` | `/recommend/courses` | Course recs via query params |
| `POST` | `/recommend/events` | Get event/club recommendations |
| `POST` | `/recommend/materials` | Get study material recommendations |
| `POST` | `/recommend/career` | Get career path recommendations |
| `POST` | `/recommend/semester-plan` | Generate semester-wise plan |
| `POST` | `/feedback/` | Submit rating/feedback |
| `POST` | `/chatbot/query` | RAG chatbot query |
| `GET` | `/analytics/dashboard` | Analytics data |

### Example: Course Recommendation Request

```json
POST /recommend/courses
{
  "student_id": "student_001",
  "branch": "Computer Science",
  "year": 3,
  "gpa": 3.6,
  "interests": ["AI", "Machine Learning"],
  "skills": ["Python", "React"],
  "career_goal": "ML Engineer",
  "completed_courses": ["CS101", "CS102", "MATH101", "MATH301"]
}
```

### Example: Chatbot Query

```json
POST /chatbot/query
{
  "student_id": "student_001",
  "query": "Best electives for AI in 3rd year?",
  "student_context": { "branch": "CS", "year": 3, "career_goal": "ML Engineer" },
  "history": []
}
```

---

## 🧠 Recommender Algorithm

```
Input: Student Profile (interests, skills, career_goal, GPA, completed_courses)
  │
  ▼
Feature Engineering
  - Concatenate: name + domain + tags + difficulty → feature_text
  - TF-IDF vectorization (bigrams, English stop words removed)
  │
  ▼
Content-Based Similarity
  - Build student query vector from interests + skills + career_goal
  - Cosine similarity: query_vec × item_matrix
  │
  ▼
Filters Applied
  - ✓ Prerequisite check (all prerequisites in completed_courses)
  - ✓ GPA-based difficulty cap (GPA < 2.5 → Beginner only)
  - ✓ Exclude already-completed courses
  │
  ▼
Hybrid Scoring
  - score = 0.70 × cosine_similarity + 0.30 × normalized_rating
  │
  ▼
Explainability
  - reason: "Matches your interest in AI"
  - peer_insight: "74% of similar students took this"
  - match_score: 0.74 (shown as %)
  │
  ▼
Top-N Results (sorted by hybrid score)
```

---

## 🎨 Design System

- **Background:** `#0a0f0d` (near-black green-tinted)
- **Cards:** `#111815` glassmorphism with blur
- **Accent:** `#10b981` emerald green
- **Accent Light:** `#34d399`
- **Gradient:** `135deg, #34d399 → #10b981 → #059669`
- **Typography:** DM Sans (Google Fonts)
- **Animation:** fade-in, slide-up with staggered delays

---

## 🧪 Sample Test Queries (Chatbot)

- `"Best electives for AI in 3rd year?"`
- `"Easy courses to boost my GPA?"`
- `"Roadmap to become ML Engineer?"`
- `"How to prepare for Google internship?"`
- `"Plan my semester for Data Science"`
- `"Which courses have the best rating?"`

---

## 📦 Dataset Overview

| Dataset | Records | Key Fields |
|---|---|---|
| `courses.csv` | 33 courses | id, name, domain, difficulty, credits, rating, tags, prerequisites, semester |
| `events.csv` | 20 events/clubs | id, name, type, interest_area, description, date, tags |
| `careers.csv` | 12 career paths | id, title, domain, avg_salary_lpa, growth_rate, skills_required |
| `materials.csv` | 20 resources | id, title, type, domain, difficulty, url, rating, tags |

---

## 🔮 Future Enhancements

- [ ] **Collaborative Filtering** — SVD/ALS using Surprise library on interaction data
- [ ] **FAISS Vector Store** — semantic search with sentence-transformers embeddings  
- [ ] **Real PDF ingestion** — RAG over actual university syllabi PDFs
- [ ] **Mobile app** — React Native with same API backend
- [ ] **Email notifications** — weekly personalized recommendations
- [ ] **Admin panel** — upload new courses/events via UI
- [ ] **Redis sessions** — replace in-memory session store
- [ ] **PostgreSQL** — production database upgrade

---

## 📄 License

MIT License — built for educational purposes.

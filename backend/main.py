"""
AI-Powered Personalized Recommender System — FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Load .env if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from database.db import init_db
from routes import courses, events, career, materials, semester, feedback, chatbot, users, analytics
from auth.oauth import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting AI Recommender System...")
    init_db()
    print("✅ Database initialized")
    yield
    print("🛑 Shutting down...")


app = FastAPI(
    title="UniAdvisor API",
    description="AI-Powered University Recommender System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS (keep open for dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router,       prefix="/auth",      tags=["Auth"])
app.include_router(users.router,      prefix="/user",      tags=["User"])
app.include_router(courses.router,    prefix="/recommend", tags=["Recommend"])
app.include_router(events.router,     prefix="/recommend", tags=["Recommend"])
app.include_router(materials.router,  prefix="/recommend", tags=["Recommend"])
app.include_router(career.router,     prefix="/recommend", tags=["Recommend"])
app.include_router(semester.router,   prefix="/recommend", tags=["Recommend"])
app.include_router(feedback.router,   prefix="/feedback",  tags=["Feedback"])
app.include_router(chatbot.router,    prefix="/chatbot",   tags=["Chatbot"])
app.include_router(analytics.router,  prefix="/analytics", tags=["Analytics"])


@app.get("/", tags=["Health"])
async def root():
    return {"status": "running", "message": "UniAdvisor API v1.0 ✅"}


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "healthy"}
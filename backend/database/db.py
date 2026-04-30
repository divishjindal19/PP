"""
Database configuration using SQLAlchemy with SQLite.
"""

from sqlalchemy import create_engine, Column, String, Float, Integer, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./university_recommender.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Student(Base):
    """Student profile table."""
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    branch = Column(String)
    year = Column(Integer)
    gpa = Column(Float)
    interests = Column(JSON)          # ["AI", "Finance", "Web Dev"]
    skills = Column(JSON)             # ["Python", "React"]
    career_goal = Column(String)
    completed_courses = Column(JSON)  # list of course ids
    avatar_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Interaction(Base):
    """User-item interaction table for collaborative filtering."""
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String, index=True)
    item_id = Column(String)
    item_type = Column(String)  # course | event | material | career
    rating = Column(Float)
    clicks = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class FeedbackLog(Base):
    """Feedback collection for continuous improvement."""
    __tablename__ = "feedback_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String)
    item_id = Column(String)
    item_type = Column(String)
    rating = Column(Float)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency to get DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

"""User profile management routes."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from database.db import get_db, Student
import json

router = APIRouter()


class StudentProfile(BaseModel):
    id: str
    name: str
    email: str
    branch: Optional[str] = "Computer Science"
    year: Optional[int] = 1
    gpa: Optional[float] = 3.0
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    career_goal: Optional[str] = ""
    completed_courses: Optional[List[str]] = []
    avatar_url: Optional[str] = ""


@router.post("/profile")
async def create_or_update_profile(profile: StudentProfile, db: Session = Depends(get_db)):
    """Create or update student profile."""
    existing = db.query(Student).filter(Student.id == profile.id).first()

    if existing:
        for field, value in profile.model_dump().items():
            setattr(existing, field, value)
        db.commit()
        db.refresh(existing)
        return {"message": "Profile updated", "profile": profile}
    else:
        student = Student(**profile.model_dump())
        db.add(student)
        db.commit()
        db.refresh(student)
        return {"message": "Profile created", "profile": profile}


@router.get("/profile/{student_id}")
async def get_profile(student_id: str, db: Session = Depends(get_db)):
    """Get student profile by ID."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("/profiles")
async def list_profiles(db: Session = Depends(get_db)):
    """List all profiles (admin use)."""
    return db.query(Student).limit(50).all()

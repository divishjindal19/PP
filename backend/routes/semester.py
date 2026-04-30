"""Semester plan recommendation routes."""
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from utils.recommender import recommend_semester_plan

router = APIRouter()


class StudentQuery(BaseModel):
    student_id: str = "demo"
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    career_goal: Optional[str] = ""
    branch: Optional[str] = ""
    year: Optional[int] = 2
    gpa: Optional[float] = 3.0
    completed_courses: Optional[List[str]] = []


@router.post("/semester-plan")
async def get_semester_plan(query: StudentQuery):
    """
    Generate a personalized semester-wise course plan.
    
    Considers:
    - Current year/semester
    - Completed courses
    - Prerequisites chain
    - Credit limits (max 20/semester)
    - Career goal alignment
    """
    plan = recommend_semester_plan(query.model_dump())
    return {
        "student_id": query.student_id,
        "semester_plan": plan,
        "total_semesters_planned": len(plan),
        "note": "Plan adjusts automatically as you complete courses"
    }

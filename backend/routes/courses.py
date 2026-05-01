"""Course recommendation routes."""

from fastapi import APIRouter, Query, Body
from typing import List, Optional
from pydantic import BaseModel
from utils.recommender import recommend_courses

router = APIRouter()


class StudentQuery(BaseModel):
    student_id: str = "demo"
    branch: Optional[str] = "Computer Science"
    year: Optional[int] = 2
    gpa: Optional[float] = 3.0
    interests: Optional[List[str]] = []
    skills: Optional[List[str]] = []
    career_goal: Optional[str] = ""
    completed_courses: Optional[List[str]] = []


@router.post("/courses")
async def get_course_recommendations(
    query: Optional[StudentQuery] = Body(None),
    student_id: str = Query("demo"),
    branch: str = Query("Computer Science"),
    year: int = Query(2),
    gpa: float = Query(3.0),
    interests: str = Query("AI,ML"),
    skills: str = Query("Python"),
    career_goal: str = Query("ML Engineer"),
    completed_courses: str = Query("CS101"),
    n: int = Query(8),
):
    """
    Works with BOTH:
    - JSON body
    - Query params
    """

    # If body provided → use it
    if query:
        student = query.model_dump()

    # Else fallback to query params
    else:
        student = {
            "student_id": student_id,
            "branch": branch,
            "year": year,
            "gpa": gpa,
            "interests": [i.strip() for i in interests.split(",") if i.strip()],
            "skills": [s.strip() for s in skills.split(",") if s.strip()],
            "career_goal": career_goal,
            "completed_courses": [c.strip() for c in completed_courses.split(",") if c.strip()],
        }

    results = recommend_courses(student, n=n)

    return {
        "student_id": student["student_id"],
        "recommendations": results,
        "count": len(results),
        "algorithm": "Hybrid (TF-IDF + Prerequisite-aware filtering)",
    }
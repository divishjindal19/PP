"""Events recommendation routes."""
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from utils.recommender import recommend_events

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


@router.post("/events")
async def get_event_recommendations(query: StudentQuery, n: int = 6):
    """Get personalized event and club recommendations."""
    results = recommend_events(query.model_dump(), n=n)
    return {"student_id": query.student_id, "recommendations": results, "count": len(results)}

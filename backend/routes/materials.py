"""Study materials recommendation routes."""
from fastapi import APIRouter
from typing import List, Optional
from pydantic import BaseModel
from utils.recommender import recommend_materials

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


@router.post("/materials")
async def get_material_recommendations(query: StudentQuery, n: int = 8):
    """Get personalized study material recommendations."""
    results = recommend_materials(query.model_dump(), n=n)
    return {"student_id": query.student_id, "recommendations": results, "count": len(results)}

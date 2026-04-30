"""Feedback collection routes."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database.db import get_db, FeedbackLog, Interaction

router = APIRouter()


class FeedbackItem(BaseModel):
    student_id: str
    item_id: str
    item_type: str  # course | event | material | career
    rating: float   # 1-5
    comment: Optional[str] = ""


@router.post("/")
async def submit_feedback(feedback: FeedbackItem, db: Session = Depends(get_db)):
    """Submit user feedback to improve recommendations."""
    log = FeedbackLog(**feedback.model_dump())
    db.add(log)

    # Also update interaction table for collaborative filtering signals
    interaction = Interaction(
        student_id=feedback.student_id,
        item_id=feedback.item_id,
        item_type=feedback.item_type,
        rating=feedback.rating,
    )
    db.add(interaction)
    db.commit()

    return {"message": "Feedback recorded. Thank you!", "feedback_id": log.id}


@router.get("/student/{student_id}")
async def get_student_feedback(student_id: str, db: Session = Depends(get_db)):
    """Get all feedback submitted by a student."""
    logs = db.query(FeedbackLog).filter(FeedbackLog.student_id == student_id).all()
    return {"student_id": student_id, "feedback": logs, "count": len(logs)}

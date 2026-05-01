"""Analytics dashboard routes."""
from fastapi import APIRouter
from utils.recommender import get_analytics

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_analytics():
    """Get analytics data for the admin/student dashboard."""
    data = get_analytics()
    return data

from fastapi import APIRouter, Depends
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.services import ai_service
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(tags=["Email Analyzer"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_email(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user),
):
    result = ai_service.analyze_email(request.email_content, request.mode)
    return AnalyzeResponse(**result)

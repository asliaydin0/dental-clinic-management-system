from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.brushing_bll import BrushingBLL

router = APIRouter(prefix="/brushing_logs", tags=["Brushing Logs"])

class BrushingLogCreateSchema(BaseModel):
    patient_id: str
    log_date: str = Field(..., description="YYYY-MM-DD")
    log_time: str = Field(..., description="HH:MM")
    duration_seconds: int = Field(..., ge=1)
    completed: Optional[bool] = True
    score: int = Field(..., ge=0, le=100)
    period: Optional[str] = "Sabah"
    floss_used: Optional[bool] = False
    tongue_brushed: Optional[bool] = False

@router.get("/{patient_id}")
def get_brushing_logs(patient_id: str):
    try:
        return BrushingBLL.get_patient_brushing_logs(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_brushing_log(log_req: BrushingLogCreateSchema):
    try:
        log_data = log_req.model_dump()
        # Convert bools to 1 or 0 for stored procedure arguments
        log_data["completed"] = 1 if log_data.get("completed", True) else 0
        log_data["floss_used"] = 1 if log_data.get("floss_used", False) else 0
        log_data["tongue_brushed"] = 1 if log_data.get("tongue_brushed", False) else 0
        
        BrushingBLL.add_brushing_log(log_data)
        return {"success": True, "message": "Fırçalama kaydı başarıyla eklendi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.patient_bll import PatientBLL

router = APIRouter(prefix="/treatment_stages", tags=["Treatment Stages API"])

class TreatmentStageCreateSchema(BaseModel):
    patient_id: str
    title: str = Field(..., min_length=1)
    stage_date: Optional[str] = None
    status: str = Field("upcoming", description="done, active, upcoming")
    notes: Optional[str] = None

@router.get("/{patient_id}")
def get_patient_treatment_stages(patient_id: str):
    """
    HTTP GET: Fetch all treatment stages for a specific patient.
    """
    try:
        return PatientBLL.get_patient_treatment_stages(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_treatment_stage(stage_req: TreatmentStageCreateSchema):
    """
    HTTP POST: Add new treatment stage.
    """
    try:
        stage_data = stage_req.model_dump()
        PatientBLL.add_treatment_stage(stage_data)
        return {"success": True, "message": "Tedavi aşaması başarıyla kaydedildi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{stage_id}")
def delete_treatment_stage(stage_id: int):
    """
    HTTP DELETE: Remove a treatment stage.
    """
    try:
        PatientBLL.remove_treatment_stage(stage_id)
        return {"success": True, "message": "Tedavi aşaması başarıyla silindi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

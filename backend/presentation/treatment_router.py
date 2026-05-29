from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.treatment_bll import TreatmentBLL

# Presentation Layer Routing definition for Tooth Treatments
router = APIRouter(prefix="/treatments", tags=["Tooth Treatments"])

class ToothTreatmentCreateSchema(BaseModel):
    patient_id: str
    tooth_num: int = Field(..., ge=11, le=48)
    treatment_type: str = Field(..., description="dolgu, kanal, temizlik, cekme, muayene")
    treatment_date: Optional[str] = None
    description: Optional[str] = None

@router.get("/")
def get_patient_treatments(patient_id: str, tooth_num: Optional[int] = 0):
    """
    HTTP GET: Fetch treatments of a specific patient.
    """
    try:
        return TreatmentBLL.get_patient_treatments(patient_id, tooth_num or 0)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_tooth_treatment(treatment_req: ToothTreatmentCreateSchema):
    """
    HTTP POST: Add new treatment record (and update patient tooth status via Trigger).
    """
    try:
        treatment_data = treatment_req.model_dump()
        TreatmentBLL.add_tooth_treatment(treatment_data)
        return {"success": True, "message": "Diş tedavisi başarıyla kaydedildi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

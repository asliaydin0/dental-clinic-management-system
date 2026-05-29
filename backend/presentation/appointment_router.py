from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.appointment_bll import AppointmentBLL

# Presentation Layer Routing definition for Appointments
router = APIRouter(prefix="/appointments", tags=["Appointments"])

class AppointmentCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    doctor_id: str
    appointment_date: str = Field(..., description="YYYY-MM-DD")
    appointment_time: str = Field(..., description="HH:MM")
    appointment_type: str = Field(..., min_length=2)
    status: Optional[str] = "Bekliyor"

@router.get("/")
def get_appointments():
    """
    HTTP GET: Fetch all appointments list.
    """
    try:
        return AppointmentBLL.get_all_appointments()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{app_id}")
def get_appointment(app_id: str):
    """
    HTTP GET: Retrieve single appointment by ID.
    """
    try:
        return AppointmentBLL.get_appointment(app_id)
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def schedule_appointment(app_req: AppointmentCreateSchema):
    """
    HTTP POST: Schedule a new appointment.
    """
    try:
        app_data = app_req.model_dump()
        AppointmentBLL.schedule_appointment(app_data)
        return {"success": True, "message": "Randevu başarıyla planlandı."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

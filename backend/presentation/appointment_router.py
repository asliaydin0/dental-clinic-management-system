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

class AppointmentUpdateSchema(BaseModel):
    patient_id: Optional[str] = None
    doctor_id: Optional[str] = None
    appointment_date: Optional[str] = None
    appointment_time: Optional[str] = None
    appointment_type: Optional[str] = None
    status: Optional[str] = None

@router.get("/")
def get_appointments(clinic_id: Optional[str] = None):
    """
    HTTP GET: Fetch all appointments list, optionally filtered by clinic_id.
    """
    try:
        return AppointmentBLL.get_all_appointments(clinic_id or "")
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

@router.put("/{app_id}")
def update_appointment(app_id: str, app_req: AppointmentUpdateSchema):
    """
    HTTP PUT: Update appointment details.
    """
    try:
        app_data = app_req.model_dump(exclude_unset=True)
        AppointmentBLL.update_appointment(app_id, app_data)
        return {"success": True, "message": "Randevu başarıyla güncellendi."}
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{app_id}")
def delete_appointment(app_id: str):
    """
    HTTP DELETE: Remove appointment by ID.
    """
    try:
        AppointmentBLL.delete_appointment(app_id)
        return {"success": True, "message": "Randevu başarıyla silindi."}
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


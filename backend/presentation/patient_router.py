from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.patient_bll import PatientBLL

# Presentation Layer Routing definition
router = APIRouter(prefix="/patients", tags=["Patients"])

# Request bodies validation schemas
class PatientCreateSchema(BaseModel):
    email: str
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    name: str = Field(..., min_length=2)
    phone_number: Optional[str] = None
    clinic_id: Optional[str] = None
    tc_no: str = Field(..., min_length=11, max_length=11)
    gender: str = Field(..., description="Erkek veya Kadın")
    dob: str  # Format: YYYY-MM-DD
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    avatar_url: Optional[str] = None
    recommended_treatment: Optional[str] = None
    primary_dentist_id: Optional[str] = None

class PatientUpdateSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    phone_number: Optional[str] = None
    tc_no: str = Field(..., min_length=11, max_length=11)
    gender: str = Field(..., description="Erkek veya Kadın")
    dob: str  # Format: YYYY-MM-DD
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    avatar_url: Optional[str] = None
    recommended_treatment: Optional[str] = None
    primary_dentist_id: Optional[str] = None
    treatment_status: Optional[str] = "Tedavide"

@router.get("/")
def get_patients(clinic_id: Optional[str] = None, doctor_id: Optional[str] = None):
    """
    HTTP GET: Fetch all patients list, optionally filtered by clinic_id and/or doctor_id.
    """
    try:
        return PatientBLL.get_all_patients(clinic_id, doctor_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}")
def get_patient(patient_id: str):
    """
    HTTP GET: Fetch single patient by their unique ID.
    """
    try:
        return PatientBLL.get_patient(patient_id)
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def register_patient(patient_req: PatientCreateSchema):
    """
    HTTP POST: Add new patient record.
    """
    try:
        user_data = {
            "email": patient_req.email,
            "password": patient_req.password,
            "name": patient_req.name,
            "phone_number": patient_req.phone_number,
            "clinic_id": patient_req.clinic_id
        }
        
        patient_data = {
            "tc_no": patient_req.tc_no,
            "gender": patient_req.gender,
            "dob": patient_req.dob,
            "blood_type": patient_req.blood_type,
            "allergies": patient_req.allergies,
            "avatar_url": patient_req.avatar_url,
            "recommended_treatment": patient_req.recommended_treatment,
            "primary_dentist_id": patient_req.primary_dentist_id
        }
        
        PatientBLL.register_patient(user_data, patient_data)
        return {"success": True, "message": "Hasta kaydı başarıyla oluşturuldu."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{patient_id}")
def delete_patient(patient_id: str):
    """
    HTTP DELETE: Remove patient from system.
    """
    try:
        PatientBLL.remove_patient(patient_id)
        return {"success": True, "message": "Hasta başarıyla silindi."}
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{patient_id}")
def update_patient(patient_id: str, patient_req: PatientUpdateSchema):
    """
    HTTP PUT: Update patient profile details dynamically.
    """
    try:
        patient_data = patient_req.model_dump()
        PatientBLL.update_patient(patient_id, patient_data)
        return {"success": True, "message": "Hasta bilgileri başarıyla güncellendi."}
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}/notifications")
def get_patient_notifications(patient_id: str):
    """
    HTTP GET: Fetch all notifications for a specific patient.
    """
    try:
        return PatientBLL.get_patient_notifications(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}/teeth")
def get_patient_teeth(patient_id: str):
    """
    HTTP GET: Fetch all tooth records for a patient.
    """
    try:
        return PatientBLL.get_patient_teeth(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}/analyses")
def get_patient_analyses(patient_id: str):
    """
    HTTP GET: Fetch radiography analyses and recommendations.
    """
    try:
        return PatientBLL.get_patient_analyses(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}/treatment_stages")
def get_patient_treatment_stages(patient_id: str):
    """
    HTTP GET: Fetch treatment stages.
    """
    try:
        return PatientBLL.get_patient_treatment_stages(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{patient_id}/upcoming_appointment")
def get_upcoming_appointment(patient_id: str):
    """
    HTTP GET: Fetch the single closest upcoming appointment.
    """
    try:
        return PatientBLL.get_upcoming_appointment(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

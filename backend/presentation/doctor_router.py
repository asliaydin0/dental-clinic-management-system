from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.doctor_bll import DoctorBLL

# Presentation Layer Routing definition for Doctors
router = APIRouter(prefix="/doctors", tags=["Doctors"])

class DoctorCreateSchema(BaseModel):
    id: Optional[str] = None
    email: str
    password: str = Field(..., min_length=6, description="Minimum 6 karakterli şifre")
    name: str = Field(..., min_length=2)
    phone_number: Optional[str] = None
    clinic_id: str
    diploma_no: str = Field(..., min_length=2)
    specialty: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/")
def get_doctors(clinic_id: Optional[str] = None):
    """
    HTTP GET: Fetch all doctors list, optionally filtered by clinic_id.
    """
    try:
        return DoctorBLL.get_all_doctors(clinic_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{doctor_id}")
def get_doctor(doctor_id: str):
    """
    HTTP GET: Retrieve single doctor by ID.
    """
    try:
        return DoctorBLL.get_doctor(doctor_id)
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def register_doctor(doctor_req: DoctorCreateSchema):
    """
    HTTP POST: Add new doctor record.
    """
    try:
        user_data = {
            "id": doctor_req.id,
            "email": doctor_req.email,
            "password": doctor_req.password,
            "name": doctor_req.name,
            "clinic_id": doctor_req.clinic_id,
            "phone_number": doctor_req.phone_number
        }
        doctor_data = {
            "user_id": doctor_req.id,
            "diploma_no": doctor_req.diploma_no,
            "specialty": doctor_req.specialty,
            "education": doctor_req.education,
            "bio": doctor_req.bio,
            "avatar_url": doctor_req.avatar_url,
            "clinic_id": doctor_req.clinic_id
        }
        DoctorBLL.register_doctor(user_data, doctor_data)
        return {"success": True, "message": "Hekim kaydı başarıyla oluşturuldu."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

class DoctorUpdateSchema(BaseModel):
    name: str = Field(..., min_length=2)
    email: str
    phone_number: Optional[str] = None
    diploma_no: str = Field(..., min_length=2)
    specialty: Optional[str] = None
    education: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    clinic_id: str

@router.put("/{doctor_id}")
def update_doctor(doctor_id: str, doctor_req: DoctorUpdateSchema):
    """
    HTTP PUT: Update doctor profile.
    """
    try:
        doctor_data = doctor_req.model_dump()
        DoctorBLL.update_doctor(doctor_id, doctor_data)
        return {"success": True, "message": "Hekim bilgileri başarıyla güncellendi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


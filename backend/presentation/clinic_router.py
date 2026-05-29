from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.clinic_bll import ClinicBLL

# Presentation Layer Routing definition for Clinics
router = APIRouter(prefix="/clinics", tags=["Clinics"])

# Request validation schema
class ClinicCreateSchema(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., min_length=2)
    logo_url: Optional[str] = None
    theme_color: Optional[str] = None
    status: Optional[str] = "passive"
    package_name: str = Field(..., description="Standard, Professional, veya Enterprise")
    doctor_limit: int = Field(..., gt=0)
    storage_limit: int = Field(..., gt=0)
    ai_scan_limit: int = Field(..., gt=0)
    phone: Optional[str] = None
    admin_email: Optional[str] = None
    temporary_password: Optional[str] = None
    created_date: Optional[str] = None

class ClinicUpdateSchema(BaseModel):
    id: str
    name: str = Field(..., min_length=2)
    logo_url: Optional[str] = None
    theme_color: Optional[str] = None
    status: Optional[str] = "passive"
    package_name: str
    doctor_limit: int = Field(..., gt=0)
    storage_limit: int = Field(..., gt=0)
    ai_scan_limit: int = Field(..., gt=0)
    doctor_count: Optional[int] = 0
    storage_used: Optional[float] = 0.0
    ai_scan_count: Optional[int] = 0
    phone: Optional[str] = None
    admin_email: Optional[str] = None
    temporary_password: Optional[str] = None

@router.get("/")
def get_clinics():
    """
    HTTP GET: Fetch all clinics list.
    """
    try:
        return ClinicBLL.get_all_clinics()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/{clinic_id}")
def get_clinic(clinic_id: str):
    """
    HTTP GET: Retrieve single clinic info.
    """
    try:
        return ClinicBLL.get_clinic(clinic_id)
    except KeyError as ke:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ke))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def register_clinic(clinic_req: ClinicCreateSchema):
    """
    HTTP POST: Add new clinic record.
    """
    try:
        clinic_data = clinic_req.model_dump()
        ClinicBLL.register_clinic(clinic_data)
        return {"success": True, "message": "Klinik kaydı başarıyla oluşturuldu."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.put("/{clinic_id}")
def update_clinic(clinic_id: str, clinic_req: ClinicUpdateSchema):
    """
    HTTP PUT: Update existing clinic record.
    """
    try:
        clinic_data = clinic_req.model_dump()
        clinic_data["id"] = clinic_id
        ClinicBLL.update_clinic(clinic_data)
        return {"success": True, "message": "Klinik bilgileri başarıyla güncellendi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.delete("/{clinic_id}")
def delete_clinic(clinic_id: str):
    """
    HTTP DELETE: Remove clinic record.
    """
    try:
        ClinicBLL.delete_clinic(clinic_id)
        return {"success": True, "message": "Klinik başarıyla silindi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


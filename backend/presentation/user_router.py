from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.user_bll import UserBLL

# Presentation Layer Routing definition for Users / Authentication
router = APIRouter(prefix="/users", tags=["Users"])

class LoginRequestSchema(BaseModel):
    email: str
    password: str

class UpdatePasswordRequestSchema(BaseModel):
    email: str
    new_password: str = Field(..., min_length=6)

@router.post("/login")
def login(req: LoginRequestSchema):
    """
    HTTP POST: Verify credentials and retrieve authenticated user profile.
    """
    try:
        user = UserBLL.authenticate_user(req.email, req.password)
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "clinicId": user.get("clinic_id") or "system",
                "isTemporaryPassword": bool(user.get("is_temporary_password")),
                "phoneNumber": user.get("phone_number")
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/update-password")
def update_password(req: UpdatePasswordRequestSchema):
    """
    HTTP POST: Update temporary password to permanent.
    """
    try:
        UserBLL.update_password(req.email, req.new_password)
        return {"success": True, "message": "Şifre başarıyla güncellendi."}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.get("/")
def get_users(clinic_id: Optional[str] = None):
    """
    HTTP GET: Fetch all users, optionally filtered by clinic_id.
    """
    try:
        return UserBLL.get_all_users(clinic_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

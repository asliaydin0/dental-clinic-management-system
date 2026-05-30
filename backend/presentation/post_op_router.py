import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from business.post_op_bll import PostOpBLL

router = APIRouter(prefix="/post_op_notifications", tags=["Post-Op Notifications"])

class PostOpNotificationCreateSchema(BaseModel):
    id: Optional[str] = None
    patient_id: str
    title: str
    message: str
    notification_date: str = Field(..., description="YYYY-MM-DD HH:MM:SS or ISO string")
    sent_by_doctor_id: str
    status: Optional[str] = "Gönderildi"

@router.get("/{patient_id}")
def get_notifications(patient_id: str):
    try:
        return PostOpBLL.get_patient_notifications(patient_id)
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_notification(notification_req: PostOpNotificationCreateSchema):
    try:
        data = notification_req.model_dump()
        if not data.get("id"):
            data["id"] = "NOTIF-" + str(uuid.uuid4())[:8].upper()
        
        # Clean datetime string format for MySQL if needed
        # Replace 'T' with space and remove timezone/milliseconds if present
        date_str = data["notification_date"]
        if "T" in date_str:
            date_str = date_str.replace("T", " ")
        if "." in date_str:
            date_str = date_str.split(".")[0]
        # In case it has a 'Z' or offset like +03:00 at the end
        if "Z" in date_str:
            date_str = date_str.replace("Z", "")
        if "+" in date_str:
            date_str = date_str.split("+")[0]
        
        data["notification_date"] = date_str.strip()

        PostOpBLL.add_notification(data)
        return {"success": True, "message": "Post-Op bildirimi başarıyla gönderildi.", "id": data["id"]}
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

from data_access.post_op_dal import PostOpDAL
from data_access.user_dal import UserDAL

class PostOpBLL:
    """
    Business Logic Layer (BLL) for Post-Op Notifications.
    """

    @staticmethod
    def get_patient_notifications(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        
        raw_notifications = PostOpDAL.get_post_op_notifications(patient_id)
        
        mapped_notifications = []
        for row in raw_notifications:
            doctor_name = "Hekiminiz"
            try:
                doc_user = UserDAL.get_user(row["sent_by_doctor_id"])
                if doc_user:
                    doctor_name = doc_user.get("name", "Hekiminiz")
            except Exception as e:
                print(f"Error fetching doctor name: {e}")

            # Map fields: id, patient_id, title, message, notification_date, sent_by_doctor_id, sent_by_doctor_name, status
            mapped_notifications.append({
                "id": row["id"],
                "patient_id": row["patient_id"],
                "title": row["title"],
                "message": row["message"],
                "notification_date": str(row["notification_date"]),
                "sent_by_doctor_id": row["sent_by_doctor_id"],
                "sent_by_doctor_name": doctor_name,
                "status": row["status"]
            })
        return mapped_notifications

    @staticmethod
    def add_notification(notification_data: dict) -> bool:
        if not notification_data.get("id"):
            raise ValueError("Bildirim ID boş bırakılamaz.")
        if not notification_data.get("patient_id"):
            raise ValueError("Hasta ID boş bırakılamaz.")
        if not notification_data.get("title") or not notification_data["title"].strip():
            raise ValueError("Başlık boş bırakılamaz.")
        if not notification_data.get("message") or not notification_data["message"].strip():
            raise ValueError("Mesaj boş bırakılamaz.")
        if not notification_data.get("notification_date"):
            raise ValueError("Bildirim tarihi boş bırakılamaz.")
        if not notification_data.get("sent_by_doctor_id"):
            raise ValueError("Gönderen hekim ID boş bırakılamaz.")
            
        return PostOpDAL.insert_post_op_notification(notification_data)

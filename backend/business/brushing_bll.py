from data_access.brushing_dal import BrushingDAL

class BrushingBLL:
    """
    Business Logic Layer (BLL) for Brushing Logs.
    """

    @staticmethod
    def get_patient_brushing_logs(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        
        raw_logs = BrushingDAL.get_patient_brushing_logs(patient_id)
        
        # Map DB row structures to dictionary representation
        mapped_logs = []
        for row in raw_logs:
            # Table fields: id, patient_id, log_date, log_time, duration_seconds, completed, score, period, floss_used, tongue_brushed
            mapped_logs.append({
                "id": str(row["id"]),
                "patient_id": row["patient_id"],
                "log_date": str(row["log_date"]),
                "log_time": str(row["log_time"]),
                "duration_seconds": row["duration_seconds"],
                "completed": bool(row["completed"]),
                "score": row["score"],
                "period": row["period"],
                "floss_used": bool(row["floss_used"]),
                "tongue_brushed": bool(row["tongue_brushed"])
            })
        return mapped_logs

    @staticmethod
    def add_brushing_log(log_data: dict) -> bool:
        if not log_data.get("patient_id"):
            raise ValueError("Hasta ID boş bırakılamaz.")
        if not log_data.get("log_date"):
            raise ValueError("Tarih boş bırakılamaz.")
        if not log_data.get("log_time"):
            raise ValueError("Saat boş bırakılamaz.")
        
        duration = log_data.get("duration_seconds", 0)
        if duration <= 0:
            raise ValueError("Fırçalama süresi 0'dan büyük olmalıdır.")
            
        # Calculate score: optimal duration is 120 seconds (up to 70 pts), floss (15 pts), tongue (15 pts)
        duration_score = min(70, int((duration / 120.0) * 70))
        floss_score = 15 if log_data.get("floss_used", 0) == 1 else 0
        tongue_score = 15 if log_data.get("tongue_brushed", 0) == 1 else 0
        calculated_score = max(1, min(100, duration_score + floss_score + tongue_score))
        
        log_data["score"] = calculated_score
        return BrushingDAL.insert_brushing_log(log_data)

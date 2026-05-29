from datetime import datetime
from data_access.appointment_dal import AppointmentDAL

class AppointmentBLL:
    """
    Business Logic Layer (BLL) for Appointments.
    """

    @staticmethod
    def _format_appointment(app: dict) -> dict:
        if not app:
            return app
        formatted = dict(app)
        # Format date
        if "appointment_date" in formatted and formatted["appointment_date"]:
            d = formatted["appointment_date"]
            if hasattr(d, "isoformat"):
                formatted["appointment_date"] = d.isoformat()
            else:
                formatted["appointment_date"] = str(d)
        # Format time
        if "appointment_time" in formatted and formatted["appointment_time"]:
            t = formatted["appointment_time"]
            if hasattr(t, "seconds"): # timedelta
                total_seconds = int(t.total_seconds())
                hours = total_seconds // 3600
                minutes = (total_seconds % 3600) // 60
                formatted["appointment_time"] = f"{hours:02d}:{minutes:02d}"
            else:
                t_str = str(t)
                if len(t_str) > 5:
                    formatted["appointment_time"] = t_str[:5]
                else:
                    formatted["appointment_time"] = t_str
        return formatted

    @staticmethod
    def get_appointment(app_id: str) -> dict:
        if not app_id or not app_id.strip():
            raise ValueError("Geçersiz Randevu ID. ID alanı boş bırakılamaz.")
        app = AppointmentDAL.get_appointment(app_id)
        if not app:
            raise KeyError(f"ID: {app_id} olan randevu bulunamadı.")
        return AppointmentBLL._format_appointment(app)

    @staticmethod
    def get_all_appointments(clinic_id: str = "") -> list:
        raw_apps = AppointmentDAL.get_all_appointments(clinic_id)
        return [AppointmentBLL._format_appointment(a) for a in raw_apps]

    @staticmethod
    def schedule_appointment(app_data: dict) -> bool:
        """
        Schedules a new appointment with business validation.
        """
        # 1. Check patient and doctor IDs
        if not app_data.get("patient_id"):
            raise ValueError("İş Kuralı İhlali: Hasta ID boş geçilemez.")
        if not app_data.get("doctor_id"):
            raise ValueError("İş Kuralı İhlali: Doktor ID boş geçilemez.")
        
        # 2. Check type
        if not app_data.get("appointment_type"):
            raise ValueError("İş Kuralı İhlali: Randevu türü belirtilmelidir.")

        # 3. Check date & time format
        date_str = app_data.get("appointment_date", "")
        time_str = app_data.get("appointment_time", "")
        if not date_str or not time_str:
            raise ValueError("İş Kuralı İhlali: Randevu tarihi ve saati eksiksiz girilmelidir.")

        try:
            datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError("İş Kuralı İhlali: Geçersiz tarih formatı (YYYY-MM-DD olmalı).")

        # 4. Generate ID if not present
        if not app_data.get("id"):
            app_data["id"] = f"APP-{datetime.now().strftime('%M%S%f')[:5]}"

        return AppointmentDAL.insert_appointment(app_data)

    @staticmethod
    def update_appointment(app_id: str, app_data: dict) -> bool:
        """
        Updates an existing appointment with validations.
        """
        if not app_id or not app_id.strip():
            raise ValueError("Geçersiz Randevu ID. ID alanı boş bırakılamaz.")

        # Validate date if sent
        date_str = app_data.get("appointment_date")
        if date_str:
            try:
                datetime.strptime(date_str, "%Y-%m-%d")
            except ValueError:
                raise ValueError("İş Kuralı İhlali: Geçersiz tarih formatı (YYYY-MM-DD olmalı).")

        # Validate status if sent
        status_val = app_data.get("status")
        if status_val and status_val not in ["Bekliyor", "Tamamlandı", "İptal Edildi"]:
            raise ValueError("İş Kuralı İhlali: Geçersiz randevu durumu.")

        # Check existing appointment
        old_app = AppointmentDAL.get_appointment(app_id)
        if not old_app:
            raise KeyError(f"ID: {app_id} olan randevu bulunamadı.")

        # Merge values
        merged_data = {
            "patient_id": app_data.get("patient_id") or old_app["patient_id"],
            "doctor_id": app_data.get("doctor_id") or old_app["doctor_id"],
            "appointment_date": app_data.get("appointment_date") or old_app["appointment_date"],
            "appointment_time": app_data.get("appointment_time") or old_app["appointment_time"],
            "appointment_type": app_data.get("appointment_type") or old_app["appointment_type"],
            "status": app_data.get("status") or old_app["status"]
        }

        # Format values for SP
        if hasattr(merged_data["appointment_date"], "isoformat"):
            merged_data["appointment_date"] = merged_data["appointment_date"].isoformat()
        else:
            merged_data["appointment_date"] = str(merged_data["appointment_date"])

        t = merged_data["appointment_time"]
        if hasattr(t, "seconds"):
            total_seconds = int(t.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            merged_data["appointment_time"] = f"{hours:02d}:{minutes:02d}"
        else:
            t_str = str(t)
            if len(t_str) > 5:
                merged_data["appointment_time"] = t_str[:5]
            else:
                merged_data["appointment_time"] = t_str

        return AppointmentDAL.update_appointment(app_id, merged_data)

    @staticmethod
    def delete_appointment(app_id: str) -> bool:
        """
        Deletes appointment by ID.
        """
        if not app_id or not app_id.strip():
            raise ValueError("Geçersiz Randevu ID. ID alanı boş bırakılamaz.")

        old_app = AppointmentDAL.get_appointment(app_id)
        if not old_app:
            raise KeyError(f"ID: {app_id} olan randevu bulunamadı.")

        return AppointmentDAL.delete_appointment(app_id)


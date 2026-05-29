from datetime import datetime
from data_access.appointment_dal import AppointmentDAL

class AppointmentBLL:
    """
    Business Logic Layer (BLL) for Appointments.
    """

    @staticmethod
    def get_appointment(app_id: str) -> dict:
        if not app_id or not app_id.strip():
            raise ValueError("Geçersiz Randevu ID. ID alanı boş bırakılamaz.")
        app = AppointmentDAL.get_appointment(app_id)
        if not app:
            raise KeyError(f"ID: {app_id} olan randevu bulunamadı.")
        return app

    @staticmethod
    def get_all_appointments() -> list:
        return AppointmentDAL.get_all_appointments()

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

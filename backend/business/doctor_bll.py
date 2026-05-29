import re
from datetime import datetime
from data_access.doctor_dal import DoctorDAL

class DoctorBLL:
    """
    Business Logic Layer (BLL) for Doctors.
    """

    @staticmethod
    def get_doctor(doctor_id: str) -> dict:
        if not doctor_id or not doctor_id.strip():
            raise ValueError("Geçersiz Hekim ID. ID alanı boş bırakılamaz.")
        doctor = DoctorDAL.get_doctor(doctor_id)
        if not doctor:
            raise KeyError(f"ID: {doctor_id} olan hekim bulunamadı.")
        return doctor

    @staticmethod
    def get_all_doctors(clinic_id: str = None) -> list:
        return DoctorDAL.get_all_doctors(clinic_id or "")

    @staticmethod
    def register_doctor(user_data: dict, doctor_data: dict) -> bool:
        """
        Registers a new doctor with validations.
        """
        # 1. Email validation
        email = user_data.get("email", "").strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not email or not re.match(email_regex, email):
            raise ValueError("İş Kuralı İhlali: Lütfen geçerli bir e-posta adresi giriniz.")
        user_data["email"] = email

        # 2. Diploma No validation
        diploma_no = doctor_data.get("diploma_no", "").strip()
        if not diploma_no:
            raise ValueError("İş Kuralı İhlali: Diploma tescil numarası boş geçilemez.")
        doctor_data["diploma_no"] = diploma_no

        # 3. Generate user_id if not present
        if not user_data.get("id"):
            user_data["id"] = f"DOC-{datetime.now().strftime('%M%S%f')[:5]}"

        doctor_data["user_id"] = user_data["id"]

        # Call DAL to execute stored procedures
        DoctorDAL.insert_user_for_doctor(user_data)
        DoctorDAL.insert_doctor(doctor_data)
        return True

    @staticmethod
    def update_doctor(doctor_id: str, doctor_data: dict) -> bool:
        """
        Updates doctor profile details and core user details.
        """
        # Validate doctor ID
        if not doctor_id or not doctor_id.strip():
            raise ValueError("Geçersiz Hekim ID.")
            
        # Email validation
        email = doctor_data.get("email", "").strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not email or not re.match(email_regex, email):
            raise ValueError("İş Kuralı İhlali: Lütfen geçerli bir e-posta adresi giriniz.")
            
        # Name validation
        name = doctor_data.get("name", "").strip()
        if not name:
            raise ValueError("İş Kuralı İhlali: Ad soyad boş geçilemez.")
            
        # Diploma No validation
        diploma_no = doctor_data.get("diploma_no", "").strip()
        if not diploma_no:
            raise ValueError("İş Kuralı İhlali: Diploma tescil numarası boş geçilemez.")

        doctor_data["user_id"] = doctor_id
        return DoctorDAL.update_doctor(doctor_data)


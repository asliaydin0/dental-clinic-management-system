import re
from datetime import datetime
from data_access.clinic_dal import ClinicDAL

class ClinicBLL:
    """
    Business Logic Layer (BLL) for Clinics.
    Validates business rules and constraints before calling the DAL.
    """

    @staticmethod
    def get_clinic(clinic_id: str) -> dict:
        """
        Retrieves a single clinic by its unique ID.
        """
        if not clinic_id or not clinic_id.strip():
            raise ValueError("Geçersiz Klinik ID. ID alanı boş bırakılamaz.")
        clinic = ClinicDAL.get_clinic(clinic_id)
        if not clinic:
            raise KeyError(f"ID: {clinic_id} olan klinik bulunamadı.")
        return clinic

    @staticmethod
    def get_all_clinics() -> list:
        """
        Retrieves all clinics list.
        """
        return ClinicDAL.get_all_clinics()

    @staticmethod
    def register_clinic(clinic_data: dict) -> bool:
        """
        Registers a new clinic. Enforces business rules:
        1. Clinic name cannot be empty.
        2. Admin email must be valid if provided.
        3. Limits (doctor, storage, AI scan) must be positive values.
        """
        # 1. Clinic Name Validation
        name = clinic_data.get("name", "").strip()
        if not name:
            raise ValueError("İş Kuralı İhlali: Klinik adı boş geçilemez.")

        # 2. Email Validation
        admin_email = clinic_data.get("admin_email", "")
        if admin_email:
            admin_email = admin_email.strip()
            email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
            if not re.match(email_regex, admin_email):
                raise ValueError("İş Kuralı İhlali: Geçersiz yönetici e-posta adresi.")
            clinic_data["admin_email"] = admin_email

        # 3. Numeric Limits Validation
        try:
            doc_limit = int(clinic_data.get("doctor_limit", 0))
            storage_limit = int(clinic_data.get("storage_limit", 0))
            ai_limit = int(clinic_data.get("ai_scan_limit", 0))
        except (ValueError, TypeError):
            raise ValueError("İş Kuralı İhlali: Sınır limit değerleri sayısal olmalıdır.")

        if doc_limit <= 0 or storage_limit <= 0 or ai_limit <= 0:
            raise ValueError("İş Kuralı İhlali: Doktor, depolama ve AI tarama limitleri 0'dan büyük olmalıdır.")

        # 4. Generate Clinic ID if not present
        if not clinic_data.get("id"):
            clinic_data["id"] = f"CLN-{datetime.now().strftime('%M%S%f')[:5]}"

        # 5. Set created date if not present
        if not clinic_data.get("created_date"):
            clinic_data["created_date"] = datetime.now().strftime("%Y-%m-%d")

        return ClinicDAL.insert_clinic(clinic_data)

    @staticmethod
    def update_clinic(clinic_data: dict) -> bool:
        """
        Validates clinic data and calls DAL to update clinic details.
        """
        # Validate Clinic ID
        clinic_id = clinic_data.get("id", "").strip()
        if not clinic_id:
            raise ValueError("İş Kuralı İhlali: Güncellenecek klinik ID'si boş geçilemez.")

        # Validate Name
        name = clinic_data.get("name", "").strip()
        if not name:
            raise ValueError("İş Kuralı İhlali: Klinik adı boş geçilemez.")

        # Email Validation
        admin_email = clinic_data.get("admin_email", "")
        if admin_email:
            admin_email = admin_email.strip()
            email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
            if not re.match(email_regex, admin_email):
                raise ValueError("İş Kuralı İhlali: Geçersiz yönetici e-posta adresi.")
            clinic_data["admin_email"] = admin_email

        # Limit validations
        try:
            doc_limit = int(clinic_data.get("doctor_limit", 0))
            storage_limit = int(clinic_data.get("storage_limit", 0))
            ai_limit = int(clinic_data.get("ai_scan_limit", 0))
        except (ValueError, TypeError):
            raise ValueError("İş Kuralı İhlali: Sınır limit değerleri sayısal olmalıdır.")

        if doc_limit <= 0 or storage_limit <= 0 or ai_limit <= 0:
            raise ValueError("İş Kuralı İhlali: Doktor, depolama ve AI tarama limitleri 0'dan büyük olmalıdır.")

        return ClinicDAL.update_clinic(clinic_data)

    @staticmethod
    def delete_clinic(clinic_id: str) -> bool:
        """
        Validates clinic ID and deletes clinic.
        """
        clinic_id = clinic_id.strip() if clinic_id else ""
        if not clinic_id:
            raise ValueError("İş Kuralı İhlali: Silinecek klinik ID'si boş bırakılamaz.")
        return ClinicDAL.delete_clinic(clinic_id)


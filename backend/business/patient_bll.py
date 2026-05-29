import re
from datetime import datetime
from data_access.patient_dal import PatientDAL

class PatientBLL:
    """
    Business Logic Layer (BLL) for Patients.
    Validates business rules, formatting, and constraints before data persistence.
    """

    @staticmethod
    def get_patient(patient_id: str) -> dict:
        """
        Retrieves patient by ID with business checks.
        """
        if not patient_id or not patient_id.strip():
            raise ValueError("Geçersiz Hasta ID. ID alanı boş bırakılamaz.")
        
        patient = PatientDAL.get_patient(patient_id)
        if not patient:
            raise KeyError(f"ID: {patient_id} olan hasta bulunamadı.")
            
        return patient

    @staticmethod
    def get_all_patients(clinic_id: str = None, doctor_id: str = None) -> list:
        """
        Retrieves all patients, optionally filtered by clinic_id and/or doctor_id.
        """
        return PatientDAL.get_all_patients(clinic_id or "", doctor_id or "")

    @staticmethod
    def register_patient(user_data: dict, patient_data: dict) -> bool:
        """
        Registers a new patient. Validates business constraints:
        1. TC No must be exactly 11 digits.
        2. Email must be valid.
        3. Date of birth (dob) must be in the past.
        """
        # 1. TC No Validation
        tc_no = patient_data.get("tc_no", "").strip()
        if not tc_no or len(tc_no) != 11 or not tc_no.isdigit():
            raise ValueError("İş Kuralı İhlali: TC Kimlik No tam olarak 11 haneli rakam olmalıdır.")
            
        # 2. Email Validation
        email = user_data.get("email", "").strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not email or not re.match(email_regex, email):
            raise ValueError("İş Kuralı İhlali: Lütfen geçerli bir e-posta adresi giriniz.")

        # 3. DOB Validation (Doğum Tarihi)
        dob_str = patient_data.get("dob", "")
        if not dob_str:
            raise ValueError("İş Kuralı İhlali: Doğum tarihi boş geçilemez.")
        try:
            dob_date = datetime.strptime(dob_str, "%Y-%m-%d").date()
            if dob_date >= datetime.now().date():
                raise ValueError("İş Kuralı İhlali: Doğum tarihi gelecek bir zamanı işaret edemez.")
        except ValueError:
            raise ValueError("İş Kuralı İhlali: Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.")

        # 4. Generate user_id if not present
        if not user_data.get("id"):
            user_data["id"] = f"PT-{datetime.now().strftime('%M%S%f')[:5]}"
            
        patient_data["user_id"] = user_data["id"]

        # Call DAL to execute stored procedures sequentially
        PatientDAL.insert_user_for_patient(user_data)
        PatientDAL.insert_patient(patient_data)
        return True
        
    @staticmethod
    def remove_patient(patient_id: str) -> bool:
        """
        Validates patient removal logic.
        """
        if not patient_id:
            raise ValueError("Hasta ID boş olamaz.")
        
        # Verify exists
        patient = PatientDAL.get_patient(patient_id)
        if not patient:
            raise KeyError(f"Hasta bulunamadı. ID: {patient_id}")
            
        return PatientDAL.delete_patient(patient_id)

    @staticmethod
    def update_patient(patient_id: str, patient_data: dict) -> bool:
        """
        Updates patient information with business checks.
        """
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
            
        # Verify exists
        patient = PatientDAL.get_patient(patient_id)
        if not patient:
            raise KeyError(f"Hasta bulunamadı. ID: {patient_id}")
            
        # 1. TC No Validation
        tc_no = patient_data.get("tc_no", "").strip()
        if not tc_no or len(tc_no) != 11 or not tc_no.isdigit():
            raise ValueError("İş Kuralı İhlali: TC Kimlik No tam olarak 11 haneli rakam olmalıdır.")
            
        # 2. Email Validation
        email = patient_data.get("email", "").strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not email or not re.match(email_regex, email):
            raise ValueError("İş Kuralı İhlali: Lütfen geçerli bir e-posta adresi giriniz.")

        # 3. DOB Validation (Doğum Tarihi)
        dob_str = patient_data.get("dob", "")
        if not dob_str:
            raise ValueError("İş Kuralı İhlali: Doğum tarihi boş geçilemez.")
        try:
            dob_date = datetime.strptime(dob_str, "%Y-%m-%d").date()
            if dob_date >= datetime.now().date():
                raise ValueError("İş Kuralı İhlali: Doğum tarihi gelecek bir zamanı işaret edemez.")
        except ValueError:
            raise ValueError("İş Kuralı İhlali: Geçersiz tarih formatı. YYYY-MM-DD formatında olmalıdır.")

        return PatientDAL.update_patient(patient_id, patient_data)

    @staticmethod
    def get_patient_notifications(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        return PatientDAL.get_patient_notifications(patient_id)

    @staticmethod
    def get_patient_teeth(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        return PatientDAL.get_patient_teeth(patient_id)

    @staticmethod
    def get_patient_analyses(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        return PatientDAL.get_patient_analyses(patient_id)

    @staticmethod
    def get_patient_treatment_stages(patient_id: str) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        return PatientDAL.get_patient_treatment_stages(patient_id)

    @staticmethod
    def get_upcoming_appointment(patient_id: str) -> dict:
        if not patient_id or not patient_id.strip():
            raise ValueError("Hasta ID boş bırakılamaz.")
        return PatientDAL.get_upcoming_appointment(patient_id)

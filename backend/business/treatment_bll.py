from datetime import datetime
from data_access.treatment_dal import TreatmentDAL

class TreatmentBLL:
    """
    Business Logic Layer (BLL) for Tooth Treatments.
    """

    @staticmethod
    def get_tooth_metadata(tooth_num: int) -> tuple:
        """
        Helper method to derive the anatomical name and zone of a tooth
        according to the FDI World Dental Federation notation (11-48).
        """
        if 11 <= tooth_num <= 18:
            zone = 'upper-right'
            name_prefix = 'Üst Sağ'
        elif 21 <= tooth_num <= 28:
            zone = 'upper-left'
            name_prefix = 'Üst Sol'
        elif 31 <= tooth_num <= 38:
            zone = 'lower-left'
            name_prefix = 'Alt Sol'
        elif 41 <= tooth_num <= 48:
            zone = 'lower-right'
            name_prefix = 'Alt Sağ'
        else:
            raise ValueError("Geçersiz Diş Numarası. FDI standardına göre 11-18, 21-28, 31-38, 41-48 arasında olmalıdır.")

        last_digit = tooth_num % 10
        if last_digit == 1:
            name_suffix = 'Orta Kesici'
        elif last_digit == 2:
            name_suffix = 'Yan Kesici'
        elif last_digit == 3:
            name_suffix = 'Köpek Dişi'
        elif last_digit == 4:
            name_suffix = '1. Küçük Azı'
        elif last_digit == 5:
            name_suffix = '2. Küçük Azı'
        elif last_digit == 6:
            name_suffix = '1. Büyük Azı'
        elif last_digit == 7:
            name_suffix = '2. Büyük Azı'
        elif last_digit == 8:
            name_suffix = '3. Büyük Azı (Yirmilik)'
        else:
            name_suffix = 'Diş'

        return f"{name_prefix} {name_suffix}", zone

    @staticmethod
    def get_patient_treatments(patient_id: str, tooth_num: int = 0) -> list:
        if not patient_id or not patient_id.strip():
            raise ValueError("Geçersiz Hasta ID.")
        return TreatmentDAL.get_patient_treatments(patient_id, tooth_num)

    @staticmethod
    def add_tooth_treatment(treatment_data: dict) -> bool:
        """
        Adds a treatment and handles FDI teeth initialization.
        """
        # 1. Validation
        patient_id = treatment_data.get("patient_id", "").strip()
        if not patient_id:
            raise ValueError("İş Kuralı İhlali: Hasta ID boş geçilemez.")

        try:
            tooth_num = int(treatment_data.get("tooth_num", 0))
        except (ValueError, TypeError):
            raise ValueError("İş Kuralı İhlali: Diş numarası geçerli bir sayı olmalıdır.")

        # Derive metadata (will raise ValueError if tooth_num is invalid)
        tooth_name, tooth_zone = TreatmentBLL.get_tooth_metadata(tooth_num)

        treatment_type = treatment_data.get("treatment_type", "").strip()
        valid_types = {'none', 'dolgu', 'kanal', 'temizlik', 'cekme', 'muayene'}
        if treatment_type not in valid_types:
            raise ValueError(f"İş Kuralı İhlali: Geçersiz tedavi tipi. Şunlardan biri olmalı: {', '.join(valid_types)}")

        # 2. Check if the tooth record exists in patient_teeth
        existing_tooth = TreatmentDAL.get_patient_tooth(patient_id, tooth_num)
        if not existing_tooth:
            # Initialize the tooth row
            tooth_init = {
                "patient_id": patient_id,
                "tooth_num": tooth_num,
                "name": tooth_name,
                "zone": tooth_zone,
                "status": "healthy",
                "notes": "Diş sistemi tarafından otomatik olarak oluşturuldu."
            }
            TreatmentDAL.insert_patient_tooth(tooth_init)

        # 3. Insert treatment record
        if not treatment_data.get("treatment_date"):
            treatment_data["treatment_date"] = datetime.now().strftime("%Y-%m-%d")

        return TreatmentDAL.insert_tooth_treatment(treatment_data)

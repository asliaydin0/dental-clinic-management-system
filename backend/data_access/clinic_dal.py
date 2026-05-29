from data_access.db_connection import DBConnectionContext

class ClinicDAL:
    """
    Data Access Layer (DAL) for Clinics.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_clinic(clinic_id: str) -> dict:
        """
        Retrieves clinic information by calling Stored Procedure 'sp_GetClinic'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetClinic", [clinic_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_clinics() -> list:
        """
        Retrieves all clinics by calling 'sp_GetClinic' with an empty string.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetClinic", [""])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def insert_clinic(clinic_data: dict) -> bool:
        """
        Inserts clinic record by calling Stored Procedure 'sp_InsertClinic'.
        Also auto-provisions the clinic administrator account in the users table.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                clinic_data["id"],
                clinic_data["name"],
                clinic_data.get("logo_url"),
                clinic_data.get("theme_color"),
                clinic_data.get("status", "passive"),
                clinic_data["package_name"],
                clinic_data["doctor_limit"],
                clinic_data["storage_limit"],
                clinic_data["ai_scan_limit"],
                clinic_data.get("phone"),
                clinic_data.get("admin_email"),
                clinic_data.get("temporary_password"),
                clinic_data["created_date"]
            ]
            cursor.callproc("sp_InsertClinic", args)

            # Auto-provision clinic admin user
            admin_email = clinic_data.get("admin_email")
            temp_pass = clinic_data.get("temporary_password")
            if admin_email and temp_pass:
                import time
                user_id = f"usr-cln-{int(time.time())}"
                user_args = [
                    user_id,
                    admin_email.strip().lower(),
                    temp_pass.strip(),
                    f"{clinic_data['name']} Yöneticisi",
                    "clinic_admin",
                    clinic_data["id"],
                    1,  # is_temporary_password = True
                    clinic_data.get("phone") or "0500 000 00 00"
                ]
                cursor.callproc("sp_InsertUser", user_args)

                # Auto-provision clinic admin as a doctor (Chief Physician / Başhekim)
                import random
                diploma_no = f"BH-{int(time.time())}-{random.randint(1000, 9999)}"
                doctor_args = [
                    user_id,
                    diploma_no,
                    "Başhekim",
                    "Tıp/Diş Hekimliği Fakültesi",
                    "Klinik Başhekimi ve Yönetici",
                    "",
                    clinic_data["id"]
                ]
                cursor.callproc("sp_InsertDoctor", doctor_args)
            conn.commit()
            return True

    @staticmethod
    def update_clinic(clinic_data: dict) -> bool:
        """
        Updates clinic details by calling Stored Procedure 'sp_UpdateClinic'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                clinic_data["id"],
                clinic_data["name"],
                clinic_data.get("logo_url"),
                clinic_data.get("theme_color"),
                clinic_data.get("status", "passive"),
                clinic_data["package_name"],
                clinic_data["doctor_limit"],
                clinic_data["storage_limit"],
                clinic_data["ai_scan_limit"],
                clinic_data.get("doctor_count", 0),
                float(clinic_data.get("storage_used", 0.0)),
                clinic_data.get("ai_scan_count", 0),
                clinic_data.get("phone"),
                clinic_data.get("admin_email"),
                clinic_data.get("temporary_password")
            ]
            cursor.callproc("sp_UpdateClinic", args)
            conn.commit()
            return True

    @staticmethod
    def delete_clinic(clinic_id: str) -> bool:
        """
        Deletes a clinic by calling Stored Procedure 'sp_DeleteClinic'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_DeleteClinic", [clinic_id])
            conn.commit()
            return True


import mysql.connector
from data_access.db_connection import DBConnectionContext

class PatientDAL:
    """
    Data Access Layer (DAL) for Patients.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_patient(patient_id: str, clinic_id: str = "", doctor_id: str = "") -> dict:
        """
        Retrieves patient information by calling Stored Procedure 'sp_GetPatient'.
        """
        with DBConnectionContext() as (conn, cursor):
            # Safe call to Stored Procedure
            cursor.callproc("sp_GetPatient", [patient_id, clinic_id, doctor_id])
            
            # Stored Procedures return results through stored_results()
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
                
            return results[0] if results else None

    @staticmethod
    def get_all_patients(clinic_id: str = "", doctor_id: str = "") -> list:
        """
        Retrieves all patients by calling Stored Procedure 'sp_GetPatient' with empty string.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetPatient", ["", clinic_id, doctor_id])
            
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
                
            return results

    @staticmethod
    def insert_user_for_patient(user_data: dict) -> bool:
        """
        Helper method to insert into users table first (FK requirement).
        Calls Stored Procedure 'sp_InsertUser'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                user_data["id"],
                user_data["email"],
                user_data["password"],
                user_data["name"],
                "patient",  # Role is locked as patient
                user_data.get("clinic_id"),
                1,  # is_temporary_password defaulted to True
                user_data.get("phone_number")
            ]
            cursor.callproc("sp_InsertUser", args)
            conn.commit()
            return True

    @staticmethod
    def insert_patient(patient_data: dict) -> bool:
        """
        Inserts patient details by calling Stored Procedure 'sp_InsertPatient'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                patient_data["user_id"],
                patient_data["tc_no"],
                patient_data["gender"],
                patient_data["dob"],
                patient_data.get("blood_type"),
                patient_data.get("allergies"),
                patient_data.get("treatment_status", "Teşhis Aşamasında"),
                patient_data.get("avatar_url"),
                patient_data.get("recommended_treatment"),
                patient_data.get("primary_dentist_id")
            ]
            cursor.callproc("sp_InsertPatient", args)
            conn.commit()
            return True
            
    @staticmethod
    def delete_patient(patient_id: str) -> bool:
        """
        Deletes patient by calling 'sp_DeletePatient'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_DeletePatient", [patient_id])
            conn.commit()
            return True

    @staticmethod
    def update_patient(patient_id: str, patient_data: dict) -> bool:
        """
        Updates patient details by calling Stored Procedure 'sp_UpdatePatient'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                patient_id,
                patient_data["tc_no"],
                patient_data["gender"],
                patient_data["dob"],
                patient_data.get("blood_type"),
                patient_data.get("allergies"),
                patient_data.get("treatment_status", "Tedavide"),
                patient_data.get("avatar_url"),
                patient_data.get("recommended_treatment"),
                patient_data.get("primary_dentist_id"),
                patient_data["name"],
                patient_data["email"],
                patient_data.get("phone_number")
            ]
            cursor.callproc("sp_UpdatePatient", args)
            conn.commit()
            return True

    @staticmethod
    def get_patient_notifications(patient_id: str) -> list:
        """
        Retrieves notifications for a specific patient by calling 'sp_GetPostOpNotification'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetPostOpNotification", ["", patient_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def get_patient_teeth(patient_id: str) -> list:
        """
        Retrieves all tooth records for a patient by calling 'sp_GetPatientTooth'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetPatientTooth", [patient_id, 0])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def get_patient_analyses(patient_id: str) -> list:
        """
        Retrieves all analysis files for a patient, along with their recommendations.
        """
        with DBConnectionContext() as (conn, cursor):
            # Fetch analyses
            cursor.callproc("sp_GetAnalysisFile", ["", patient_id])
            analyses = []
            for result in cursor.stored_results():
                analyses.extend(result.fetchall())
            
            # Fetch recommendations for each analysis
            for analysis in analyses:
                cursor.callproc("sp_GetAnalysisRecommendation", [0, analysis["id"]])
                recs = []
                for result in cursor.stored_results():
                    recs.extend(result.fetchall())
                analysis["recommendations"] = [r["recommendation"] for r in recs]
                
            return analyses

    @staticmethod
    def get_patient_treatment_stages(patient_id: str) -> list:
        """
        Retrieves all treatment stages for a patient by calling 'sp_GetTreatmentStage'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetTreatmentStage", [0, patient_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def get_upcoming_appointment(patient_id: str) -> dict:
        """
        Queries all appointments and returns the closest pending one.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetAppointment", [""])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            
            from datetime import date
            today_str = date.today().isoformat()
            
            patient_apps = []
            for a in results:
                if a["patient_id"] == patient_id and a["status"] == "Bekliyor":
                    app_date_str = a["appointment_date"].isoformat() if hasattr(a["appointment_date"], "isoformat") else str(a["appointment_date"])
                    if app_date_str >= today_str:
                        patient_apps.append(a)
            
            if patient_apps:
                patient_apps.sort(key=lambda x: (
                    x["appointment_date"].isoformat() if hasattr(x["appointment_date"], "isoformat") else str(x["appointment_date"]),
                    str(x["appointment_time"])
                ))
                return patient_apps[0]
            return None

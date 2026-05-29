from data_access.db_connection import DBConnectionContext

class TreatmentDAL:
    """
    Data Access Layer (DAL) for Tooth Treatments.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_tooth_treatment(treatment_id: int) -> dict:
        """
        Retrieves a single tooth treatment record.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetToothTreatment", [treatment_id, "", 0])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_treatments() -> list:
        """
        Retrieves all treatments.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetToothTreatment", [None, "", 0])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def get_patient_treatments(patient_id: str, tooth_num: int = 0) -> list:
        """
        Retrieves all treatment records for a patient (optionally filtered by tooth number).
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetToothTreatment", [None, patient_id, tooth_num])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def get_patient_tooth(patient_id: str, tooth_num: int) -> dict:
        """
        Retrieves details of a patient's tooth.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetPatientTooth", [patient_id, tooth_num])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def insert_patient_tooth(tooth_data: dict) -> bool:
        """
        Initializes a tooth record in patient_teeth.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                tooth_data["patient_id"],
                tooth_data["tooth_num"],
                tooth_data["name"],
                tooth_data["zone"],
                tooth_data.get("status", "healthy"),
                tooth_data.get("notes")
            ]
            cursor.callproc("sp_InsertPatientTooth", args)
            return True

    @staticmethod
    def insert_tooth_treatment(treatment_data: dict) -> bool:
        """
        Inserts a tooth treatment record by calling Stored Procedure 'sp_InsertToothTreatment'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                treatment_data["patient_id"],
                treatment_data["tooth_num"],
                treatment_data["treatment_type"],
                treatment_data["treatment_date"],
                treatment_data.get("description")
            ]
            cursor.callproc("sp_InsertToothTreatment", args)
            return True

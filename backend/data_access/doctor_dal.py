from data_access.db_connection import DBConnectionContext

class DoctorDAL:
    """
    Data Access Layer (DAL) for Doctors.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_doctor(doctor_id: str, clinic_id: str = "") -> dict:
        """
        Retrieves doctor information by calling Stored Procedure 'sp_GetDoctor'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetDoctor", [doctor_id, clinic_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_doctors(clinic_id: str = "") -> list:
        """
        Retrieves all doctors by calling 'sp_GetDoctor' with an empty string.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetDoctor", ["", clinic_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def insert_user_for_doctor(user_data: dict) -> bool:
        """
        Inserts core user record for doctor first due to FK requirements.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                user_data["id"],
                user_data["email"],
                user_data["password"],
                user_data["name"],
                "doctor",  # Role locked to doctor
                user_data["clinic_id"],
                1,  # is_temporary_password defaults to True
                user_data.get("phone_number")
            ]
            cursor.callproc("sp_InsertUser", args)
            conn.commit()
            return True

    @staticmethod
    def insert_doctor(doctor_data: dict) -> bool:
        """
        Inserts doctor profile details by calling Stored Procedure 'sp_InsertDoctor'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                doctor_data["user_id"],
                doctor_data["diploma_no"],
                doctor_data.get("specialty"),
                doctor_data.get("education"),
                doctor_data.get("bio"),
                doctor_data.get("avatar_url"),
                doctor_data["clinic_id"]
            ]
            cursor.callproc("sp_InsertDoctor", args)
            conn.commit()
            return True

    @staticmethod
    def update_doctor(doctor_data: dict) -> bool:
        """
        Updates doctor profile details by calling Stored Procedure 'sp_UpdateDoctor'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                doctor_data["user_id"],
                doctor_data["diploma_no"],
                doctor_data.get("specialty"),
                doctor_data.get("education"),
                doctor_data.get("bio"),
                doctor_data.get("avatar_url"),
                doctor_data["clinic_id"],
                doctor_data["name"],
                doctor_data["email"],
                doctor_data.get("phone_number")
            ]
            cursor.callproc("sp_UpdateDoctor", args)
            conn.commit()
            return True



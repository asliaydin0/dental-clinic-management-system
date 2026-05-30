from data_access.db_connection import DBConnectionContext

class AppointmentDAL:
    """
    Data Access Layer (DAL) for Appointments.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_appointment(app_id: str) -> dict:
        """
        Retrieves appointment by calling Stored Procedure 'sp_GetAppointment'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetAppointment", [app_id, ""])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_appointments(clinic_id: str = "") -> list:
        """
        Retrieves all appointments by calling 'sp_GetAppointment' with clinic_id filter.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetAppointment", ["", clinic_id or ""])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def insert_appointment(app_data: dict) -> bool:
        """
        Inserts appointment detail by calling Stored Procedure 'sp_InsertAppointment'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                app_data["id"],
                app_data["patient_id"],
                app_data["doctor_id"],
                app_data["appointment_date"],
                app_data["appointment_time"],
                app_data["appointment_type"],
                app_data.get("status", "Bekliyor")
            ]
            cursor.callproc("sp_InsertAppointment", args)
            conn.commit()
            return True

    @staticmethod
    def update_appointment(app_id: str, app_data: dict) -> bool:
        """
        Updates appointment by calling Stored Procedure 'sp_UpdateAppointment'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                app_id,
                app_data["patient_id"],
                app_data["doctor_id"],
                app_data["appointment_date"],
                app_data["appointment_time"],
                app_data["appointment_type"],
                app_data.get("status", "Bekliyor")
            ]
            cursor.callproc("sp_UpdateAppointment", args)
            conn.commit()
            return True

    @staticmethod
    def delete_appointment(app_id: str) -> bool:
        """
        Deletes appointment by calling Stored Procedure 'sp_DeleteAppointment'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_DeleteAppointment", [app_id])
            conn.commit()
            return True

    @staticmethod
    def get_upcoming_appointment(patient_id: str) -> dict:
        """
        Retrieves upcoming appointment for patient using 'sp_GetPatientUpcomingAppointment'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetPatientUpcomingAppointment", [patient_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

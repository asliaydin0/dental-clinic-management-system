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
            cursor.callproc("sp_GetAppointment", [app_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_appointments() -> list:
        """
        Retrieves all appointments by calling 'sp_GetAppointment' with an empty string.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetAppointment", [""])
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
            return True

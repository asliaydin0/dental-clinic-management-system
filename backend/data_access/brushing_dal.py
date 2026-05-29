from data_access.db_connection import DBConnectionContext

class BrushingDAL:
    """
    Data Access Layer (DAL) for Brushing Logs.
    Strictly calls Stored Procedures via MySQL connector.
    """

    @staticmethod
    def get_patient_brushing_logs(patient_id: str) -> list:
        """
        Retrieves all brushing logs for a patient by calling Stored Procedure 'sp_GetBrushingLog'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetBrushingLog", [0, patient_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def insert_brushing_log(log_data: dict) -> bool:
        """
        Inserts a brushing log by calling Stored Procedure 'sp_InsertBrushingLog'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                log_data["patient_id"],
                log_data["log_date"],
                log_data["log_time"],
                log_data["duration_seconds"],
                log_data.get("completed", 1),
                log_data["score"],
                log_data.get("period", "Sabah"),
                log_data.get("floss_used", 0),
                log_data.get("tongue_brushed", 0)
            ]
            cursor.callproc("sp_InsertBrushingLog", args)
            conn.commit()
            return True

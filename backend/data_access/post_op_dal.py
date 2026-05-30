from data_access.db_connection import DBConnectionContext

class PostOpDAL:
    """
    Data Access Layer (DAL) for Post-Op Notifications.
    Calls Stored Procedures via MySQL connector.
    """

    @staticmethod
    def get_post_op_notifications(patient_id: str) -> list:
        """
        Retrieves all post-op notifications for a patient by calling 'sp_GetPostOpNotification'.
        """
        with DBConnectionContext() as (conn, cursor):
            # Arguments for sp_GetPostOpNotification: IN p_id VARCHAR(50), IN p_patient_id VARCHAR(50)
            cursor.callproc("sp_GetPostOpNotification", ["", patient_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def insert_post_op_notification(notification_data: dict) -> bool:
        """
        Inserts a post-op notification by calling 'sp_InsertPostOpNotification'.
        """
        with DBConnectionContext() as (conn, cursor):
            args = [
                notification_data["id"],
                notification_data["patient_id"],
                notification_data["title"],
                notification_data["message"],
                notification_data["notification_date"],
                notification_data["sent_by_doctor_id"],
                notification_data.get("status", "Gönderildi")
            ]
            cursor.callproc("sp_InsertPostOpNotification", args)
            conn.commit()  # Explicitly commit as requested by user
            return True

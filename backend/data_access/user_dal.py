from data_access.db_connection import DBConnectionContext

class UserDAL:
    """
    Data Access Layer (DAL) for Users.
    Strictly calls Stored Procedures via MySQL connector. No raw SQL allowed.
    """

    @staticmethod
    def get_user(user_id: str, clinic_id: str = "") -> dict:
        """
        Retrieves user by calling Stored Procedure 'sp_GetUser'.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetUser", [user_id, clinic_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results[0] if results else None

    @staticmethod
    def get_all_users(clinic_id: str = "") -> list:
        """
        Retrieves all users by calling 'sp_GetUser' with an empty string.
        """
        with DBConnectionContext() as (conn, cursor):
            cursor.callproc("sp_GetUser", ["", clinic_id])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            return results

    @staticmethod
    def update_user_password(user_id: str, new_password: str) -> bool:
        """
        Updates user password by fetching user and calling 'sp_UpdateUser'.
        Also updates the clinic's status to active if the user is a clinic_admin.
        """
        with DBConnectionContext() as (conn, cursor):
            # Fetch existing user details first
            cursor.callproc("sp_GetUser", [user_id, ""])
            results = []
            for result in cursor.stored_results():
                results.extend(result.fetchall())
            
            if not results:
                return False
            
            user = results[0]
            # args: id, email, password, name, role, clinic_id, is_temporary_password, phone_number
            args = [
                user["id"],
                user["email"],
                new_password,
                user["name"],
                user["role"],
                user.get("clinic_id"),
                0,  # is_temporary_password updated to False
                user.get("phone_number")
            ]
            cursor.callproc("sp_UpdateUser", args)

            # Activate clinic if this user is a clinic admin
            clinic_id = user.get("clinic_id")
            if user["role"] == "clinic_admin" and clinic_id:
                cursor.callproc("sp_GetClinic", [clinic_id])
                cln_results = []
                for res in cursor.stored_results():
                    cln_results.extend(res.fetchall())
                if cln_results:
                    c = cln_results[0]
                    # sp_UpdateClinic parameters:
                    # id, name, logo_url, theme_color, status, package_name, doctor_limit, storage_limit, ai_scan_limit,
                    # doctor_count, storage_used, ai_scan_count, phone, admin_email, temporary_password
                    cln_args = [
                        c["id"],
                        c["name"],
                        c.get("logo_url"),
                        c.get("theme_color"),
                        "active",  # set status to active!
                        c["package_name"],
                        c["doctor_limit"],
                        c["storage_limit"],
                        c["ai_scan_limit"],
                        c.get("doctor_count", 0),
                        float(c.get("storage_used", 0.0)) if c.get("storage_used") is not None else 0.0,
                        c.get("ai_scan_count", 0),
                        c.get("phone"),
                        c.get("admin_email"),
                        new_password  # updated password
                    ]
                    cursor.callproc("sp_UpdateClinic", cln_args)
            return True


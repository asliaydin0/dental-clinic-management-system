from data_access.user_dal import UserDAL

class UserBLL:
    """
    Business Logic Layer (BLL) for Users.
    """

    @staticmethod
    def authenticate_user(email: str, password: str) -> dict:
        """
        Authenticates a user by checking the credentials against the database.
        """
        email_clean = email.strip().lower()
        users = UserDAL.get_all_users()
        
        # Find matching user by email
        user = next((u for u in users if u["email"].strip().lower() == email_clean), None)
        if not user:
            raise ValueError("E-posta adresi sistemde bulunamadı.")
            
        if user["password"] != password:
            raise ValueError("Girdiğiniz şifre hatalıdır.")
            
        # Synchronization check for clinic_admin
        if user["role"] == "clinic_admin":
            from data_access.doctor_dal import DoctorDAL
            import random
            import time
            try:
                doc = DoctorDAL.get_doctor(user["id"])
                if not doc:
                    diploma_no = f"BH-{int(time.time())}-{random.randint(1000, 9999)}"
                    doctor_data = {
                        "user_id": user["id"],
                        "diploma_no": diploma_no,
                        "specialty": "Başhekim",
                        "education": "Tıp/Diş Hekimliği Fakültesi",
                        "bio": "Klinik Başhekimi ve Yönetici",
                        "avatar_url": "",
                        "clinic_id": user.get("clinic_id") or "CLN-101"
                    }
                    DoctorDAL.insert_doctor(doctor_data)
                    print(f"Successfully synced logging-in clinic_admin {email_clean} as Başhekim.")
            except Exception as e:
                print(f"Clinic admin doctor sync error during login: {e}")
            
        return user

    @staticmethod
    def sync_existing_clinic_admins():
        """
        Finds all clinic_admin users and ensures they exist in the doctors table.
        """
        from data_access.user_dal import UserDAL
        from data_access.doctor_dal import DoctorDAL
        import random
        import time
        try:
            users = UserDAL.get_all_users()
            clinic_admins = [u for u in users if u["role"] == "clinic_admin"]
            doctors = DoctorDAL.get_all_doctors()
            doctor_ids = {d["user_id"] for d in doctors if d.get("user_id")}
            
            for admin in clinic_admins:
                if admin["id"] not in doctor_ids:
                    diploma_no = f"BH-{int(time.time())}-{random.randint(1000, 9999)}"
                    doctor_data = {
                        "user_id": admin["id"],
                        "diploma_no": diploma_no,
                        "specialty": "Başhekim",
                        "education": "Tıp/Diş Hekimliği Fakültesi",
                        "bio": "Klinik Başhekimi ve Yönetici",
                        "avatar_url": "",
                        "clinic_id": admin.get("clinic_id") or "CLN-101"
                    }
                    DoctorDAL.insert_doctor(doctor_data)
                    print(f"Synced existing clinic_admin {admin['email']} as Başhekim in doctors table.")
        except Exception as e:
            print(f"Error syncing clinic admins at startup: {e}")

    @staticmethod
    def get_all_users(clinic_id: str = None) -> list:
        """
        Retrieves all users, optionally filtered by clinic_id.
        """
        return UserDAL.get_all_users(clinic_id or "")

    @staticmethod
    def update_password(email: str, new_password: str) -> bool:
        """
        Updates temporary password to permanent.
        """
        if len(new_password) < 6:
            raise ValueError("Şifre en az 6 karakter uzunluğunda olmalıdır.")
            
        email_clean = email.strip().lower()
        users = UserDAL.get_all_users()
        user = next((u for u in users if u["email"].strip().lower() == email_clean), None)
        if not user:
            raise ValueError("E-posta adresi bulunamadı.")
            
        return UserDAL.update_user_password(user["id"], new_password)


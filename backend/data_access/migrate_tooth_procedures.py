import mysql.connector
import traceback

db_config = {
    "host": "localhost",
    "port": 3307,
    "user": "root",
    "password": "Asli1205?",
    "database": "dental_clinic_db",
    "raise_on_warnings": False,
    "use_pure": True
}

procedures = [
    {
        "drop": "DROP PROCEDURE IF EXISTS sp_GetToothTreatment",
        "create": """
        CREATE PROCEDURE sp_GetToothTreatment(
            IN p_id INT, 
            IN p_patient_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, 
            IN p_tooth_num INT
        )
        BEGIN
            IF p_id IS NOT NULL AND p_id > 0 THEN
                SELECT * FROM tooth_treatments WHERE id = p_id;
            ELSEIF p_patient_id IS NOT NULL AND p_patient_id <> '' AND p_tooth_num IS NOT NULL AND p_tooth_num > 0 THEN
                SELECT * FROM tooth_treatments WHERE patient_id = p_patient_id AND tooth_num = p_tooth_num ORDER BY treatment_date DESC;
            ELSEIF p_patient_id IS NOT NULL AND p_patient_id <> '' THEN
                SELECT * FROM tooth_treatments WHERE patient_id = p_patient_id ORDER BY treatment_date DESC;
            ELSE
                SELECT * FROM tooth_treatments;
            END IF;
        END
        """
    },
    {
        "drop": "DROP PROCEDURE IF EXISTS sp_InsertToothTreatment",
        "create": """
        CREATE PROCEDURE sp_InsertToothTreatment(
            IN p_patient_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, 
            IN p_tooth_num INT,
            IN p_treatment_type VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
            IN p_treatment_date DATE, 
            IN p_description TEXT
        )
        BEGIN
            INSERT INTO tooth_treatments (patient_id, tooth_num, treatment_type, treatment_date, description)
            VALUES (p_patient_id, p_tooth_num, p_treatment_type, p_treatment_date, p_description);
        END
        """
    },
    {
        "drop": "DROP PROCEDURE IF EXISTS sp_UpdateToothTreatment",
        "create": """
        CREATE PROCEDURE sp_UpdateToothTreatment(
            IN p_id INT, 
            IN p_patient_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci, 
            IN p_tooth_num INT,
            IN p_treatment_type VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
            IN p_treatment_date DATE, 
            IN p_description TEXT
        )
        BEGIN
            UPDATE tooth_treatments
            SET patient_id = p_patient_id, tooth_num = p_tooth_num, treatment_type = p_treatment_type,
                treatment_date = p_treatment_date, description = p_description
            WHERE id = p_id;
        END
        """
    }
]

try:
    print("Connecting to DB...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    for idx, proc in enumerate(procedures, start=1):
        name = proc["drop"].split("sp_")[1]
        print(f"[{idx}/{len(procedures)}] Recreating sp_{name}...")
        cursor.execute(proc["drop"])
        cursor.execute(proc["create"])
        
    conn.commit()
    print("Stored procedures recreated successfully with proper collations and treatment types!")
    
    cursor.close()
    conn.close()
    print("Migration completed.")
except Exception as e:
    print("Error during migration:")
    traceback.print_exc()

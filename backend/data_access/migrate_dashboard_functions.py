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

functions = [
    {
        "drop": "DROP FUNCTION IF EXISTS fn_GetUnhealthyToothCount",
        "create": """
        CREATE FUNCTION fn_GetUnhealthyToothCount(p_patient_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)
        RETURNS INT
        DETERMINISTIC
        READS SQL DATA
        BEGIN
            DECLARE v_count INT;
            SELECT COUNT(*) INTO v_count
            FROM patient_teeth
            WHERE patient_id = p_patient_id AND status IN ('risk', 'treatment');
            RETURN IFNULL(v_count, 0);
        END
        """
    },
    {
        "drop": "DROP FUNCTION IF EXISTS fn_GetAverageBrushingScore",
        "create": """
        CREATE FUNCTION fn_GetAverageBrushingScore(p_patient_id VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci)
        RETURNS DECIMAL(5,2)
        DETERMINISTIC
        READS SQL DATA
        BEGIN
            DECLARE v_avg_score DECIMAL(5,2);
            SELECT AVG(score) INTO v_avg_score
            FROM brushing_logs
            WHERE patient_id = p_patient_id;
            RETURN IFNULL(v_avg_score, 0.00);
        END
        """
    }
]

try:
    print("Connecting to DB...")
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    for idx, fn in enumerate(functions, start=1):
        name = fn["drop"].split("fn_")[1]
        print(f"[{idx}/{len(functions)}] Recreating fn_{name}...")
        cursor.execute(fn["drop"])
        cursor.execute(fn["create"])
        
    conn.commit()
    print("Database functions recreated successfully with correct collations!")
    
    cursor.close()
    conn.close()
    print("Migration completed.")
except Exception as e:
    print("Error during function migration:")
    traceback.print_exc()

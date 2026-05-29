import mysql.connector
from mysql.connector import pooling
from config import Config


# Initialize connection pool for performance and scalability
try:
    db_config = Config.get_db_config()
    connection_pool = mysql.connector.pooling.MySQLConnectionPool(
        pool_name="dental_pool",
        pool_size=5,  # Moderate size for connection pooling
        pool_reset_session=True,
        use_pure=True,
        charset="utf8mb4",
        collation="utf8mb4_unicode_ci",
        **db_config
    )
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    connection_pool = None

class DBConnectionContext:
    """
    Context manager to safely acquire and release database connections.
    """
    def __enter__(self):
        if not connection_pool:
            # Fallback if pool initialization failed
            self.conn = mysql.connector.connect(**Config.get_db_config())
        else:
            self.conn = connection_pool.get_connection()
        
        self.cursor = self.conn.cursor(dictionary=True)  # Return rows as dictionaries
        return self.conn, self.cursor

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is None:
                if hasattr(self, 'conn') and self.conn:
                    self.conn.commit()
            else:
                if hasattr(self, 'conn') and self.conn:
                    self.conn.rollback()
        except Exception as err:
            print(f"Error during context commit/rollback: {err}")
        finally:
            if hasattr(self, 'cursor') and self.cursor:
                self.cursor.close()
            if hasattr(self, 'conn') and self.conn:
                self.conn.close()  # Returns connection back to pool

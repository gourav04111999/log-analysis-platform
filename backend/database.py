import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    """This function connects Python to your PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )
        print("Database connected successfully!")
        return conn
    except Exception as error:
        print(f"Connection failed: {error}")
        return None
def create_logs_table():
    """This creates the logs table in your database"""
    conn = get_connection()
    if conn is None:
        return
    cursor = conn.cursor()
    create_table_query = """
        CREATE TABLE IF NOT EXISTS logs (
            id SERIAL PRIMARY KEY,
            ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            level VARCHAR(20), -- ERROR, WARNING, INFO
            service VARCHAR(100), -- which app/service
            message TEXT, -- the actual log message
            user_id VARCHAR(50) -- which user triggered it
        );
    """
    cursor.execute(create_table_query)
    conn.commit()
    print("Logs table created!")
    cursor.close()
    conn.close()
def insert_sample_logs():
    """Add some fake logs so we have data to test with"""
    conn = get_connection()
    if conn is None:
        return
    cursor = conn.cursor()
    sample_logs = [
        ('ERROR', 'auth-service', 'Login failed for user admin', 'user_001'),
        ('INFO', 'payment-service', 'Payment processed successfully', 'user_002'),
        ('ERROR', 'auth-service', 'Invalid token received', 'user_003'),
        ('WARNING', 'api-gateway', 'Rate limit almost reached', 'user_001'),
        ('INFO', 'payment-service', 'Refund initiated', 'user_004'),
        ('ERROR', 'database', 'Connection timeout', 'system'),
        ('INFO', 'auth-service', 'New user registered', 'user_005'),
        ('WARNING', 'api-gateway', 'Slow response detected', 'user_002'),
    ]
    insert_query = """
        INSERT INTO logs (level, service, message, user_id)
        VALUES (%s, %s, %s, %s)
    """
    cursor.executemany(insert_query, sample_logs)
    conn.commit()
    print("Sample logs inserted!")
    cursor.close()
    conn.close()
if __name__ == "__main__":
    create_logs_table()
    insert_sample_logs()
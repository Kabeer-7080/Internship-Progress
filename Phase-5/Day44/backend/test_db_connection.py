import os
import mysql.connector
from dotenv import load_dotenv

def test_connection():
    load_dotenv()
    
    host = os.getenv("DB_HOST", "localhost")
    user = os.getenv("DB_USER", "root")
    password = os.getenv("DB_PASSWORD", "")
    database = os.getenv("DB_NAME", "student_management")

    print(f"Connecting to MySQL: {user}@{host}/{database}...")

    try:
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password,
            database=database
        )
        if connection.is_connected():
            print("Successfully connected to MySQL database!")
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT COUNT(*) AS count FROM students;")
            res = cursor.fetchone()
            print(f"Total student records: {res['count']}")
            cursor.close()
            connection.close()
            return True
    except Exception as err:
        print(f"Database Connection Error: {err}")
        return False

if __name__ == "__main__":
    test_connection()

import os
import logging
from pathlib import Path

import pymysql  # type: ignore # pyrefly: ignore
from dotenv import load_dotenv  # type: ignore # pyrefly: ignore
from sqlalchemy import create_engine  # type: ignore # pyrefly: ignore
from sqlalchemy.orm import declarative_base, sessionmaker, Session  # type: ignore # pyrefly: ignore


# Load environment variables from backend/.env
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


logger = logging.getLogger("finguard.database")


# MySQL configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "finguard")


# SQLAlchemy base
Base = declarative_base()


# MySQL connection URL
DATABASE_URL = (
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@"
    f"{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
)


def create_database_if_not_exists():
    """Connect to MySQL server and ensure the FinGuard database exists."""

    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )

        with conn.cursor() as cursor:
            stmt = (
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            cursor.execute(stmt)

        conn.commit()
        conn.close()

        logger.info(
            f"Verified MySQL database '{MYSQL_DATABASE}' "
            f"exists on {MYSQL_HOST}:{MYSQL_PORT}"
        )

    except Exception as e:
        logger.warning(f"MySQL database check notice: {e}")


def get_engine():
    """Initialize the MySQL database engine."""

    create_database_if_not_exists()

    try:
        engine = create_engine(
            DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600
        )

        # Test the connection
        with engine.connect():
            pass

        logger.info("Successfully connected to MySQL.")

        return engine

    except Exception as e:
        logger.error(f"Could not connect to MySQL database: {e}")
        raise


# Create database engine
engine = get_engine()


# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """FastAPI dependency for database sessions."""

    db: Session = SessionLocal()

    try:
        yield db

    finally:
        db.close()
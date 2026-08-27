import os
import time
import logging
from pathlib import Path
from typing import Dict, Any

import pymysql  # type: ignore
from dotenv import load_dotenv  # type: ignore
from sqlalchemy import create_engine, text  # type: ignore
from sqlalchemy.orm import declarative_base, sessionmaker, Session  # type: ignore

# Load environment variables from backend/.env if present
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

logger = logging.getLogger("finguard.database")

# Environment / Database configurations
# Priority 1: Direct discrete variables (Railway native MYSQLHOST or DB_HOST)
DB_HOST = (
    os.getenv("MYSQLHOST")
    or os.getenv("DB_HOST")
    or os.getenv("MYSQL_HOST", "127.0.0.1")
)
DB_PORT = int(
    os.getenv("MYSQLPORT")
    or os.getenv("DB_PORT")
    or os.getenv("MYSQL_PORT", "3306")
)
DB_NAME = (
    os.getenv("MYSQLDATABASE")
    or os.getenv("DB_NAME")
    or os.getenv("MYSQL_DATABASE", "finguard")
)
DB_USER = (
    os.getenv("MYSQLUSER")
    or os.getenv("DB_USER")
    or os.getenv("MYSQL_USER", "root")
)
DB_PASSWORD = (
    os.getenv("MYSQLPASSWORD")
    or os.getenv("DB_PASSWORD")
    or os.getenv("MYSQL_PASSWORD")
    or os.getenv("DB_PASS", "")
)
DB_SSL_MODE = os.getenv("DB_SSL_MODE") or os.getenv("MYSQL_SSL_MODE", "")

# Aliases for backwards compatibility
MYSQL_HOST = DB_HOST
MYSQL_PORT = DB_PORT
MYSQL_DATABASE = DB_NAME
MYSQL_USER = DB_USER
MYSQL_PASSWORD = DB_PASSWORD

# Priority 2: Consolidated DATABASE_URL / MYSQL_URL (Standard Railway service connection string)
ENV_DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("MYSQL_URL", "")
_has_discrete_db_config = any(
    os.getenv(name)
    for name in (
        "MYSQLHOST", "DB_HOST", "MYSQL_HOST",
        "MYSQLPORT", "DB_PORT", "MYSQL_PORT",
        "MYSQLDATABASE", "DB_NAME", "MYSQL_DATABASE",
        "MYSQLUSER", "DB_USER", "MYSQL_USER",
        "MYSQLPASSWORD", "DB_PASSWORD", "MYSQL_PASSWORD", "DB_PASS",
    )
)
DB_ENGINE_CONFIG = os.getenv(
    "DB_ENGINE",
    "mysql" if (ENV_DATABASE_URL or _has_discrete_db_config) else "sqlite"
).lower()

# Optional SSL certificate configuration
DB_SSL_CA = os.getenv("DB_SSL_CA") or os.getenv("MYSQL_SSL_CA", "")
DB_SSL_CERT = os.getenv("DB_SSL_CERT", "")
DB_SSL_KEY = os.getenv("DB_SSL_KEY", "")

# Production Connection Pool Parameters (Railway / Cloud MySQL Optimized)
DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "5"))
DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "10"))
DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))
DB_POOL_RECYCLE = int(os.getenv("DB_POOL_RECYCLE", "1800"))

# SQLAlchemy declarative base
Base = declarative_base()

active_db_type = "uninitialized"
_db_connect_error: str = ""


def _get_ssl_args() -> Dict[str, Any]:
    """Build SSL connection arguments for PyMySQL if certificates or SSL mode are configured."""
    ssl_args: Dict[str, Any] = {}
    if DB_SSL_CA and os.path.exists(DB_SSL_CA):
        ssl_args["ca"] = DB_SSL_CA
    if DB_SSL_CERT and os.path.exists(DB_SSL_CERT):
        ssl_args["cert"] = DB_SSL_CERT
    if DB_SSL_KEY and os.path.exists(DB_SSL_KEY):
        ssl_args["key"] = DB_SSL_KEY

    if DB_SSL_MODE:
        ssl_args["ssl_mode"] = DB_SSL_MODE

    return ssl_args


def create_mysql_database_if_not_exists() -> bool:
    """Connect to MySQL server and ensure the FinGuard database exists."""
    try:
        connect_kwargs: Dict[str, Any] = {
            "host": DB_HOST,
            "port": DB_PORT,
            "user": DB_USER,
            "password": DB_PASSWORD,
            "connect_timeout": 3
        }
        ssl_config = _get_ssl_args()
        if ssl_config:
            connect_kwargs["ssl"] = ssl_config

        conn = pymysql.connect(**connect_kwargs)
        with conn.cursor() as cursor:
            stmt = (
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
            cursor.execute(stmt)
        conn.commit()
        conn.close()
        logger.info(
            f"Verified MySQL database '{DB_NAME}' exists on {DB_HOST}:{DB_PORT}"
        )
        return True
    except Exception as e:
        logger.warning(f"MySQL database check notice: {e}")
        return False


def _sanitize_database_url(raw_url: str) -> str:
    """Ensure standard Cloud MySQL URI formats are compatible with PyMySQL dialect."""
    url = raw_url.strip()
    if url.startswith("mysql://"):
        url = url.replace("mysql://", "mysql+pymysql://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    if "ssl-mode=" in url:
        url = url.replace("ssl-mode=REQUIRED", "ssl_disabled=False")
        url = url.replace("ssl-mode=REQUIRED&", "")
        url = url.replace("?ssl-mode=REQUIRED", "")

    return url


def get_engine():
    """Initialize the database engine supporting Railway MySQL, TCP MySQL, and SQLite fallback."""
    global active_db_type, _db_connect_error
    _db_connect_error = ""

    # 1. Direct DATABASE_URL provided (Standard Railway service link)
    if ENV_DATABASE_URL:
        db_url = _sanitize_database_url(ENV_DATABASE_URL)

        try:
            connect_args: Dict[str, Any] = {}
            if "sqlite" in db_url:
                connect_args = {"check_same_thread": False}
                active_db_type = "sqlite"
                return create_engine(db_url, connect_args=connect_args)
            else:
                ssl_args = _get_ssl_args()
                if ssl_args:
                    connect_args["ssl"] = ssl_args

                eng = create_engine(
                    db_url,
                    pool_pre_ping=True,
                    pool_recycle=DB_POOL_RECYCLE,
                    pool_size=DB_POOL_SIZE,
                    max_overflow=DB_MAX_OVERFLOW,
                    pool_timeout=DB_POOL_TIMEOUT,
                    connect_args=connect_args
                )
                with eng.connect():
                    pass
                active_db_type = "cloud_mysql"
                logger.info("Connected to database via DATABASE_URL.")
                return eng
        except Exception as e:
            _db_connect_error = str(e)
            logger.warning(f"DATABASE_URL connection failed: {e}. Attempting discrete variables...")

    # 2. Explicit SQLite configured
    if DB_ENGINE_CONFIG == "sqlite":
        active_db_type = "sqlite"
        sqlite_path = BASE_DIR / "finguard.db"
        logger.info(f"Using SQLite database at {sqlite_path}")
        return create_engine(
            f"sqlite:///{sqlite_path}",
            connect_args={"check_same_thread": False}
        )

    # 3. Standard / Railway MySQL TCP Connection via DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
    mysql_url = (
        f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@"
        f"{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
    )

    create_mysql_database_if_not_exists()

    try:
        connect_args: Dict[str, Any] = {"connect_timeout": 5}
        ssl_args = _get_ssl_args()
        if ssl_args:
            connect_args["ssl"] = ssl_args

        eng = create_engine(
            mysql_url,
            pool_pre_ping=True,
            pool_recycle=DB_POOL_RECYCLE,
            pool_size=DB_POOL_SIZE,
            max_overflow=DB_MAX_OVERFLOW,
            pool_timeout=DB_POOL_TIMEOUT,
            connect_args=connect_args
        )
        with eng.connect():
            pass
        active_db_type = "mysql"
        logger.info(f"Successfully connected to MySQL database on {DB_HOST}:{DB_PORT}/{DB_NAME}.")
        return eng
    except Exception as e:
        _db_connect_error = str(e)
        logger.warning(
            f"Could not connect to MySQL ({e}). Falling back to SQLite for continuous operation."
        )
        active_db_type = "sqlite_fallback"
        sqlite_path = BASE_DIR / "finguard.db"
        return create_engine(
            f"sqlite:///{sqlite_path}",
            connect_args={"check_same_thread": False}
        )


def create_database_if_not_exists():
    """Ensure database and schema tables are initialized."""
    if active_db_type in ("mysql", "cloud_mysql"):
        create_mysql_database_if_not_exists()


def check_db_connectivity() -> Dict[str, Any]:
    """Test and report live database connectivity and latency."""
    t0 = time.time()
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        latency_ms = round((time.time() - t0) * 1000, 2)
        is_production_mysql = active_db_type in ("mysql", "cloud_mysql")
        return {
            "status": "healthy",
            "active_db_type": active_db_type,
            "is_production_mysql": is_production_mysql,
            "latency_ms": latency_ms,
            "error": None
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "active_db_type": active_db_type,
            "is_production_mysql": False,
            "latency_ms": None,
            "error": str(e)
        }


# Create database engine
engine = get_engine()

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """FastAPI database session dependency."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()
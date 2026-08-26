import sys
import os
import time

# Ensure app package is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import (  # noqa: E402 # type: ignore
    engine,
    active_db_type,
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    DB_SSL_MODE,
    ENV_DATABASE_URL,
    DB_POOL_SIZE,
    DB_MAX_OVERFLOW,
    DB_POOL_RECYCLE,
    _get_ssl_args
)


def print_separator(title: str = ""):
    print("\n" + "=" * 65)
    if title:
        print(f"  {title}")
        print("=" * 65)


def run_diagnostics():
    print_separator("FINGUARD RAILWAY / PRODUCTION MYSQL DIAGNOSTICS")

    print("[*] Environment Configuration Detected:")
    print(f"    - DB_HOST / MYSQLHOST:       {DB_HOST}")
    print(f"    - DB_PORT / MYSQLPORT:       {DB_PORT}")
    print(f"    - DB_NAME / MYSQLDATABASE:   {DB_NAME}")
    print(f"    - DB_USER / MYSQLUSER:       {DB_USER}")
    print(f"    - DB_PASSWORD:               {'*' * len(DB_PASSWORD) if DB_PASSWORD else '(not set)'}")
    print(f"    - DB_SSL_MODE:               {DB_SSL_MODE or 'Default'}")
    if ENV_DATABASE_URL:
        print(f"    - DATABASE_URL / MYSQL_URL:  {ENV_DATABASE_URL[:30]}...")
    print(f"    - Connection Pool Size:      {DB_POOL_SIZE} (overflow: {DB_MAX_OVERFLOW}, recycle: {DB_POOL_RECYCLE}s)")
    ssl_config = _get_ssl_args()
    print(f"    - SSL / TLS Mode:            {'Configured' if ssl_config else 'Standard'}")

    print("\n[*] Testing Database Connectivity...")

    # 1. Test SQLAlchemy Engine Connection
    try:
        t0 = time.time()
        with engine.connect() as conn:
            from sqlalchemy import text  # type: ignore
            result = conn.execute(text("SELECT VERSION()"))
            version = str(result.scalar())
            tables_result = conn.execute(text("SHOW TABLES"))
            tables = [str(r[0]) for r in tables_result.fetchall()]
        latency = round((time.time() - t0) * 1000, 2)

        print("    [SUCCESS] Connected to MySQL via SQLAlchemy!")
        print(f"    - Active Engine Mode: {active_db_type}")
        print(f"    - Server Version:    {version}")
        print(f"    - Query Latency:     {latency}ms")
        print(f"    - Existing Tables:   {', '.join(tables) if tables else 'None (run init_db.py to create schema)'}")
        return True
    except Exception as e:
        print(f"    [NOTICE] Direct connection attempt notice: {e}")
        print("\n[*] Application Engine Fallback Status:")
        print(f"    - Active Engine Mode: {active_db_type}")
        if active_db_type == "sqlite_fallback":
            print("    - FinGuard is currently running in local safe SQLite fallback mode.")
            print("    - Once your Railway MySQL variables or DATABASE_URL are set,")
            print("      FinGuard will automatically connect to your production Railway database.")
        return False


if __name__ == "__main__":
    success = run_diagnostics()
    print_separator()
    sys.exit(0 if success else 1)

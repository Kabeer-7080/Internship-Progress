# Multi-stage / lightweight Python 3.12 image for Google Cloud Run / Railway
FROM python:3.12-slim

# Prevent Python from buffering stdout and writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Install system dependencies if required for cryptography
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application code & models
COPY . .

# Expose standard web port
EXPOSE 8000

# Run FastAPI with Uvicorn dynamically binding to $PORT (Cloud Run / Railway compatible)
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

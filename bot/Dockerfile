FROM python:3.11-slim

WORKDIR /app

# Install deps first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source
COPY . .

# Create data directory and non-root user
RUN mkdir -p /app/data && \
    useradd -r -u 1001 botuser && \
    chown -R botuser:botuser /app

USER botuser

CMD ["python", "main.py"]

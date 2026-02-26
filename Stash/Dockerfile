FROM python:3.11-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.backend.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.backend.txt

# Copy application code
COPY api ./api
COPY main.py .

# Expose port (Railway will set PORT env var)
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]

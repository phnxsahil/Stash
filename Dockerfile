FROM python:3.11-slim

# ffmpeg for audio extraction
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Deno: external JS runtime that yt-dlp (>=2025.11.12) needs to solve
# YouTube's JS challenges. Without this YouTube extraction fails even
# when the network path is fine.
COPY --from=denoland/deno:bin-2.9.7 /deno /usr/local/bin/deno

WORKDIR /app

COPY requirements.backend.txt .
RUN pip install --no-cache-dir -r requirements.backend.txt

COPY api ./api
COPY main.py .

EXPOSE 8000

# Render sets PORT automatically; main.py already reads it
CMD ["python", "main.py"]

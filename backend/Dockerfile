FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system deps needed for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install (leverage Docker cache)
COPY requirements.txt ./requirements.txt
RUN python -m pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Create a persistent data directory for vector store if needed
RUN mkdir -p /data/chroma_data
ENV CHROMA_PERSIST_DIR=/data/chroma_data

ENV PORT=8000
EXPOSE ${PORT}

# Start the app with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT}", "--workers", "1"]

FROM python:3.11-slim

# Install Node.js for nia CLI
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install nia CLI globally
RUN npm install -g @nozomioai/nia

WORKDIR /app

COPY agent/requirements.txt agent/requirements.txt
RUN pip install --no-cache-dir -r agent/requirements.txt

COPY agent/ agent/
COPY railway/ railway/

CMD ["bash", "railway/cron.sh"]

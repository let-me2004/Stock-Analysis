# Use Debian Bookworm Node image which includes recent Python 3 versions
FROM node:20-bookworm

# Install Python and curl
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set up a directory for the app
WORKDIR /app

# Create a Python virtual environment and install agent-reach
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir https://github.com/Panniantong/agent-reach/archive/main.zip yt-dlp
RUN agent-reach install --env=auto --safe

# Install mcporter and configure Exa MCP
RUN npm install -g mcporter
RUN mcporter config add exa https://mcp.exa.ai/mcp

# Copy Node.js dependencies and install
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 3001

# Start the server
CMD ["npm", "start"]

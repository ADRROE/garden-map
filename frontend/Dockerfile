FROM node:18

# Install required system packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Manually install pnpm globally
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files first for caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies with pnpm
RUN pnpm install

# Copy rest of the source code
COPY . .

# Build the frontend
RUN pnpm build

EXPOSE 3000

# Start the dev server
CMD ["pnpm", "run", "dev"]
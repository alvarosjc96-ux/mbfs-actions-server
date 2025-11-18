FROM node:18-slim

# Install tesseract and poppler-utils for OCR
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Run server
CMD ["node", "server.js"]

FROM node:20-alpine

WORKDIR /app

# Copy workbench package files
COPY ai-plan-workbench/package.json ai-plan-workbench/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy workbench source
COPY ai-plan-workbench/ .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Start
CMD ["npm", "start"]

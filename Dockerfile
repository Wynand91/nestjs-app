# Use a specific Node.js version
FROM node:20.11.1-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema files
COPY prisma ./prisma/

# Install dependencies without copying local node_modules
RUN npm install

# Copy the rest of the application code
COPY . .

# Run Prisma generate
RUN npx prisma generate

# Build the application
RUN npm run build

# Install bcrypt manually to ensure it is compiled for the correct architecture
RUN npm install bcrypt

# Copy entrypoint script into the container
COPY entrypoint.sh .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Specify the custom entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]

# Expose the necessary ports
EXPOSE 8000-8002
EXPOSE 9092

# Command to run the application
CMD ["npm", "run", "start:dev"]

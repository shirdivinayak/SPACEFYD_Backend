# Use official Node.js image from Docker Hub
FROM node:20.15.0

# Set the working directory inside the container
WORKDIR /SPACEYD_Backend/backend

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install app dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application files into the container
COPY . .

# Expose the port your app will run on (default 8080)
EXPOSE 8080

# Set the command to run the app (use JSON array format to avoid shell issues)
CMD ["node", "app.js"]

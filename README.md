chord-genesis

.dockerignore
New
+11
-0

node_modules
.git
.gitignore
Dockerfile
dist
.env
.vscode
.idea
npm-debug.log*
yarn-debug.log*
.pnpm-debug.log*
Dockerfile
New
+15
-0

# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run the application using a lightweight server
FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
README.md
+26
-1

chord-genesis
# chord-genesis

A chord progression generator built with React and Vite.

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Docker

You can build and run the application using Docker. This will compile the project and serve the static files from a lightweight container.

```bash
# Build the image
docker build -t chord-genesis .

# Run the container on port 8080
docker run -p 8080:8080 chord-genesis
```

The site will be accessible at `http://localhost:8080`.

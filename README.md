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

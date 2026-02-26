# Deployment Guide

## Local Development

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (for PostgreSQL)

### Start PostgreSQL

```bash
docker compose up -d
```

This starts a PostgreSQL 17 instance on port 5432 with credentials from `docker-compose.yml`.

### Run Migrations

```bash
make db-migrate
```

### Start Dev Servers

```bash
npm run dev
```

- Client: `http://localhost:9000` (Vite dev server with hot reload)
- Server: `http://localhost:3000` (Hono API with tsx watch)

---

## Docker Build

### Full Stack in Docker

```bash
docker compose --profile full up --build
```

This builds a multi-stage Docker image and runs both the app and PostgreSQL. The app is available at `http://localhost:3000`.

Set `GEMINI_API_KEY` in your environment or `.env` file before running.

### Build Image Only

```bash
# Using Makefile
make docker-build

# Or directly
docker build \
  --build-arg VERSION=$(git describe --tags --always) \
  --build-arg COMMIT=$(git rev-parse --short HEAD) \
  -t neurotube-creator:latest .
```

### Run Manually

```bash
docker run --rm -p 3000:3000 \
  --env-file .env.local \
  neurotube-creator:latest
```

### Image Architecture

The Dockerfile uses multi-stage builds:

1. **base** — Node.js 22 Alpine
2. **deps** — Install all npm dependencies
3. **build-shared** — Compile shared TypeScript types
4. **build-server** — Compile Hono server
5. **build-client** — Build Vue 3 + Quasar client (Vite)
6. **production** — Minimal image with production deps, compiled code, and Drizzle migrations

The entrypoint (`docker-entrypoint.sh`) runs `drizzle-kit migrate` before starting the server, ensuring the database schema is always up to date.

---

## Dokploy Deployment

[Dokploy](https://dokploy.com/) is a self-hosted PaaS built on Docker.

### Setup Steps

1. **Create Application** in Dokploy dashboard
   - Source: Git repository
   - Build type: Dockerfile
   - Branch: `main` (or your deployment branch)

2. **Create PostgreSQL Service**
   - Add a PostgreSQL database in Dokploy
   - Note the internal connection string (e.g., `postgresql://user:pass@postgres-service:5432/neurotube`)

3. **Configure Environment Variables**

   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Internal PostgreSQL connection string from step 2 |
   | `GEMINI_API_KEY` | Your Google Gemini API key |
   | `PORT` | `3000` |
   | `NODE_ENV` | `production` |
   | `LOG_LEVEL` | `info` |

4. **Configure Port**
   - Expose port `3000`
   - Set up domain/proxy in Dokploy for HTTPS

5. **Deploy**
   - Push to the configured branch
   - Dokploy will automatically build and deploy

### Health Check

The app exposes `GET /api/health` which returns:

```json
{ "status": "ok", "timestamp": "..." }
```

Configure this as the health check endpoint in Dokploy.

### Updating

Push to the deployment branch. Dokploy rebuilds the Docker image, runs the entrypoint (which executes migrations), and starts the new version.

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `GEMINI_API_KEY` | Yes | — | Google Gemini API key |
| `PORT` | No | `3000` | HTTP server port |
| `LOG_LEVEL` | No | `info` | Logging verbosity: `debug`, `info`, `warn`, `error` |
| `NODE_ENV` | No | `development` | Environment: `development`, `production`, `test` |
| `STATIC_DIR` | No | auto-detected | Absolute path to client build directory |

---

## Makefile Targets

```
make docker-build     # Build Docker image
make docker-run       # Run container from .env.local
make docker-stop      # Stop running containers
make docker-logs      # Tail container logs
make docker-clean     # Remove images and prune
make deploy           # Deploy to Dokploy (requires DOKPLOY_URL + DOKPLOY_API_KEY)
```

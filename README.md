[![Deploy Server to Azure Container Apps (main)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-server.yml) [![Azure Static Web Apps CI/CD](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-web.yml)

# Pastepaste

Temporary, end-to-end encrypted text sharing between devices in the same room.

![Editor screenshot](screenshots/editor.png)

## Monorepo layout

- `apps/web` — React, TypeScript, Vite, and Tailwind CSS frontend
- `apps/server` — ASP.NET Core minimal API and SignalR backend

## Web (`apps/web`)

### Local development

```bash
cd apps/web
npm install
npm run dev
```

Development loads `VITE_API_URL` from the committed `apps/web/.env.development`, which points to `http://localhost:8080`. No `.env` or `.env.local` setup is required. The committed `.env.example` documents the configuration format but is not loaded automatically. Only public frontend configuration belongs in these files; never store secrets in `VITE_*` variables.

### Production deployment

Production builds load `VITE_API_URL` from the committed `apps/web/.env.production`, which points to `https://api.pastepaste.markandrey.com`. This public URL is not a secret.

On any hosting platform, use `apps/web` as the project directory, run `npm ci` and `npm run build`, and publish `dist`. Configure an SPA fallback to `index.html` so room URLs work when opened directly; `vercel.json` already provides this for Vercel.

Build-environment variables take precedence over `.env` files. Remove stale `VITE_API_URL` overrides from hosting settings so the production default is used. No platform-specific API URL configuration is required unless you want to override that default.

Vite embeds the API URL into the frontend during the build, so changing it requires rebuilding and redeploying. If the backend moves but the custom API domain stays the same, update its DNS and domain binding instead; no frontend rebuild is needed.

### Commands

```bash
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

## Server (`apps/server`)

### Local development

```bash
cd apps/server
dotnet run --urls http://localhost:8080
```

`dotnet run` does not hot-reload. Restart the server process (or use `dotnet watch run`) after backend changes.

### Docker

Build and push the API image to Docker Hub:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t markandreydc/pastepaste-api:latest \
  -t markandreydc/pastepaste-api:$(git rev-parse --short HEAD) \
  --push .
```

And to GitHub Container Registry (use your GitHub PAT as the password):

```bash
docker login ghcr.io -u markandreydc

docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ghcr.io/markandreydc/pastepaste-api:latest \
  -t ghcr.io/markandreydc/pastepaste-api:$(git rev-parse --short HEAD) \
  --push .
```

## Static website

- https://pastepaste.markandrey.com

## Architecture

- AES-GCM encryption in the browser
- In-memory room state; no clipboard text is persisted
- Docker deployment target for Azure Container Apps

Rooms disappear when the last connected device leaves or the backend restarts. Five-character room codes are convenient for the alpha but are not strong encryption secrets.

## License

[MIT](LICENSE)

[![Deploy Server to Azure Container Apps (main)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-server.yml/badge.svg)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-server.yml) [![Azure Static Web Apps CI/CD](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/markandreydc/pastepaste/actions/workflows/deploy-web.yml)

# Pastepaste

Temporary, end-to-end encrypted text sharing between devices in the same room.

![Editor screenshot](screenshots/editor.png)

## Website

Main website: https://pastepaste.markandrey.com

Backup deployments:

- https://pastepaste.vercel.app
- https://pastepaste.madc.workers.dev
- https://pastepastepaste.pages.dev

## Project structure

- `apps/web` — React, TypeScript, Vite, and Tailwind CSS
- `apps/server` — ASP.NET Core API and SignalR

## Local development

Run the backend:

```bash
cd apps/server
dotnet run --urls http://localhost:8080
```

In another terminal, run the frontend:

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173. Restart the backend after changes, or use `dotnet watch run`.

## Configuration

- Frontend API URL: `apps/web/.env.development` for localhost; `.env.production` for `https://api.pastepaste.markandrey.com`.
- Backend: `apps/server/appsettings.json` for shared settings; `.Development.json` and `.Production.json` for environment-specific CORS origins.
- Local runs use Development; published apps default to Production unless configured otherwise.
- Hosting environment variables override file settings. API URL changes require a frontend rebuild. Never put secrets in `VITE_*` variables.

## Deployment

Build the frontend in `apps/web` with `npm ci` and `npm run build`, then publish `dist` with an SPA fallback to `index.html`. The backend runs in Docker on Azure Container Apps. Add new frontend origins to `apps/server/appsettings.Production.json` and redeploy the backend.

## How it works

Text is encrypted in the browser with AES-GCM. The server stores only encrypted payloads in memory. Rooms disappear when the last device leaves or the backend restarts. Five-character room codes are convenient but are not strong encryption secrets.

## License

[MIT](LICENSE)

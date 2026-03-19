# Wish-Giving (MVP)

Docker-first local development.

## Prerequisites

- Docker Desktop

## Environment variables

Create a file named `.env` in the repo root (next to `docker-compose.yml`):

```env
# required
NEXTAUTH_SECRET=change-me
ADMIN_EMAILS=admin@example.com
```

Notes:
- `DATABASE_URL` is already provided to the `web` container via `docker-compose.yml`.

## Run locally

```bash
docker compose up --build
```

Open:
- `http://localhost:3000`

## Admin moderation

Admin reports page:
- `http://localhost:3000/admin/reports`

Only emails listed in `ADMIN_EMAILS` can access admin APIs.

# Wish-Giving

# Wish-Giving

A community wish-granting platform where users post wishes and others pledge to fulfill them.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 (via Docker) |
| ORM | Prisma 5 |
| Auth | JWT in HttpOnly cookie (`wg_session`) |
| Runtime | Node.js 20, Docker Compose |

---

## Prerequisites

- Docker Desktop

---

## Environment Variables

Create a `.env` file in the repo root (next to `docker-compose.yml`):

```env
NEXTAUTH_SECRET=change-me
ADMIN_EMAILS=admin@example.com
```

> `DATABASE_URL` is already set inside `docker-compose.yml` for the `web` container.

---

## Run Locally

```bash
docker compose up --build
```

App: `http://localhost:3000`
Admin: `http://localhost:3000/admin/reports`

---

## Seed Test Data

10 test users are pre-seeded. Run this once after the containers are up:

```bash
docker exec wish-giving-web-1 node /app/prisma/seed.js
```

| Email | Password | Wishes |
|-------|----------|--------|
| test1@gmail.com | password123 | `[test1] Help with school books`, `[test1] Birthday dinner experience`, `[test1] Grocery essentials for the month` |
| test2@gmail.com | password123 | Same 3 wishes prefixed `[test2]` |
| … | … | … |
| test10@gmail.com | password123 | Same 3 wishes prefixed `[test10]` |

The seed script is idempotent — re-running it will not create duplicates.

---

## User Journeys

### Wisher
1. Register / log in
2. Create a wish (`/wishes/new`)
3. Wait for a giver to pledge
4. Review pledge at `/wishes/<id>/pledges` — Accept or Decline
5. Chat with the giver at `/chat/<wishId>`
6. Mark the wish as fulfilled

### Giver
1. Browse open wishes on the home feed
2. Open a wish detail (`/wish/<id>`)
3. Click **Pledge to fulfill this wish** → fill in a message → Submit
4. Wait for the wisher to accept
5. Once accepted, chat with the wisher (`/pledges` → Chat button)
6. Mark as fulfilled when done

---

## Key Pages

| Path | Description |
|------|-------------|
| `/` | Public feed — browse open wishes |
| `/wishes/new` | Create a new wish |
| `/wishes` | Your own wishes |
| `/wishes/<id>` | Edit / delete a wish |
| `/wishes/<id>/pledges` | Accept or decline incoming pledges |
| `/wish/<id>` | Public wish detail + pledge button |
| `/pledge/<wishId>` | Submit a pledge |
| `/pledges` | Giver's "My Pledges" page |
| `/chat/<wishId>` | Wisher ↔ giver chat |
| `/profile` | Edit your profile |
| `/user/<id>` | Public user profile, block, report |
| `/admin/users` | Admin — user management |
| `/admin/reports` | Admin — moderation queue |

---

## Data Model (key relations)

```
User ──< Wish ──< Pledge ──< Conversation ──< Message
                              (1 accepted pledge per wish at a time)
User ──< Block
User ──< Report
```

---

## Pledge State Machine

```
pending ──accept──> accepted ──mark_fulfilled──> fulfilled
pending ──decline──> (wish back to open)
```

- Only the wisher can accept or decline a pending pledge.
- Either party can mark fulfilled (once accepted).
- Invalid transitions (e.g. accepting an already-accepted pledge) return 400.

---

## Bug Fixes Applied

### Critical
| ID | Issue | Fix |
|----|-------|-----|
| C1 | My Pledges links broken (`/chat/undefined`) | Added `id` to wish select in `GET /api/pledges` |
| C2 | Wisher could pledge on own wish | Added self-pledge check in `POST /api/pledges` |
| C3 | Invalid pledge state transitions allowed | Added status pre-check before each action in `PATCH /api/pledges/[id]` |
| C4 | Any logged-in user could read any conversation | Added wisher/giver ownership check in `GET /api/conversations/[wishId]` |
| C5 | Disabled accounts could still log in | Added `user.status !== "active"` check in `POST /api/auth/login` |
| C6 | Pledge creation race condition (duplicate pledges) | Moved activePledge check + create + wish update into `prisma.$transaction()` |
| C7 | Pledge accept/decline/fulfill non-atomic | Wrapped each action's two DB updates in `prisma.$transaction([])` |
| C8 | Block feature had no enforcement | Pledge creation checks Block table; feed filters blocked users |

### Medium
| ID | Issue | Fix |
|----|-------|-----|
| M1 | Nav went blank on auth error | Added `.catch(() => setLoggedIn(false))` in NavAuth |
| M2 | Pages showed infinite spinner on fetch error | Added `.catch()` with error state in wishes/pledges pages |
| M3 | Open redirect on login/register | Validated redirect with `startsWith("/") && !startsWith("//")` |
| M5 | Feed showed wishes from disabled users | Added `user: { status: "active" }` filter in feed query |
| M6 | Whitespace-only chat messages accepted | Changed validation to `!body.trim()` |
| M7 | Admin reports page showed stale content to non-admins | Added loading state before rendering content |
| M8 | Users could spam-report the same target | Deduplicate by `(reporterUserId, targetType, targetId)` before creating |

---

## Loading UX

- **`SparkLoader`** — small spinning ring, used inside buttons while an action is in-flight. Inherits `currentColor` so it's white on primary buttons, gray on secondary, etc.
- **`PageLoader`** — full-screen frosted overlay (`fixed inset-0 z-50`, `bg-white/80 backdrop-blur-sm`) with a larger orange ring. Shown during all async form submissions and actions to block the page and prevent double-submission.

---

## Project Structure

```
wish-giving/
├── apps/
│   └── web/
│       └── src/app/
│           ├── api/          # Route handlers
│           ├── components/   # NavAuth, SparkLoader, PageLoader
│           ├── auth/         # Login, register, forgot/reset password
│           ├── wishes/       # Wisher pages
│           ├── wish/         # Public wish detail
│           ├── pledge/       # Create pledge
│           ├── pledges/      # Giver's pledge list
│           ├── chat/         # Conversation
│           ├── profile/      # Edit profile
│           ├── user/         # Public user profile
│           └── admin/        # Admin pages
├── prisma/
│   ├── schema.prisma
│   └── seed.js               # Test data seed script
└── docker-compose.yml
```

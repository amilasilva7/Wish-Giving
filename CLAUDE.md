# Wish Giving — Project Context for Claude

## 1. Project Overview

**Purpose:** Community wish-granting platform. Wishers post needs; givers pledge to fulfil them.

**Current status:** Feature-complete MVP with production-ready UX.

**Stack:**
- Next.js 14 App Router · TypeScript · Tailwind CSS
- PostgreSQL 16 · Prisma 5
- JWT auth (custom, no NextAuth)
- Docker Compose

---

## 2. Running the Project

**Prerequisite:** Docker Desktop must be running.

```bash
# Start everything (DB + app)
docker compose up --build

# Dev server only (port 3002)
npm run dev

# Seed test data
npx prisma db seed
# Creates 10 users: test1@gmail.com … test10@gmail.com / password123
# Each user gets 3 wishes (30 total)

# Prisma Studio
npx prisma studio
```

---

## 3. Development History

### Phase 1 — Initial scaffold (`cbbd842`)
- Monorepo setup, Prisma schema, Next.js app skeleton
- Auth: register / login / logout / JWT
- Basic wish CRUD

### Phase 2 — Guest draft + admin + pledges (`6dba62b`, `5003863`)
- Guest wish draft saved to `localStorage`, restored after login
- Admin panel: user management (ban/unban), report review
- Pledges: create, accept, decline
- Auth: forgot/reset password, email verification flow

### Phase 3 — UX improvements round 1 (`6552640`)
- Loading states on all async buttons (`SparkLoader`, `PageLoader`)
- Flash banners for success/error feedback
- Inline confirmations for destructive actions

### Phase 4 — Bug audit (`c533f4e`)
- 8 critical fixes (C1–C8): pledge state machine, self-pledge block, conversation access control, open redirect fix, report deduplication, etc.
- 8 medium fixes (M1–M8): nav error handling, form resets, etc.
- Full fix table documented in `README.md`

### Phase 5 — Favourites (`8af8103`, `1cdfb2b`)
- Added `Favourite` model (userId + wishId unique pair)
- `/api/favourites` — POST / DELETE / GET
- `FavouriteButton` component with optimistic UI and live count
- "Saved wishes" section on profile page

### Phase 6 — Port + polish (`5bca30a`)
- Changed app port to 3002

### Phase 7 — UX improvements round 2 (`3537d22`)
- `Toast` notification system (replaces flash banners)
- `WishCardSkeleton` skeleton loading for feed and my-wishes pages
- Empty states with CTAs (no wishes / no results)
- Debounced search (400ms) with active filter pills + clear-all
- Wish detail: 4-step status timeline, share button (`ShareButton.tsx`)

---

## 4. Key Files

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Single source of truth for all models |
| `apps/web/src/domain/taxonomy.ts` | Wish categories, budget ranges, occasion types, visibility enum |
| `apps/web/src/lib/auth.ts` | JWT session — `getCurrentUser()`, cookie helpers |
| `apps/web/src/lib/prisma.ts` | Singleton Prisma client |
| `apps/web/src/lib/admin.ts` | `isAdmin()` helper using `ADMIN_EMAILS` env var |
| `apps/web/src/lib/sameOrigin.ts` | CSRF guard — `isSameOrigin()` used on all mutating API routes |
| `apps/web/src/app/components/Toast.tsx` | Global toast notification system |
| `apps/web/src/app/components/SparkLoader.tsx` | Inline spinner for buttons |
| `apps/web/src/app/components/FavouriteButton.tsx` | Heart toggle with optimistic count |
| `prisma/seed.ts` | Test seed — 10 users + 30 wishes |

---

## 5. Architecture Decisions & Conventions

- **Auth:** Custom JWT in `auth_token` cookie — no NextAuth. `getCurrentUser()` is the single auth check used across all API routes.
- **CSRF:** All mutating routes call `isSameOrigin(request)` first — returns 403 if origin doesn't match.
- **API style:** All routes are Next.js Route Handlers under `apps/web/src/app/api/`. Return `NextResponse.json()`.
- **Admin:** Checked via `ADMIN_EMAILS` env var (comma-separated). No DB role column.
- **Visibility:** `public` | `limited` | `private_link` on wishes. Feed currently shows `public` only.
- **Pledge state machine:** `pending → accepted → fulfilled` or `pending → declined`.
- **Tailwind:** Custom utility classes defined in `globals.css` — `.card`, `.btn-primary`, `.btn-secondary`, `.input`, `.label`, `.form-field`, `.error-msg`.

---

## 6. Data Model Summary

```
User ──< Wish ──< Pledge ──? Conversation ──< Message
              ──< Favourite
User ──< Report
User ──< Block ──> User
```

---

## 7. Environment Variables

```env
DATABASE_URL=       # PostgreSQL connection string (set automatically by Docker Compose)
NEXTAUTH_SECRET=    # JWT signing secret (required)
ADMIN_EMAILS=       # Comma-separated admin email addresses
```

---

## 8. Things Already Done — Don't Re-suggest

- Favourite/save wishes ✅
- Toast notifications ✅
- Skeleton loading ✅
- Debounced search ✅
- Pledge state machine with accept/decline ✅
- Conversation/chat between wisher and giver ✅
- Admin user management (ban/unban) ✅
- Report system ✅
- Block users ✅
- Email verification flow ✅
- Forgot/reset password ✅
- Guest wish draft saved to localStorage ✅
- Share button on wish detail ✅
- Favourite count display on cards ✅

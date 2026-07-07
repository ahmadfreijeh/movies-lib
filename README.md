# Movie Library

A full-stack movie library application for cataloging, browsing, and managing movies.

## Tech Stack

**Frontend**

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- React Query for server state
- Axios for HTTP requests
- Zustand for client state
- Zod + React Hook Form for forms

**Backend**

- Node.js 20 + Express + TypeScript
- Services & Repositories pattern
- PostgreSQL (via Prisma ORM)
- JWT-based authentication
- Zod for request validation

## Project Structure

```
book-library/
├── backend/    # Express API
├── frontend/   # Next.js app
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use the provided `docker-compose.yml`)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:migrate
npm run dev
```

Configure `backend/.env`:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Secrets for signing access/refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (defaults: `15m` / `7d`) |
| `INVITATION_EXPIRES_IN` | How long team invitations remain valid (default: `7d`) |
| `FRONTEND_URL` | Used for CORS and invitation links |
| `PORT` | API port (default: `5050`) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL` | Cloudflare R2 (S3-compatible) config for media uploads |

Other useful backend scripts:

```bash
npm run prisma:studio  # browse the database
npm run prisma:seed    # seed sample data (500 movies by default)
npm run build && npm start  # production build/run
npm run lint
```

`npm run prisma:seed` runs [`backend/prisma/seed.ts`](backend/prisma/seed.ts), which looks for an
existing "Test Org" organization/user (see [`backend/prisma/seeders`](backend/prisma/seeders)) rather
than creating one, and seeds movies against it. Pass a sub-command to seed a specific slice instead of
everything:

```bash
npm run prisma:seed genres        # seed genres only
npm run prisma:seed movies 100    # seed 100 movies (default: 500)
```

The API runs on `http://localhost:5050`. Interactive API docs (Swagger UI) are available at
`http://localhost:5050/api/docs`, protected by a browser Basic Auth prompt — sign in with
username `admin` and password `admin`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Configure `frontend/.env`:

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API (default: `http://localhost:5050/api`) |

The app runs on `http://localhost:3000`.

### Docker Compose

```bash
docker-compose up --build
```

Spins up PostgreSQL, the backend API, and the frontend together.

### Deploying to Render

[`render.yaml`](render.yaml) is a Render Blueprint that provisions a free Postgres database plus two
separate Docker web services from this same repo — `book-library-backend` (`rootDir: backend`) and
`book-library-frontend` (`rootDir: frontend`). Each service's `buildFilter.paths` is scoped to its own
folder, so pushing a commit only redeploys the service whose folder actually changed. See
[DECISIONS.md](DECISIONS.md) for more on this setup.

## API Routes

All routes are mounted under `/api`. See [backend/docs/API.md](backend/docs/API.md) for full request/response details.

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Signup, login, token refresh, current user (`/me`), and invitation acceptance |
| `/api/movies` | Browse, search, create, update, and delete movies (org-scoped) |
| `/api/media` | Upload, update, and delete movie media (posters/backdrops via Cloudflare R2) |
| `/api/users` | List users, manage roles, and manage user-level permissions |
| `/api/invitations` | Create, list, and revoke team invitations |
| `/api/genres` | List available genres |

Most mutating endpoints (create/update/delete on movies, media, users, invitations) require authentication via `requireAuth`; browsing endpoints are public.

## Documentation

See [backend/docs/API.md](backend/docs/API.md) for API endpoint documentation, [backend/docs/openapi.yaml](backend/docs/openapi.yaml) for the OpenAPI spec (also served interactively at `/api/docs`), and [DECISIONS.md](DECISIONS.md) for architectural decisions.

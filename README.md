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

The API runs on `http://localhost:5050`. Interactive API docs (Swagger UI) are available at `http://localhost:5050/api/docs`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app runs on `http://localhost:3000`.

### Docker Compose

```bash
docker-compose up --build
```

## Documentation

See [backend/docs/API.md](backend/docs/API.md) for API endpoint documentation, [backend/docs/openapi.yaml](backend/docs/openapi.yaml) for the OpenAPI spec (also served interactively at `/api/docs`), and [DECISIONS.md](DECISIONS.md) for architectural decisions.

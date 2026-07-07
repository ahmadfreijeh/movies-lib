# Architecture & Trade-offs

## Backend: Services & Repositories Pattern

Controllers handle HTTP concerns only (parsing requests, sending responses). Services hold business
logic and authorization rules. Repositories encapsulate all SQL and are the only layer that talks to
the database directly. This keeps business logic testable without a database and keeps SQL isolated
from the rest of the app.

## Validation with Zod

Request bodies and query params are validated with Zod schemas at the route boundary via middleware
(`validateBody` / `validateQuery`). This keeps controllers free of manual validation branches and gives
a single source of truth for input shapes, shared between schema definitions and inferred TypeScript types.

## Authentication

JWT is used for stateless authentication. Tokens are issued on login/signup and verified via
middleware (`requireAuth`) that attaches the authenticated user to the request. Only the structure is
scaffolded here — token storage strategy (httpOnly cookie vs. localStorage) should be finalized before
production use.

## Database

PostgreSQL is accessed through Prisma ORM. The schema lives in `backend/prisma/schema.prisma` and
Prisma Client is generated into `node_modules/.prisma` via the `postinstall` script. Repositories
wrap `PrismaClient` calls so services never depend on Prisma directly, keeping the door open to swap
the data layer later without touching business logic. Migrations are managed with
`npm run prisma:migrate` inside `backend/`.

## Frontend: React Query over global state for server data

Server state (movies, auth) is managed with React Query rather than pushed into Zustand, keeping
caching, refetching, and invalidation logic out of application state. Zustand is reserved for
client-only UI state if/when needed.

## Frontend: shadcn/ui

Components are copied into the repo (`src/components/ui`) rather than installed as a dependency,
so they can be freely customized without fighting an abstraction layer.

# AI Usage

This boilerplate was scaffolded with AI assistance (Claude Code) based on a detailed structural
specification provided by the project owner. The AI generated the file layout, TypeScript
interfaces, Express routes/controllers/services/repositories, Next.js pages/components, and
configuration files. No dependencies were installed automatically — `npm install` is left to the
developer to run and review.

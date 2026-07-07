# Architecture & Trade-offs

- **Services & Repositories pattern.** Controllers only handle HTTP; services hold business logic and
  authorization; repositories are the only layer touching the database. Keeps business logic testable
  without a DB and keeps SQL isolated.
- **Prisma over a raw Postgres connection.** Faster to build on and type-safe end to end. In
  production I'd weigh a raw connection (or a lighter query builder) for more control over query
  performance and connection pooling at scale.
- **Zod validation at the route boundary** (`validateBody` / `validateQuery`), shared between schema
  definitions and inferred TypeScript types, so controllers stay free of manual validation branches.
- **JWT auth.** Stateless, verified via `requireAuth` middleware. Only the structure is scaffolded —
  token storage strategy (httpOnly cookie vs. localStorage) still needs to be finalized before
  production.
- **UUIDs for all IDs.** Unguessable and safe to reference across tenants/services, at the cost of
  slightly larger, less sequential indexes than auto-increment ints.
- **Two roles (`SUPER_ADMIN`, `ADMIN`) + granular per-invitation permissions** instead of more roles.
  Access (e.g. create/edit/delete movies) is granted per invitation via `InvitationPermission`, so it
  can be tailored per person without growing the role enum. If I revisited this, I'd make invitations
  scoped per project/organization rather than one org per user, so a person can belong to and have
  different access across multiple organizations.
- **React Query over Zustand for server state** (movies, auth) — keeps caching/refetching/invalidation
  out of app state; Zustand is reserved for client-only UI state.
- **shadcn/ui components copied into the repo** rather than installed as a dependency, so they can be
  customized freely.
- **Monorepo (single repo, `backend/` + `frontend/`).** For production I'd split this into two
  separate projects/repos (API and frontend) so they can be deployed, scaled, and versioned
  independently.
- **Deployment via a single Render Blueprint (`render.yaml`)** despite the monorepo, defining both
  the `backend` and `frontend` as separate Docker web services (each with its own `rootDir` and
  `Dockerfile`). Each service's `buildFilter.paths` is scoped to its own folder
  (`backend/**` / `frontend/**`), so a commit only triggers a redeploy of the service whose folder
  actually changed, instead of rebuilding both on every push.

# What I'd Do Differently in Production

- **Split into two repos** (API and frontend) instead of a monorepo, so they can be deployed, scaled,
  and versioned independently.
- **Load/stress test with k6** before shipping, to know real throughput and where the DB/API break
  under load rather than guessing.
- **Cache permissions** instead of hitting the DB on every request — they change rarely and are read
  on nearly every authorized action.
- **More robust invitations**: sending the invite by email instead of a raw link, rate-limiting login
  attempts, and hardening the accept-invitation flow (retries, expiry edge cases, etc.).
- **Polish the UI further** — the core flows are in place, but one day wasn't enough time to refine
  visuals, empty/error states, and responsiveness the way I would for a real launch.

# AI Usage

Built with Claude Code from a structural spec I provided — file layout, routes/controllers/services/
repositories, Next.js pages/components, and config. Places where I corrected its output:

- It made the _first user created_ (when the users table is empty) automatically become
  `SUPER_ADMIN`. I changed this to an explicit choice at sign-up instead of relying on row count,
  which is fragile and racy.
- For invitation status, it computed status on the fly by looping over invitations and checking
  `acceptedAt` / `revokedAt`. I moved this to a `status` column in the DB — faster, and still keeps
  `acceptedAt` / `revokedAt` as timestamps for auditing.
- It used plain strings for enum-like values (roles, invitation status) instead of the Prisma enums
  already defined in the schema. I switched the code to use the enums for type safety.

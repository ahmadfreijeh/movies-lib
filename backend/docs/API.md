# Movie Library API

Base URL: `http://localhost:5050/api`

> For the full, up-to-date API reference (including Media, Users, and Invitations endpoints), see the OpenAPI spec at [`openapi.yaml`](./openapi.yaml), or browse it interactively at `http://localhost:5050/api/docs` when the server is running. This file is a quick-reference summary and may lag behind the spec.

## Auth

### POST /auth/signup
Create a new account.

**Body**
```json
{ "name": "string", "email": "string", "password": "string" }
```

### POST /auth/login
Authenticate and receive a JWT.

**Body**
```json
{ "email": "string", "password": "string" }
```

## Movies

### GET /movies
List movies with pagination and filters.

**Query params**: `page`, `pageSize`, `search`, `genre`, `sortBy`, `sortOrder`

### GET /movies/:id
Get a single movie by ID.

### POST /movies
Create a movie. Requires `Authorization: Bearer <token>`.

### PUT /movies/:id
Update a movie. Requires ownership and `Authorization: Bearer <token>`.

### DELETE /movies/:id
Delete a movie. Requires ownership and `Authorization: Bearer <token>`.

## Response shape

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "Error description" }
```

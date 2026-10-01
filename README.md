# SprintBoard

SprintBoard is an Agile task-management app. This repository holds both halves of it:

| Folder | What it is | Stack | Runs on |
|---|---|---|---|
| [`sprint-board-api/`](sprint-board-api/) | REST API (auth now, projects/sprints/tasks next) | Laravel 12, PHP 8.2, Sanctum, MySQL | http://localhost:8000 |
| [`sprint-board-ui/`](sprint-board-ui/) | Web frontend | Angular 21, SCSS, signals | http://localhost:4200 |

The UI calls the API over HTTP with a Bearer token. The two are deployed and run separately.

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| PHP | 8.2+ | XAMPP's PHP works (`C:\xampp\php\php.exe`). Laravel 13 needs 8.3, so the API is on Laravel 12. |
| Composer | 2.x | |
| MySQL / MariaDB | via XAMPP | Managed with phpMyAdmin at http://localhost/phpmyadmin |
| Node.js | 20.19+ | |
| Angular CLI | 21.x | `npm i -g @angular/cli` (or use `npx ng`) |

---

## Database

The API uses a local MySQL database running in **XAMPP**.

| Setting | Value |
|---|---|
| Host / port | `127.0.0.1` : `3306` |
| Database | `sprint_board` |
| Charset / collation | `utf8mb4` / `utf8mb4_unicode_ci` |
| User | `root` |
| Password | *(empty, XAMPP default)* |

### Create it

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Create the database. Either open phpMyAdmin → *New* → name `sprint_board`, collation `utf8mb4_unicode_ci`, or run:

   ```bash
   C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS sprint_board CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   ```

3. Create the tables from the API folder: `php artisan migrate` (see below).

If your MySQL user has a password or a different port, change the `DB_*` values in `sprint-board-api/.env`. Don't edit `.env.example` for personal settings.

### Tables

All tables are created by Laravel migrations in [`sprint-board-api/database/migrations/`](sprint-board-api/database/migrations/). Never create or change tables by hand in phpMyAdmin; add a migration instead.

| Table | Purpose |
|---|---|
| `users` | Accounts (name, email, hashed password) |
| `personal_access_tokens` | Sanctum API tokens, one row per logged-in device |
| `password_reset_tokens` | Pending password-reset requests |
| `sessions` | Laravel session store (not used by the token-based API) |
| `cache`, `cache_locks` | Database cache store, also used by rate limiting |
| `jobs`, `job_batches`, `failed_jobs` | Queue tables |
| `migrations` | Laravel's record of which migrations have run |

Tests don't touch this database. They run on an in-memory SQLite database (see `sprint-board-api/phpunit.xml`).

---

## Getting started

Set up the database first, then the API, then the UI.

### 1. API: `sprint-board-api`

```bash
cd sprint-board-api
composer install
cp .env.example .env          # Windows PowerShell: Copy-Item .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve             # http://localhost:8000
```

Check it's up: http://localhost:8000/api/v1/health

### 2. UI: `sprint-board-ui`

```bash
cd sprint-board-ui
npm install
ng serve                      # http://localhost:4200
```

---

## How the UI and API are linked

```
 Angular UI (localhost:4200)                       Laravel API (localhost:8000)
 ───────────────────────────                       ────────────────────────────
 environment.apiUrl ──── HTTP + JSON ───────────▶  /api/v1/*
   Authorization: Bearer <token>                    auth:sanctum middleware
 ◀──────── CORS allowed for FRONTEND_URL ────────   config/cors.php
                                                    │
                                                    ▼
                                              MySQL `sprint_board` (XAMPP)
```

Three settings must agree. If you change a port, update all of them:

| Setting | Where | Default |
|---|---|---|
| API base URL the UI calls | `sprint-board-ui/src/environments/environment*.ts` → `apiUrl` | `http://localhost:8000/api/v1` |
| Origin the API accepts (CORS) | `sprint-board-api/.env` → `FRONTEND_URL` (comma-separate several) | `http://localhost:4200` |
| API's own URL | `sprint-board-api/.env` → `APP_URL` | `http://localhost:8000` |

`FRONTEND_URL` is also used to build password-reset links, which point to `{FRONTEND_URL}/reset-password?token=…&email=…`. That UI page doesn't exist yet.

### Authentication

The API uses **Laravel Sanctum personal access tokens**, not cookies.

1. The UI sends `POST /auth/register` or `POST /auth/login`. The response includes a `token`.
2. The UI stores the token and sends it on every request as `Authorization: Bearer <token>`.
3. `POST /auth/logout` revokes that token. Tokens don't expire on their own; set `expiration` (minutes) in `sprint-board-api/config/sanctum.php` if needed.

### Endpoints

All paths are under `/api/v1`.

| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/health` | – | – |
| POST | `/auth/register` | – | `name`, `email`, `password`, `password_confirmation`, `device_name?` |
| POST | `/auth/login` | – | `email`, `password`, `device_name?` |
| POST | `/auth/forgot-password` | – | `email` |
| POST | `/auth/reset-password` | – | `token`, `email`, `password`, `password_confirmation` |
| GET | `/auth/me` | Bearer | – |
| POST | `/auth/logout` | Bearer | – |
| POST | `/auth/logout-all` | Bearer | – |
| PUT | `/auth/change-password` | Bearer | `current_password`, `password`, `password_confirmation` |

Public auth endpoints are limited to 10 requests per minute per email and IP address.

### Response format

Every `/api/*` response is JSON, errors included:

```jsonc
// success
{ "success": true,  "message": "Logged in successfully.", "data": { "user": { … }, "token": "1|abc…", "token_type": "Bearer" } }

// validation error (422)
{ "success": false, "message": "The email field is required.", "errors": { "email": ["The email field is required."] } }

// 401 / 404 / 500
{ "success": false, "message": "Unauthenticated." }
```

---

## Project notes

### API (`sprint-board-api`)

- **Routes:** [`routes/api.php`](sprint-board-api/routes/api.php), versioned under `v1`. Add protected resources to the `auth:sanctum` group at the bottom.
- **Controllers:** `app/Http/Controllers/Api/V1/`. They extend `Api\ApiController`, which provides `success()` and `error()` helpers.
- **Validation and output:** validation lives in Form Requests (`app/Http/Requests/`) and output in API Resources (`app/Http/Resources/`).
- **Email:** in local development, mail goes to `storage/logs/laravel.log` (`MAIL_MAILER=log`).
- **Tests:** `php artisan test`.

### UI (`sprint-board-ui`)

- **Theming:** the theming layer comes from the design handoff in `design_handoff_sprintboard_theming/`. Colors are CSS variables in `src/styles/_tokens.scss`, and light/dark/system mode is handled by `ThemeService` (`src/app/core/theme/`).
- **No hard-coded colors:** component styles must use `var(--token)`. `npm run lint:colors` fails the build on hex, `rgb()`, `oklch()` and similar values outside the token files.
- **Theme preview:** `/dev/theme` (dev builds only) shows components in both themes side by side.
- **Scripts:**

  | Command | Does |
  |---|---|
  | `npm start` | Dev server |
  | `npm test` | Unit tests (Vitest) |
  | `npm run lint:colors` | Color-literal check |
  | `npm run ci` | Color check + tests + production build |

---

## Branches

| Branch | Use |
|---|---|
| `main` | Default branch, stable. Merge into it from `development` only. |
| `development` | Integration branch. Branch features off it and open PRs back into it. |

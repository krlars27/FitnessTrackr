# FitnessTrackr

A workout-management REST API built with **Node.js, Express, and PostgreSQL**. FitnessTrackr lets users create workout routines, browse public routines and activities, and track activity counts and durations.

The project focuses on backend fundamentals: relational data modeling, RESTful API design, authentication, authorization, parameterized SQL, and automated testing.

## Features

- User registration and login with bcrypt password hashing
- JWT-based authentication using Bearer tokens
- Create, view, update, and delete workout routines
- Public routine discovery and user-specific routine listings
- Add activities to routines and track repetitions/counts and duration
- Ownership checks to prevent users from modifying another user's routines
- Parameterized SQL queries and allowlisted update fields
- Automated API, database, authorization, and SQL-injection tests

## Tech stack

| Category | Technologies |
|---|---|
| Runtime and API | Node.js, Express |
| Database | PostgreSQL, `pg` |
| Authentication | JSON Web Tokens, bcrypt |
| Testing | Jest, Supertest |
| Configuration | dotenv |

## Architecture

The application separates HTTP routing from database operations:

- `app.js` configures Express middleware and mounts the API router.
- `api/` contains route handlers, authentication middleware, and request handling.
- `db/` contains PostgreSQL queries, schema setup, and seed data.
- `tests/` contains API and database test suites.

### Database relationships

```mermaid
erDiagram
    USERS ||--o{ ROUTINES : creates
    ROUTINES ||--o{ ROUTINE_ACTIVITIES : contains
    ACTIVITIES ||--o{ ROUTINE_ACTIVITIES : appears_in

    USERS {
        int id PK
        string username UK
        string password
    }
    ROUTINES {
        int id PK
        int creatorId FK
        boolean isPublic
        string name UK
        string goal
    }
    ACTIVITIES {
        int id PK
        string name UK
        string description
    }
    ROUTINE_ACTIVITIES {
        int id PK
        int routineId FK
        int activityId FK
        int count
        int duration
    }
```

A routine belongs to a user. Routines and activities are connected through the `routine_activities` join table, which also stores the count and duration for each activity in a routine.

## Getting started

### Prerequisites

- Node.js (22 LTS recommended)
- npm
- PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/krlars27/FitnessTrackr.git
cd FitnessTrackr
npm install
```

### 2. Create a development database

Create a PostgreSQL database:

```bash
createdb fitness-dev
```

If you use the PostgreSQL command-line client instead, run:

```sql
CREATE DATABASE "fitness-dev";
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/fitness-dev
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=3000
```

Update the database username and password for your local PostgreSQL installation. Generate a strong, unique value for `JWT_SECRET`. Never commit your real `.env` file or secrets.

The database client defaults to a local `fitness-dev` database when `DATABASE_URL` is not provided.

### 4. Create and seed the tables

```bash
npm run seed
```

**Warning:** The seed script drops and recreates the application's tables before inserting sample data. Run it only against a disposable development database.

### 5. Start the API

```bash
npm start
```

For development with automatic restarts:

```bash
npm run start:dev
```

The API listens on port `3000` by default. Set `PORT` to use another port.

Check the health endpoint:

```bash
curl http://localhost:3000/api/health
```

## API overview

All routes are prefixed with `/api`. Protected routes require a valid Bearer token in the `Authorization` header.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/health` | Check API status | Public |
| POST | `/users/register` | Register a user | Public |
| POST | `/users/login` | Log in and receive a JWT | Public |
| GET | `/users/me` | Get the authenticated user | Authenticated |
| GET | `/users/:username/routines` | List a user's public routines | Public |
| GET | `/activities` | List activities | Public |
| POST | `/activities` | Create an activity | Public |
| PATCH | `/activities/:activityId` | Update an activity | Public |
| GET | `/activities/:activityId/routines` | Find public routines using an activity | Public |
| GET | `/routines` | List public routines | Public |
| POST | `/routines` | Create a routine | Authenticated |
| PATCH | `/routines/:routineId` | Update an owned routine | Owner only |
| DELETE | `/routines/:routineId` | Delete an owned routine | Owner only |
| POST | `/routines/:routineId/activities` | Add an activity to an owned routine | Owner only |
| PATCH | `/routine_activities/:routineActivityId` | Update count or duration | Owner only |
| DELETE | `/routine_activities/:routineActivityId` | Remove an activity from a routine | Owner only |

### Authentication example

Register or log in to receive a token:

```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"your-username","password":"your-password"}'
```

Use the returned token on protected requests:

```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create a routine example

```bash
curl -X POST http://localhost:3000/api/routines \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Upper Body","goal":"Build upper-body strength","isPublic":false}'
```

## Testing

Run the test suite:

```bash
npm test
```

The project currently has **108 passing tests across 13 test suites**, covering API behavior, database operations, authentication, authorization, and SQL-injection handling.

**Important:** Jest's global setup drops and recreates the application tables. Configure `DATABASE_URL` to point to a dedicated test database before running tests. Do not run the test suite against a database containing data you need to keep.

## Security practices demonstrated

- Passwords are hashed with bcrypt before storage.
- JWTs are used to authenticate protected requests.
- Routine and routine-activity mutations verify resource ownership.
- SQL queries use parameterized values for user-supplied input.
- Dynamic update queries use allowlists for permitted columns.
- Security tests verify that unauthorized requests do not mutate protected records and that password hashes are not exposed in tested user responses.

## Future improvements

- Add transaction handling for multi-step database changes.
- Expand request validation for numeric activity values and routine fields.
- Add API documentation with an OpenAPI specification.
- Add continuous integration to run tests on pull requests.

## Author and attribution

Maintained by [@krlars27](https://github.com/krlars27).

- [GitHub](https://github.com/krlars27)
- [LinkedIn](https://www.linkedin.com/in/krlars27)

The original package metadata credits Preston Wallace; that attribution has been retained.

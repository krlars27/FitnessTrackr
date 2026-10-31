# FitnessTrackr 💪

A workout-tracking REST API built with **Node.js**, **Express**, and **PostgreSQL**. The project demonstrates relational data modeling, parameterized SQL, JWT-based authentication, user authorization, and CRUD operations for routines and activities.

## Tech stack

- Node.js and Express
- PostgreSQL with the `pg` client
- JWT authentication and bcrypt password hashing
- Jest and Supertest test tooling

## Features

- Register and log in with a username and password
- Hash passwords before storing them
- Authenticate requests with Bearer tokens
- Create and manage workout routines
- Browse public routines and activities
- Associate activities with routines and track count/duration
- Restrict routine changes to the routine owner
- Use parameterized SQL queries for user-supplied values

## Project structure

```text
FitnessTrackr/
├── api/                  # Express routers and request middleware
├── db/                   # PostgreSQL queries, schema setup, and seed data
├── tests/                # Automated tests
├── app.js                # Express application
├── server.js             # HTTP server entry point
├── package.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone and install

```bash
git clone https://github.com/krlars27/FitnessTrackr.git
cd FitnessTrackr
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgres://localhost:5432/fitness-dev
JWT_SECRET=replace-this-with-a-long-random-secret
PORT=3000
```

Use a strong, unique secret for `JWT_SECRET`. Do not commit your `.env` file.

The database client uses `DATABASE_URL`; if it is omitted, it defaults to the local `fitness-dev` database.

### 3. Create and seed the database

The seed script rebuilds the application's tables and inserts sample data. **It drops and recreates the existing application tables**, so use it only with a development database whose data can be erased.

```bash
createdb fitness-dev
npm run seed
```

### 4. Start the API

```bash
npm start
```

For development with automatic restarts:

```bash
npm run start:dev
```

The server listens on port 3000 unless `PORT` is set to another value. The health endpoint is `GET /api/health`.

## Authentication

After registering or logging in, include the returned token in protected requests:

```http
Authorization: Bearer YOUR_TOKEN
```

Passwords are hashed with bcrypt. JWTs are signed using the `JWT_SECRET` environment variable.

## Testing

Run the configured test command:

```bash
npm test
```

The repository includes Jest/Supertest test tooling. Tests should be run against a dedicated test database, not a database containing data you need to keep.

## Security and reliability

Recent maintenance work includes parameterized database lookups, allowlisted update fields, safer missing-user handling, early returns after authorization failures, and ownership checks for routine modifications.

## Author and attribution

This repository is maintained in the `krlars27` GitHub account. The original package metadata credits Preston Wallace; that attribution has been retained rather than reassigned.

- GitHub: [@krlars27](https://github.com/krlars27)
- LinkedIn: [linkedin.com/in/krlars27](https://www.linkedin.com/in/krlars27)
- B.S. Computer Science, Roosevelt University

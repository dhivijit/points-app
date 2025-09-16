## Points App

A small Express/MongoDB app to manage point assignments for members and display a leaderboard.

This repository contains a basic admin-protected UI to add users, assign points per round, and view a leaderboard sorted by total or by round.

### Key files

- `app.js` - main Express application
- `models/Member.js` - Mongoose model for members
- `views/` - EJS templates for pages (login, assign, leaderboard, add user)

## Requirements

- Node.js (v12+)
- MongoDB connection (local or cloud)

## Environment variables

Create a `.env` file in the project root (or set environment variables in your environment). The app reads the following variables:

- `MONGODB_URI` - MongoDB connection string. Example: `mongodb://localhost:27017/points`
- `JWT_SECRET` - Secret string used to sign the admin authentication cookie (default in code: `secretkey` if not set). Use a strong random string in production.
- `PASSWORD` - Admin password for the login page (default in code: `adminpass` if not set).
- `PORT` - Optional. Port the server listens on (default: 3000).

For convenience there's a `.env.example` file you can copy to `.env` and edit.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (or copy `.env.example`) and set the required variables.

3. Start the app:

```bash
node app.js
```

The server will run on `http://localhost:3000` by default (or the `PORT` you configured).

## Usage

- Open the app root `/` to see the login page. Enter the admin password (from `PASSWORD` env var). Successful login sets an HTTP-only JWT cookie for 8 hours.
- After logging in you can:
  - Visit `/assign` to assign points to a member for a selected round.
  - Visit `/adduser` to create a new member.
  - Visit `/leaderboard` to see the leaderboard and optionally filter by `?round=1|2|3`.

### Important endpoints (summary)

- `GET /` - Login page
- `POST /` - Login form (field `password`)
- `POST /logout` - Clears auth cookie
- `GET /leaderboard` - Leaderboard (optional `?round=1|2|3`)
- `GET /assign` - Assign points page (requires auth)
- `POST /assign` - Assign points (fields: `memberName`, `round`, `points`)
- `GET /adduser` - Add user page (requires auth)
- `POST /adduser` - Create user (field: `name`)
- `GET /seed` - Create sample members (idempotent)

## Security notes

- The admin auth uses a cookie containing a signed JWT. Keep `JWT_SECRET` private and long enough.
- The default in-code password and JWT secret are for development only. Set strong values in production.
- The app currently relies on server-side templates and simple authentication; consider adding CSRF protection and rate limiting for production use.

## Troubleshooting

- MongoDB connection errors: ensure `MONGODB_URI` is valid and reachable. For local MongoDB, ensure the server is running.
- Port in use: change `PORT` in `.env` or free the port.

## Contributing / Next steps

- Add validation and proper error handling on forms.
- Replace password-based admin login with a user model and hashed passwords.
- Add unit tests and CI checks.

---

If you want, I can also add a `.env.example` file to the repo with example keys — tell me if you'd like that and I will add it.

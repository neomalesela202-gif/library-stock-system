# Library Stock System (BIWA2110 Lab Test)

React (Vite) frontend + Express backend + MySQL.

## Setup

**Requirements:** Node.js 18+, MySQL running locally.

### 1. Backend
```
cd backend
npm install
copy .env.example .env      (Windows)   |   cp .env.example .env   (Mac/Linux)
```
Open `.env` and set `DB_PASSWORD` to your MySQL password. Then:
```
npm start
```
The server finds MySQL's port by itself (checks the running mysqld, then common ports). On first run it creates the `library_db` database, the tables, one admin user and four sample books. API runs on http://localhost:5000.

### 2. Frontend (new terminal)
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

**First login:** membership ID `ADMIN001`, password `admin123`.

## API

| Method | Route | Purpose |
|---|---|---|
| GET / POST | /books | list / add book (title, author, genre, isbn, quantity) |
| GET / PUT / DELETE | /books/:id | read / update details / delete |
| GET / POST | /transactions | history / record ADD or BORROW (deducts stock, rejects if not enough) |
| GET / POST | /users | list / add user (name, membership_id, role, password) |
| PUT / DELETE | /users/:id | update / delete |
| POST | /users/login | log in with membership_id + password |

## Requirement checklist

- React hooks (useState, useEffect, useContext), reusable components, controlled forms with validation, React Router, Fetch API
- Express REST API, CRUD for /books /transactions /users, `express.json()` and `cors`
- MySQL stores books, users, transactions; stock tracked in `books.quantity`; borrowing history in `transactions`
- Dashboard highlights books with fewer than 2 copies
- Book page: add form + list with Update and Delete
- Transactions page: Add stock / Deduct stock buttons + history log
- Users page: login form (/login) + admin-only add/update/delete

## Design notes (for your viva)

- Stock is changed only through transactions, inside a database transaction (stock update and log entry succeed or fail together).
- Passwords are hashed with bcrypt, never stored as plain text.
- Login state is kept in React context + sessionStorage. The API does not issue tokens, so the admin-only restriction is enforced in the UI. A next step would be JWT middleware on the routes.
- Deleting a book removes its transaction history (ON DELETE CASCADE).

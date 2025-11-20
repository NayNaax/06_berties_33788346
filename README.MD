# Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

## Installation and Setup

1. Install dependencies

```pwsh
npm install
```

2. Set up the MySQL database

Run the database creation script in MySQL command line:

```pwsh
mysql -u root -p
```

Then execute:

```sql
SOURCE create_db.sql;
```

Or manually run the commands from `create_db.sql` to create:

-   `berties_books` database
-   `books` table
-   `users` table (if needed)
-   `login_attempts` table (for audit tracking)
-   Application user `berties_books_app` with appropriate privileges

3. (Optional) Insert test data

```sql
SOURCE insert_test_data.sql;
```

4. Configure environment variables

Create a `.env` file in the project root with the following variables:

```
BB_USER=berties_books_app
BB_PASSWORD=qwertyuiop
BB_DATABASE=berties_books
```

**Note:** `.env` is git-ignored to protect credentials.

5. Start the app

```pwsh
npm start
```

The application will be available at `http://localhost:8000`

## Features

### Books Management

-   Search for books by name
-   View all books
-   Add new books
-   View bargain books (under £20)

### User Management

-   User registration with bcrypt password hashing
-   User login with authentication
-   View registered users list

### Login Audit System

All login attempts (both successful and failed) are logged to the `login_attempts` table for security monitoring:

-   **Tracked information:** username, success status, failure reason, timestamp
-   **Access audit log:** Navigate to `/users/audit` to view the complete login history
-   **Display format:** ID, formatted timestamp (YYYY-MM-DD HH:MM:SS), username, success (Yes/No), and reason for failure
-   **Failure reasons tracked:**
    -   Missing credentials
    -   User not found
    -   Incorrect password

The audit feature helps with security monitoring, troubleshooting authentication issues, and compliance tracking.

## Environment Variables (dotenv)

This project uses the `dotenv` module to keep database credentials secure:

-   **Load:** `require('dotenv').config()` at the top of `index.js`
-   **Configure:** Create `.env` file with `BB_USER`, `BB_PASSWORD`, `BB_DATABASE`
-   **Usage:** `index.js` reads these via `process.env` when creating the MySQL connection pool
-   **Security:** `.env` is in `.gitignore` and never committed to version control

## Project Structure

```
berties-books/
├── index.js              # Main application entry point
├── package.json          # Dependencies and scripts
├── .env                  # Environment variables (not in git)
├── create_db.sql         # Database setup script
├── insert_test_data.sql  # Sample data
├── routes/
│   ├── main.js          # Home and about routes
│   ├── books.js         # Book management routes
│   └── users.js         # User and authentication routes
├── views/               # EJS templates
│   ├── index.ejs
│   ├── about.ejs
│   ├── login.ejs
│   ├── register.ejs
│   ├── audit.ejs        # Login audit page
│   └── ...
└── public/
    └── main.css         # Stylesheets
```

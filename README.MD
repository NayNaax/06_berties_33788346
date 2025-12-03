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

## Access Control

Access control has been implemented to restrict sensitive operations to logged-in users only.

### Protected Routes (Login Required)

The following routes require the user to be logged in. If a user attempts to access these pages without an active session, they will be redirected to the login page.

-   `/users/list`: Protects the list of registered users.
-   `/users/audit`: Protects the security audit logs.
-   `/books/addbook`: Restricts adding new books to authorized users.
-   `/books/bookadded`: Ensures only authorized users can submit the add book form.

### Public Routes

These routes are accessible to everyone, including guests:

-   `/` (Home)
-   `/about`
-   `/users/register` & `/users/registered`
-   `/users/login` & `/users/loggedin`
-   `/books/search` & `/books/search-result`
-   `/books/list`
-   `/books/bargainbooks`

## Data Validation

Server-side validation has been implemented using `express-validator` to ensure data integrity and security.

### Validated Routes

1.  **User Registration (`/users/registered`)**

    -   **Email**: Must be a valid email format.
    -   **Username**: Must be between 5 and 20 characters.
    -   **Password**: Must be at least 8 characters long.
    -   **First/Last Name**: Must not be empty.
    -   **Reasoning**: Ensures that user accounts are created with valid contact information and secure credentials.

2.  **Add Book (`/books/bookadded`)**

    -   **Name**: Must not be empty.
    -   **Price**: Must be a numeric value.
    -   **Reasoning**: Prevents the insertion of incomplete or invalid product data into the database.

3.  **Book Search (`/books/search-result`)**
    -   **Search Text**: Must not be empty.
    -   **Reasoning**: Ensures that search queries are meaningful and prevents returning all records unintentionally.

### Routes without Explicit Validation

-   **Login (`/users/loggedin`)**: Uses manual checks for presence of username and password. Explicit validation rules (like length) are avoided here to prevent leaking information about valid credential formats to potential attackers.
-   **GET Routes (e.g., `/list`, `/bargainbooks`)**: These routes do not accept user input parameters that require validation.

## Sanitization

Input sanitization has been implemented using `express-sanitizer` to protect against Cross-Site Scripting (XSS) attacks.

### Sanitized Fields

The following fields are sanitized to remove potentially malicious HTML tags (e.g., `<script>`) before processing:

1.  **User Registration (`/users/registered`)**

    -   **First Name** (`first`)
    -   **Last Name** (`last`)
    -   **Username** (`username`)
    -   **Email** (`email`)

2.  **User Login (`/users/loggedin`)**

    -   **Username**: Sanitized to prevent reflected XSS in the "Welcome back" message.

3.  **Book Search (`/books/search-result`)**

    -   **Search Text**: Sanitized to prevent potential XSS if the search term is ever displayed back to the user.

4.  **Add Book (`/books/bookadded`)**
    -   **Name**: Sanitized as it is displayed back in the confirmation message.
    -   **Price**: Sanitized (though validated as numeric) for consistency.

**Reasoning:** These fields are often displayed back to the user (e.g., in welcome messages, user lists, or confirmation screens). If they contained malicious scripts, those scripts could execute in the browser of anyone viewing the data, leading to XSS vulnerabilities.

### Unsanitized Fields

    -   **Reasoning**: Passwords may legitimately contain special characters (like `<`, `>`, `&`) that sanitizers might remove or escape. Altering the password would result in the user saving a different password than they intended, causing login failures. Since passwords are hashed before storage and should not be displayed in plain text, the XSS risk is mitigated by proper handling rather than sanitization.

## API Documentation

The application provides a RESTful API to access book data.

### Get All Books

**Endpoint:** `GET /api/books`

Returns a JSON list of all books in the database.

### Query Parameters

You can filter and sort the results using the following query parameters:

-   **search**: Filter books by name (partial match).
    -   Example: `/api/books?search=universe`
-   **minprice**: Filter books with a price greater than or equal to this value.
    -   Example: `/api/books?minprice=5`
-   **max_price**: Filter books with a price less than or equal to this value.
    -   Example: `/api/books?max_price=15`
-   **sort**: Sort the results by a specific field.
    -   Options: `name`, `price`
    -   Example: `/api/books?sort=price`

### Combined Example

`GET /api/books?search=world&minprice=5&max_price=20&sort=price`
Returns books containing "world" in the name, priced between £5 and £20, sorted by price.

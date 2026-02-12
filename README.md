# Payment Processing MVP

Minimal payment processing app (Node.js + Express + SQLite + plain HTML/JS frontend).

## Tech stack
- Backend: Node.js, Express
- Database: SQLite
- Frontend: Plain HTML + JavaScript

## Setup
1. Install dependencies

```bash
npm install
```

2. Copy environment example

```bash
cp .env.example .env
```

3. Start server

```bash
npm start
```

Server serves the frontend at `http://localhost:3000` by default.

## API

POST /api/payment
- Request JSON: `{ "name": "John Doe", "email": "john@example.com", "contact": "9876543210", "amount": "1500.00" }`
- Success: 201 Created

Response example:

```json
{
  "success": true,
  "message": "Payment processed successfully",
  "paymentId": "1",
  "data": { "name": "John Doe", "email": "john@example.com", "amount": 1500.00, "status": "success" }
}
```

Error example (400):

```json
{ "success": false, "errors": { "name": "Name must be at least 3 characters" } }
```

GET /api/payments
- Returns list of payments.

## Validation rules
- `name`: 3-50 chars, letters and spaces only
- `email`: basic email regex
- `contact`: exactly 10 digits
- `amount`: decimal with 2 places, between ₹1.00 and ₹100000.00

## DB schema
Table `payments`:
- `id` INTEGER PK AUTOINCREMENT
- `name` TEXT NOT NULL
- `email` TEXT NOT NULL
- `contact` TEXT NOT NULL
- `amount` REAL NOT NULL
- `status` TEXT NOT NULL (one of `pending`,`success`,`failed`)
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

## Notes
- This project is intentionally minimal for the assignment. Payment processing is simulated (status set to `success`).
- For production, add authentication, secure headers, HTTPS, input sanitization libraries, and use a production DB.

# Payment App API Documentation 🚀

> Base URL: `http://localhost:3000/api`

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

## 🛣️ Endpoints

### 📝 User Management

#### `POST /auth/signup`

Register a new user in the system.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123",
    "role": "psp" | "dev"
}
```

**Success Response:** `201 Created`
```json
{
    "message": "User created successfully",
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "psp"
    }
}
```

**Error Responses:**
- `400` - Validation errors
- `409` - User already exists

#### `POST /auth/login`

Authenticate existing user and retrieve JWT token.

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

**Success Response:** `200 OK`
```json
{
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "role": "psp"
    }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Invalid credentials

### 💰 Transaction Operations

#### `GET /transactions`

Retrieve authenticated user's transaction history.

**Required Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response:** `200 OK`
```json
{
    "transactions": [
        {
            "id": 1,
            "recipient": "John Doe",
            "amount": 100.50,
            "currency": "USD",
            "status": "completed",
            "timestamp": "2025-07-22T10:30:00.000Z"
        }
    ]
}
```

#### `POST /send`

Initialize a new payment transaction.

**Required Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
    "recipient": "John Doe",
    "amount": 100.50,
    "currency": "USD"
}
```

**Success Response:** `201 Created`
```json
{
    "message": "Payment sent successfully",
    "transaction": {
        "id": 1,
        "recipient": "John Doe",
        "amount": 100.50,
        "currency": "USD",
        "status": "completed",
        "timestamp": "2025-07-22T10:30:00.000Z"
    }
}
```

**Error Responses:**
- `400` - Validation errors
- `401` - Unauthorized
- `500` - Payment processing failed

## ⚠️ Error Format

All API error responses follow this standardized format:

```json
{
    "error": "Error message",
    "errors": [
        {
            "field": "email",
            "message": "Invalid email format"
        }
    ]
}
```

## 🔔 Webhook Integration

When a payment is processed via `/send`, the system triggers a webhook to the configured URL with the following payload:

```json
{
    "event": "payment.sent",
    "data": {
        "transaction_id": 1,
        "user_id": 1,
        "recipient": "John Doe",
        "amount": 100.50,
        "currency": "USD",
        "timestamp": "2025-07-22T10:30:00.000Z",
        "status": "completed"
    },
    "timestamp": "2025-07-22T10:30:00.000Z"
}
```
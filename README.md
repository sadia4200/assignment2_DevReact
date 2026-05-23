# DevPulse API

A RESTful backend API for an internal tech issue and feature tracker. Built for software teams to report bugs, suggest features, and coordinate resolutions.

🌐 **Live URL:** 
---

## ✨ Features

- User registration and login with role-based access (contributor / maintainer)
- JWT authentication without Bearer prefix
- Create, read, update, and delete issues
- Filter issues by type and status
- Sort issues by newest or oldest
- Reporter details attached to issues without SQL JOINs
- Secure password hashing with bcrypt
- Reusable utility functions for responses and SQL queries
- Strict TypeScript with proper interfaces, no any types
- Modular architecture with clean folder structure

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js LTS | Runtime environment |
| TypeScript ESM | Type-safe development |
| Express.js v5 | Web framework |
| PostgreSQL NeonDB | Relational database |
| Raw SQL pg driver | Database queries no ORM |
| bcrypt | Password hashing |
| jsonwebtoken | JWT authentication |
| http-status-codes | HTTP status references |

---

## 📁 Project Structure

src/
├── config/
│   └── db.ts                  # NeonDB connection pool
├── middlewares/
│   └── auth.middleware.ts     # JWT auth and role authorization
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts # Signup and login logic
│   │   └── auth.routes.ts     # Auth route definitions
│   └── issues/
│       ├── issues.controller.ts # All issue API logic
│       └── issues.routes.ts     # Issues route definitions
├── utils/
│   ├── interfaces.ts          # TypeScript interfaces
│   ├── response.utils.ts      # Reusable response helpers
│   └── db.utils.ts            # Reusable SQL query helpers
├── app.ts                     # Express app setup
└── server.ts                  # Entry point

---

## 👥 User Roles and Permissions

| Role | Permissions |
|------|------------|
| contributor | Register, login, create issues, view all issues, update own open issues |
| maintainer | All contributor permissions plus update any issue and delete any issue |

---

## ⚙️ Local Setup

### 1. Clone the repository

git clone https://github.com/Fahim7600/devpulse-api.git
cd devpulse-api

### 2. Install dependencies

npm install

### 3. Create .env file in root

PORT=5000
DATABASE_URL=your_neondb_connection_string
JWT_SECRET=your_secret_key

### 4. Run database schema

Go to your NeonDB SQL Editor and run the contents of schema.sql

### 5. Start development server

npm run dev

Server runs at http://localhost:5000

---

## 🗄️ Database Schema

### users table

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| name | VARCHAR 255 | Full display name |
| email | VARCHAR 255 | Unique login email |
| password | VARCHAR 255 | Bcrypt hashed password |
| role | VARCHAR 20 | contributor or maintainer |
| created_at | TIMESTAMPTZ | Auto-generated on insert |
| updated_at | TIMESTAMPTZ | Auto-updated on update |

### issues table

| Field | Type | Description |
|-------|------|-------------|
| id | SERIAL | Auto-increment primary key |
| title | VARCHAR 150 | Short issue headline |
| description | TEXT | Detailed explanation min 20 chars |
| type | VARCHAR 20 | bug or feature_request |
| status | VARCHAR 20 | open in_progress resolved |
| reporter_id | INTEGER | References users id |
| created_at | TIMESTAMPTZ | Auto-generated on insert |
| updated_at | TIMESTAMPTZ | Auto-updated on update |

---

## 🔐 Authentication

This API uses JWT JSON Web Token for authentication.

After login you receive a token. Send the token directly in the Authorization header with no Bearer prefix needed.

Authorization: your_jwt_token_here

---

## 📡 API Endpoints

### Base URL

https://assignment2-devpulse.onrender.com

### Full Endpoint List

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/signup | Public | Register new user |
| POST | /api/auth/login | Public | Login and get JWT token |
| POST | /api/issues | Authenticated | Create new issue |
| GET | /api/issues | Public | Get all issues with filters |
| GET | /api/issues/:id | Public | Get single issue |
| PATCH | /api/issues/:id | Authenticated | Update an issue |
| DELETE | /api/issues/:id | Maintainer only | Delete an issue |

---

### 1. POST /api/auth/signup

Request Body:

{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}

Success Response 201:

{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00Z",
    "updated_at": "2026-01-20T09:00:00Z"
  }
}

---

### 2. POST /api/auth/login

Request Body:

{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}

Success Response 200:

{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00Z",
      "updated_at": "2026-01-20T09:00:00Z"
    }
  }
}

---

### 3. POST /api/issues

Headers:
Authorization: your_jwt_token

Request Body:

{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}

Success Response 201:

{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T10:30:00Z"
  }
}

---

### 4. GET /api/issues

Query Parameters:

| Param | Values | Default |
|-------|--------|---------|
| sort | newest oldest | newest |
| type | bug feature_request | none |
| status | open in_progress resolved | none |

Example:
GET /api/issues?sort=newest&type=bug&status=open

Success Response 200:

{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00Z",
      "updated_at": "2026-01-20T14:45:00Z"
    }
  ]
}

---

### 5. GET /api/issues/:id

Success Response 200:

{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}

---

### 6. PATCH /api/issues/:id

Headers:
Authorization: your_jwt_token

Request Body:

{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps added here",
  "type": "bug"
}

Success Response 200:

{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps added here",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00Z",
    "updated_at": "2026-01-20T14:45:00Z"
  }
}

---

### 7. DELETE /api/issues/:id

Headers:
Authorization: maintainer_jwt_token

Success Response 200:

{
  "success": true,
  "message": "Issue deleted successfully"
}

---

## ❌ Error Response Format

All errors follow this structure:

{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}

---

## 📋 HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET PATCH DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation errors duplicate email |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Valid token but insufficient role |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Contributor editing non-open issue |
| 500 | Internal Server Error | Unexpected server error |

---

## 🚀 Deployment

This API is deployed on Render.

Live URL: https://assignment2-devpulse.onrender.com

---

## 👤 Author

Arfan Ahmed Fahim
GitHub: https://github.com/Fahim7600
LinkedIn: https://linkedin.com/in/arfan-ahmed-fahim
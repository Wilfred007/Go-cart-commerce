# Auth Module Documentation

## Table of Contents
1. [Overview](#overview)
2. [Module Architecture](#module-architecture)
3. [Step-by-Step Build Process](#step-by-step-build-process)
4. [File Structure](#file-structure)
5. [Detailed Component Breakdown](#detailed-component-breakdown)
6. [TypeScript Concepts Used](#typescript-concepts-used)
7. [API Endpoints](#api-endpoints)
8. [Testing](#testing)

---

## Overview

The Auth Module handles user authentication and authorization in the e-commerce application. It provides:
- ✅ User registration
- ✅ User login
- ✅ JWT token generation
- ✅ Password hashing
- ✅ Token validation

**Purpose**: Secure user authentication system that protects routes and manages user sessions.

---

## Module Architecture

```
┌─────────────────┐
│   HTTP Client   │
│  (Postman/Browser) │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Auth Controller    │  ← Receives HTTP requests
│  - POST /register   │
│  - POST /login      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│   Auth Service      │  ← Business logic
│  - register()       │
│  - login()          │
│  - generateTokens() │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Prisma Service     │  ← Database operations
│  - user.create()    │
│  - user.findUnique()│
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│   Neon Database     │  ← PostgreSQL
└─────────────────────┘
```

---

## Step-by-Step Build Process

### Phase 1: Module Structure
### Phase 2: Data Transfer Objects (DTOs)
### Phase 3: Auth Service
### Phase 4: Auth Controller
### Phase 5: Module Configuration
### Phase 6: JWT Strategy

*Each phase is documented in detail below.*

---

## File Structure

```
api/src/module/auth/
├── dto/
│   ├── register.dto.ts          # Registration input validation
│   ├── login.dto.ts             # Login input validation
│   └── auth-response.dto.ts     # API response structure
├── strategies/
│   └── jwt.strategy.ts          # JWT validation strategy
├── auth.controller.ts           # HTTP endpoint handlers
├── auth.service.ts              # Business logic
├── auth.module.ts               # Module configuration
└── auth.service.spec.ts         # Unit tests
```

---

## Detailed Component Breakdown

### 📋 [1. DTOs (Data Transfer Objects)](./01-dtos.md)
- RegisterDto - User registration data
- LoginDto - User login credentials
- AuthResponseDto - API response structure

### 🔧 [2. Auth Service](./02-auth-service.md)
- User registration logic
- Password hashing
- Token generation
- User validation

### 🌐 [3. Auth Controller](./03-auth-controller.md)
- HTTP endpoints
- Request handling
- Response formatting

### ⚙️ [4. Auth Module](./04-auth-module.md)
- Module configuration
- Dependency injection
- JWT setup

### 🔐 [5. JWT Strategy](./05-jwt-strategy.md)
- Token validation
- User authentication
- Protected routes

---

## TypeScript Concepts Used

| Concept | Usage | Example |
|---------|-------|---------|
| **Decorators** | Metadata for classes/methods | `@Injectable()`, `@Controller()` |
| **Async/Await** | Handle promises | `async register()` |
| **Interfaces** | Type contracts | `Promise<AuthResponseDTO>` |
| **Generics** | Type parameters | `ConfigService.get<string>()` |
| **Access Modifiers** | `private`, `public` | `private prisma: PrismaService` |
| **Arrow Functions** | Concise functions | `(user) => user.id` |
| **Destructuring** | Extract object properties | `const { email, password } = dto` |
| **Optional Chaining** | Safe property access | `user?.email` |
| **Nullish Coalescing** | Default values | `value ?? 'default'` |

---

## API Endpoints

### POST `/auth/register`
Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  }
}
```

### POST `/auth/login`
Login with existing credentials

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**: Same as register

---

## Testing

See [Testing Guide](./testing.md) for:
- Unit test examples
- Integration tests
- Manual testing with Postman

---

## Next Steps

After completing the Auth module, you can:
1. Build the User module
2. Add protected routes
3. Implement refresh token logic
4. Add email verification

---

*[← Back to Main Documentation](../../README.md)*

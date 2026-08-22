# Go-Cart Commerce

A backend e-commerce API built with **NestJS**, **Prisma**, and **PostgreSQL** (Neon). It provides JWT-based authentication with access/refresh token rotation and a relational data model covering users, products, categories, carts, orders, and payments.

> **Status:** Early stage. The authentication module (register, login, refresh, logout) is implemented. Product, cart, order, and payment endpoints are modeled in the database schema but not yet exposed via the API.

## Tech Stack

- **[NestJS](https://nestjs.com/)** — progressive Node.js framework (TypeScript)
- **[Prisma](https://www.prisma.io/)** — type-safe ORM
- **PostgreSQL** — via [Neon](https://neon.tech/) serverless Postgres
- **Passport + JWT** — authentication, with access & refresh token strategies
- **bcrypt** — password hashing
- **class-validator** — DTO validation
- **Jest** — unit & e2e testing

## Project Structure

```
go-cart-ecommerce/
├── api/                          # NestJS backend application
│   ├── src/
│   │   ├── commons/
│   │   │   ├── decorators/       # e.g. @GetUser()
│   │   │   └── guards/           # JwtAuthGuard
│   │   ├── module/
│   │   │   └── auth/             # Registration, login, refresh, logout
│   │   │       ├── dto/
│   │   │       ├── guards/
│   │   │       └── strategies/   # JWT & refresh-token passport strategies
│   │   ├── prisma/               # PrismaService (injectable DB client)
│   │   ├── app.module.ts
│   │   └── main.ts               # App bootstrap (global prefix: /api/v1)
│   └── test/                     # e2e tests
├── prisma/
│   ├── schema.prisma             # Data model (User, Product, Category, Cart, Order, Payment)
│   └── migrations/
├── src/prisma/                   # Standalone Prisma service (root-level)
├── docs/                         # Module-by-module build documentation
└── prisma.config.ts
```

## Data Model

Defined in [`prisma/schema.prisma`](./prisma/schema.prisma):

| Model | Purpose |
|---|---|
| `User` | Account with role (`USER` / `ADMIN`), hashed password, refresh token |
| `Product` | Catalog item with price, stock, SKU, category |
| `Category` | Product categorization |
| `Cart` / `CartItem` | Per-user shopping cart |
| `Order` / `OrderItem` | Placed orders with status (`PENDING`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`) |
| `Payment` | Payment record per order with status (`PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`) |

## Getting Started

### Prerequisites

- Node.js 20+
- A PostgreSQL database (this project targets [Neon](https://neon.tech/))

### 1. Clone and install dependencies

```bash
git clone https://github.com/Wilfred007/Go-cart-commerce.git
cd Go-cart-commerce
npm install          # root-level Prisma tooling
cd api
npm install           # NestJS API
```

### 2. Configure environment variables

Create a `.env` file inside `api/`:

```env
PORT=3000

# Neon (or any) PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"

JWT_SECRET="<a-long-random-string>"
JWT_EXPIRES_IN=900
JWT_REFRESH_SECRET="<a-different-long-random-string>"
```

Create a `.env` file at the project root (used by the Prisma CLI):

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<database>?sslmode=require"
```

> Generate strong secrets with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 3. Run database migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Start the API

```bash
cd api
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`.

## API Endpoints

All routes are prefixed with `/api/v1`.

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create a new user account | — |
| `POST` | `/auth/login` | Authenticate and receive access/refresh tokens | — |
| `POST` | `/auth/refresh` | Exchange a valid refresh token for a new access token | Refresh token |
| `POST` | `/auth/logout` | Invalidate the current user's refresh token | Access token |

**Register / Login response shape:**

```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string | null",
    "lastName": "string | null",
    "role": "USER | ADMIN"
  }
}
```

## Testing

Run from the `api/` directory:

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
npm run test:cov    # coverage report
```

## Documentation

Deeper, module-by-module write-ups (design decisions, TypeScript concepts, build steps) live in [`docs/`](./docs/README.md), starting with the [Auth module](./docs/modules/auth/README.md).

## License

UNLICENSED — private project.

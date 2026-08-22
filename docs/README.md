# Go-Cart E-Commerce API Documentation

## Overview
This documentation provides detailed explanations of each module built in the Go-Cart e-commerce application.

## Project Structure
```
go-cart-ecommerce/
├── api/                    # NestJS Backend API
│   └── src/
│       ├── module/        # Feature modules
│       │   └── auth/      # Authentication module
│       └── prisma/        # Database service
├── prisma/                # Database schema
└── docs/                  # 📚 You are here
```

## Modules Documentation

### Core Modules
- [Database Setup](./database-setup.md) - Prisma configuration and Neon database
- [Prisma Module](./modules/prisma.md) - Database service module

### Feature Modules
- [Auth Module](./modules/auth/README.md) - Complete authentication system

## Technologies Used
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Modern database ORM
- **Neon** - Serverless PostgreSQL
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing

## Getting Started
1. Read the [Database Setup](./database-setup.md) guide
2. Explore individual module documentation
3. Follow step-by-step build guides for each feature

## Documentation Format
Each module documentation includes:
- ✅ **Step-by-step build process**
- ✅ **Code explanations**
- ✅ **TypeScript concepts**
- ✅ **Real-world analogies**
- ✅ **Common pitfalls**
- ✅ **Testing examples**

---
*Last Updated: July 12, 2026*

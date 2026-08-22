# Auth Module - Part 1: DTOs (Data Transfer Objects)

## What are DTOs?

**DTO** = Data Transfer Object

Think of DTOs as **forms** or **contracts** that define:
- What data the API expects
- What format the data should be in
- What validation rules apply

**Real-world analogy**: DTOs are like airport security forms - they specify exactly what information you must provide and in what format.

---

## Step 1: Create RegisterDto

### File: `dto/register.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterDto {
    @IsEmail({}, {message: "Please provide a valid email"})
    @IsNotEmpty({message: "Email is required"})
    email: string

    @IsString({message: "Password must be a string"})
    @IsNotEmpty({message: "Password is required"})
    @MinLength(8, {message: "Password must be at least 8 characters long"})
    password: string

    @IsString({message: "First name must be a string"})
    @IsOptional()
    firstName?: string

    @IsString({message: "Last name must be a string"})
    @IsOptional()
    lastName?: string
}
```

### Breaking It Down:

#### 1. **Imports**
```typescript
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
```
- `class-validator` = Library that validates data automatically
- Each import is a **validator decorator** you can use

#### 2. **Class Definition**
```typescript
export class RegisterDto {
```
- `export` = Make this class available to other files
- `class` = Blueprint for an object
- `RegisterDto` = Name following convention: `[Purpose]Dto`

#### 3. **Email Field**
```typescript
@IsEmail({}, {message: "Please provide a valid email"})
@IsNotEmpty({message: "Email is required"})
email: string
```

**Decorators** (the `@` symbols):
- `@IsEmail()` = Validates email format (must have @ and domain)
- `@IsNotEmpty()` = Field cannot be empty
- Multiple decorators = Multiple validation rules

**TypeScript Concept - Decorators**:
- Special functions that add behavior to classes/properties
- Run automatically before your code executes
- Syntax: `@DecoratorName()`

**Property Declaration**:
```typescript
email: string
```
- `email` = Property name
- `: string` = Type annotation (must be a string)

#### 4. **Password Field**
```typescript
@IsString({message: "Password must be a string"})
@IsNotEmpty({message: "Password is required"})
@MinLength(8, {message: "Password must be at least 8 characters long"})
password: string
```

**New Validator**:
- `@MinLength(8)` = Password must be at least 8 characters
- First parameter: minimum length
- Second parameter: error message

#### 5. **Optional Fields**
```typescript
@IsString({message: "First name must be a string"})
@IsOptional()
firstName?: string
```

**TypeScript Concept - Optional Properties**:
- `firstName?` = The `?` makes it optional
- User doesn't have to provide this field
- `@IsOptional()` = Tells validator to skip if not provided

---

## Step 2: Create LoginDto

### File: `dto/login.dto.ts`

```typescript
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsEmail({}, {message: "Please provide a valid email"})
    @IsNotEmpty({message: "Email is required"})
    email: string

    @IsString({message: "Password must be a string"})
    @IsNotEmpty({message: "Password is required"})
    password: string
}
```

**Simpler than RegisterDto**:
- Only email and password (required for login)
- No optional fields
- No minimum length check (already validated during registration)

---

## Step 3: Create AuthResponseDto

### File: `dto/auth-response.dto.ts`

```typescript
import { Role } from "../../../../../generated/prisma"

export class AuthResponseDTO {
    accessToken: string
    refreshToken: string
    
    user: {
        id: string,
        email: string,
        firstName: string | null,
        lastName: string | null,
        role: Role
    }
}
```

### Breaking It Down:

#### 1. **Import Role Enum**
```typescript
import { Role } from "../../../../../generated/prisma"
```
- `Role` = Enum from your Prisma schema (USER, ADMIN)
- Comes from generated Prisma client
- Ensures type safety for user roles

**TypeScript Concept - Enums**:
```typescript
enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}
```

#### 2. **Token Properties**
```typescript
accessToken: string
refreshToken: string
```
- `accessToken` = Short-lived token for API requests
- `refreshToken` = Long-lived token to get new access tokens
- Both are JWT strings

#### 3. **Nested User Object**
```typescript
user: {
    id: string,
    email: string,
    firstName: string | null,
    lastName: string | null,
    role: Role
}
```

**TypeScript Concept - Inline Object Type**:
- `user: { ... }` = Object with specific shape
- Alternative to creating a separate interface

**TypeScript Concept - Union Types**:
```typescript
firstName: string | null
```
- `string | null` = Can be either a string OR null
- `|` = Union operator (either/or)
- Matches Prisma schema (optional fields can be null)

---

## Why DTOs Matter

### 1. **Type Safety**
```typescript
// ✅ TypeScript knows what properties exist
function register(dto: RegisterDto) {
    console.log(dto.email);  // OK
    console.log(dto.age);    // ❌ Error: Property 'age' doesn't exist
}
```

### 2. **Automatic Validation**
```typescript
// User sends invalid data
{
  "email": "notanemail",  // ❌ Invalid email format
  "password": "short"      // ❌ Too short
}

// NestJS automatically returns:
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

### 3. **Documentation**
- DTOs serve as documentation for your API
- Developers know exactly what data to send
- Frontend developers can see expected structure

### 4. **Consistency**
- Same structure across all registration requests
- Prevents bugs from inconsistent data
- Makes testing easier

---

## Validation Flow

```
1. Client sends request
   ↓
2. NestJS receives JSON data
   ↓
3. ValidationPipe transforms JSON → RegisterDto instance
   ↓
4. class-validator checks all decorators
   ↓
5a. Valid? → Pass to controller ✅
5b. Invalid? → Return 400 error ❌
```

---

## Common Validators

| Decorator | Purpose | Example |
|-----------|---------|---------|
| `@IsString()` | Must be string | `"hello"` ✅, `123` ❌ |
| `@IsNumber()` | Must be number | `123` ✅, `"123"` ❌ |
| `@IsEmail()` | Must be valid email | `user@domain.com` ✅ |
| `@IsNotEmpty()` | Cannot be empty | `""` ❌, `"text"` ✅ |
| `@IsOptional()` | Field is optional | Can be omitted |
| `@MinLength(n)` | Min string length | `@MinLength(8)` |
| `@MaxLength(n)` | Max string length | `@MaxLength(50)` |
| `@Min(n)` | Min number value | `@Min(0)` |
| `@Max(n)` | Max number value | `@Max(100)` |
| `@IsEnum(enum)` | Must be enum value | `@IsEnum(Role)` |

---

## TypeScript Concepts Summary

### 1. **Type Annotations**
```typescript
email: string  // Property type
```

### 2. **Optional Properties**
```typescript
firstName?: string  // May or may not exist
```

### 3. **Union Types**
```typescript
firstName: string | null  // Either string or null
```

### 4. **Decorators**
```typescript
@IsEmail()  // Adds validation behavior
```

### 5. **Classes**
```typescript
export class RegisterDto { }  // Object blueprint
```

### 6. **Imports/Exports**
```typescript
export class ...  // Make available to other files
import { ... } from '...'  // Use from other files
```

---

## Testing DTOs

### Valid Data
```typescript
const validDto = {
  email: "user@example.com",
  password: "securePass123",
  firstName: "John",
  lastName: "Doe"
};
// ✅ Passes all validations
```

### Invalid Data
```typescript
const invalidDto = {
  email: "notanemail",      // ❌ Not an email
  password: "short",         // ❌ Less than 8 chars
};
// Returns validation errors
```

---

## Next: Auth Service

Now that we have DTOs defining our data structure, we'll build the **Auth Service** that:
- Receives validated DTOs
- Implements business logic
- Interacts with the database

[Continue to Auth Service →](./02-auth-service.md)

---

*[← Back to Auth Module Overview](./README.md)*

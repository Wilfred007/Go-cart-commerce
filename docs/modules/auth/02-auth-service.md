# Auth Module - Part 2: Auth Service

## What is a Service?

**Service** = Contains business logic and data operations

**Real-world analogy**: 
- **Controller** = Restaurant waiter (takes orders, serves food)
- **Service** = Restaurant chef (prepares the food)
- **Database** = Restaurant storage (ingredients)

The service is where the actual work happens!

---

## Step 1: Create Auth Service Class

### File: `auth.service.ts`

```typescript
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt'
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;
    
    constructor( 
        private prisma: PrismaService, 
        private jwtService: JwtService,
    ){}
    
    // Methods will go here...
}
```

### Breaking It Down:

#### 1. **Imports**
```typescript
import { ConflictException, Injectable } from '@nestjs/common';
```
- `Injectable` = Decorator that marks class as a service
- `ConflictException` = HTTP 409 error for duplicate resources

```typescript
import { PrismaService } from 'src/prisma/prisma.service';
```
- Import our database service
- Will use to query/create users

```typescript
import * as bcrypt from 'bcrypt'
```
- `bcrypt` = Library for hashing passwords
- `* as bcrypt` = Import entire module as `bcrypt` object

**TypeScript Concept - Namespace Import**:
```typescript
import * as name from 'module'  // Import everything
import { specific } from 'module'  // Import specific exports
```

```typescript
import { randomBytes } from 'crypto';
```
- Node.js built-in crypto module
- `randomBytes()` generates random data for refresh tokens

#### 2. **@Injectable() Decorator**
```typescript
@Injectable()
export class AuthService {
```
- Marks class as a **provider** that can be injected
- Allows NestJS to manage dependencies
- Enables dependency injection in constructor

**What it does**:
- Makes this service available for injection in other classes
- Tells NestJS: "Manage this class's lifecycle"

#### 3. **Class Constants**
```typescript
private readonly SALT_ROUNDS = 12;
```

**TypeScript Concepts**:
- `private` = Only accessible inside this class
- `readonly` = Cannot be changed after initialization
- `SALT_ROUNDS` = Convention: UPPERCASE for constants
- `= 12` = Number of hashing rounds (more = slower but more secure)

**What is a Salt Round?**:
- Bcrypt hashes password multiple times
- 12 rounds = Hash it 2^12 (4,096) times
- Protects against brute-force attacks

#### 4. **Constructor with Dependency Injection**
```typescript
constructor( 
    private prisma: PrismaService, 
    private jwtService: JwtService,
){}
```

**TypeScript Concept - Parameter Properties**:
```typescript
constructor(private prisma: PrismaService)
```
This shorthand does TWO things:
1. Declares a class property: `this.prisma`
2. Assigns the injected value automatically

**Equivalent long form**:
```typescript
private prisma: PrismaService;

constructor(prismaService: PrismaService) {
    this.prisma = prismaService;
}
```

**Dependencies**:
- `PrismaService` = Database access
- `JwtService` = Create JWT tokens

---

## Step 2: Implement Register Method

```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDTO> {
    // 1. Destructure input
    const { email, password, firstName, lastName} = registerDto;

    // 2. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
        where: { email },
    });

    if(existingUser){
        throw new ConflictException("User with this email already exists")
    }

    try {
        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)
        
        // 4. Create user
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                password: false
            }
        });

        // 5. Generate tokens
        const tokens = await this.generateTokens(user.id, user.email);
        
        // 6. Return response
        return {
            ...tokens,
            user
        };
        
    } catch (error) {
        throw error;
    }
}
```

### Breaking It Down:

#### 1. **Method Signature**
```typescript
async register(registerDto: RegisterDto): Promise<AuthResponseDTO>
```

**TypeScript Concepts**:
- `async` = Function returns a Promise
- `registerDto: RegisterDto` = Parameter with type
- `: Promise<AuthResponseDTO>` = Return type

**Why `async`?**:
- Database operations are asynchronous
- Use `await` inside the function
- Automatically wraps return value in Promise

#### 2. **Destructuring**
```typescript
const { email, password, firstName, lastName} = registerDto;
```

**TypeScript Concept - Object Destructuring**:
```typescript
// Instead of:
const email = registerDto.email;
const password = registerDto.password;

// We write:
const { email, password } = registerDto;
```

#### 3. **Check Existing User**
```typescript
const existingUser = await this.prisma.user.findUnique({
    where: { email },
});
```

**Key Points**:
- `await` = Wait for database query to complete
- `findUnique()` = Prisma method to find one record
- `where: { email }` = Query condition

**Object Shorthand**:
```typescript
where: { email }
// Same as:
where: { email: email }
```

**Why check?**:
- Prevent duplicate email addresses
- Email is marked `@unique` in Prisma schema

#### 4. **Throw Exception**
```typescript
if(existingUser){
    throw new ConflictException("User with this email already exists")
}
```

**What happens**:
- `throw` = Stop execution and return error
- `ConflictException` = HTTP 409 status code
- NestJS automatically formats error response:
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

#### 5. **Hash Password**
```typescript
const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS)
```

**What it does**:
- Converts: `"myPassword123"` → `"$2b$12$KIXv..."`
- One-way encryption (cannot be reversed)
- Same password = different hash each time

**Example**:
```typescript
await bcrypt.hash("password123", 12)
// Result: "$2b$12$AbCd...XyZ"

await bcrypt.hash("password123", 12)
// Result: "$2b$12$DeFg...WvU"  // Different!
```

#### 6. **Create User**
```typescript
const user = await this.prisma.user.create({
    data: {
        email,
        password: hashedPassword,
        firstName,
        lastName
    },
    select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        password: false  // ⚠️ Don't return password!
    }
});
```

**Prisma create() options**:
- `data:` = What to insert into database
- `select:` = Which fields to return

**Why `password: false`?**:
- Never send password hash back to client
- Even hashed passwords shouldn't be exposed
- Security best practice

#### 7. **Generate Tokens**
```typescript
const tokens = await this.generateTokens(user.id, user.email);
```
- Calls private helper method (we'll write next)
- Returns `{ accessToken, refreshToken }`

#### 8. **Return Response**
```typescript
return {
    ...tokens,
    user
};
```

**TypeScript Concept - Spread Operator**:
```typescript
...tokens
// Spreads object properties

// If tokens = { accessToken: "...", refreshToken: "..." }
// Then {...tokens} expands to:
{
  accessToken: "...",
  refreshToken: "..."
}
```

**Final return value**:
```typescript
{
  accessToken: "...",
  refreshToken: "...",
  user: {
    id: "...",
    email: "...",
    firstName: "...",
    lastName: "...",
    role: "USER"
  }
}
```

---

## Step 3: Implement Token Generation

```typescript
private async generateTokens(
    userId: string,
    email: string,
): Promise<{accessToken: string; refreshToken: string}> {
    // 1. Create JWT payload
    const payload = { sub: userId, email };

    // 2. Generate unique refresh ID
    const refreshId = randomBytes(16).toString('hex');
    
    // 3. Sign tokens
    const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {
            expiresIn: '15m'  // Access token: 15 minutes
        }),
        this.jwtService.signAsync(
            { ...payload, jti: refreshId },
            { expiresIn: '7d' }  // Refresh token: 7 days
        )
    ]);
    
    // 4. Return tokens
    return {
        accessToken,
        refreshToken
    };
}
```

### Breaking It Down:

#### 1. **Private Helper Method**
```typescript
private async generateTokens(...)
```
- `private` = Only used inside this class
- Not exposed to controllers or other services

#### 2. **Return Type**
```typescript
: Promise<{accessToken: string; refreshToken: string}>
```
**TypeScript Concept - Inline Object Type**:
- Promises an object with two string properties
- More specific than just `Promise<object>`

#### 3. **JWT Payload**
```typescript
const payload = { sub: userId, email };
```
- `sub` = Standard JWT claim for "subject" (user ID)
- `email` = Custom claim for user's email

**JWT Structure**:
```
{
  "sub": "user-uuid-123",
  "email": "user@example.com",
  "iat": 1234567890,  // Issued at (auto-added)
  "exp": 1234568790   // Expires (auto-added)
}
```

#### 4. **Random Refresh ID**
```typescript
const refreshId = randomBytes(16).toString('hex');
```
- `randomBytes(16)` = 16 random bytes
- `.toString('hex')` = Convert to hexadecimal string
- Example: `"a3f7b2c9e1d4f6a8b5c7e9f1a3b5c7d9"`

**Why?**:
- Makes refresh token unique
- Can track/revoke individual tokens
- Adds extra security layer

#### 5. **Promise.all()**
```typescript
const [accessToken, refreshToken] = await Promise.all([...])
```

**TypeScript Concept - Array Destructuring**:
```typescript
const [first, second] = [value1, value2]
// first = value1
// second = value2
```

**Why Promise.all()?**:
- Runs both `signAsync()` calls in parallel
- Faster than running sequentially
- Returns array of results

**Equivalent sequential code**:
```typescript
const accessToken = await this.jwtService.signAsync(...);
const refreshToken = await this.jwtService.signAsync(...);
```

#### 6. **Sign Tokens**
```typescript
this.jwtService.signAsync(payload, {
    expiresIn: '15m'
})
```
- `signAsync()` = Create JWT token
- `payload` = Data to encode
- `expiresIn` = How long token is valid

**Token Lifetimes**:
- **Access Token**: Short-lived (15 minutes)
  - Used for API requests
  - Expires quickly for security
  
- **Refresh Token**: Long-lived (7 days)
  - Used to get new access tokens
  - Stored securely on client

#### 7. **Spread in Refresh Token**
```typescript
{ ...payload, jti: refreshId }
```
Expands to:
```typescript
{
  sub: userId,
  email: email,
  jti: refreshId  // JWT ID (unique identifier)
}
```

---

## Complete Auth Service

```typescript
import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDTO } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    private readonly SALT_ROUNDS = 12;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto): Promise<AuthResponseDTO> {
        const { email, password, firstName, lastName } = registerDto;

        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        try {
            const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    firstName,
                    lastName,
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    password: false,
                },
            });

            const tokens = await this.generateTokens(user.id, user.email);

            return {
                ...tokens,
                user,
            };
        } catch (error) {
            throw error;
        }
    }

    private async generateTokens(
        userId: string,
        email: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const payload = { sub: userId, email };
        const refreshId = randomBytes(16).toString('hex');

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: '15m',
            }),
            this.jwtService.signAsync(
                { ...payload, jti: refreshId },
                { expiresIn: '7d' },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
```

---

## TypeScript Concepts Summary

| Concept | Example | Purpose |
|---------|---------|---------|
| **Async/Await** | `async register()` | Handle promises cleanly |
| **Type Annotations** | `: Promise<AuthResponseDTO>` | Define return types |
| **Destructuring** | `const { email } = dto` | Extract object properties |
| **Spread Operator** | `...tokens` | Expand object/array |
| **Access Modifiers** | `private`, `readonly` | Control access |
| **Parameter Properties** | `constructor(private prisma)` | Shorthand property declaration |
| **Object Shorthand** | `{ email }` | Same as `{ email: email }` |
| **Promise.all()** | Parallel async operations | Run multiple promises together |
| **Array Destructuring** | `const [a, b] = array` | Extract array values |

---

## Security Best Practices Applied

✅ **Password Hashing**: Never store plain text passwords
✅ **Salt Rounds**: Use 12+ rounds for security
✅ **Don't Return Passwords**: `password: false` in select
✅ **Unique Email Check**: Prevent duplicates
✅ **Token Expiration**: Short-lived access tokens
✅ **Error Handling**: Proper exception throwing

---

## Next: Auth Controller

Now that we have the service logic, we'll create the **Auth Controller** to:
- Expose HTTP endpoints
- Handle requests/responses
- Call service methods

[Continue to Auth Controller →](./03-auth-controller.md)

---

*[← Back to Auth Module Overview](./README.md)*

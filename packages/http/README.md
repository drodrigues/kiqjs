# @kiqjs/http

> HTTP integration for KiqJS - REST API decorators for Node.js/TypeScript

## Overview

`@kiqjs/http` provides decorators for building REST APIs with **KiqJS** and **Koa**. It enables you to create HTTP endpoints using annotations like `@RestController`, `@GetMapping`, `@PostMapping`, etc.

## Features

- **Decorator-based routing** - Clean, declarative API for defining routes
- **Automatic route registration** - No manual router configuration needed
- **Type-safe parameter extraction** - `@PathVariable`, `@RequestBody`, `@RequestParam`
- **DTO validation** - Automatic request validation with `class-validator` decorators
- **Route-level security** - `@Security` decorator for access control
- **Dependency injection** - Seamless integration with `@kiqjs/core`
- **Koa integration** - Built on top of Koa and @koa/router
- **Security by default** - Helmet middleware enabled by default for secure HTTP headers
- **Built-in error handling** - Automatic error responses
- **Request logging** - Optional request/response logging

## Installation

```bash
npm install @kiqjs/http @kiqjs/core
# or
pnpm add @kiqjs/http @kiqjs/core
```

> **Note:** All necessary HTTP server dependencies (Koa, Router, Body Parser) are included automatically. You don't need to install them separately.

## Quick Start

```typescript
import { Service, KiqApplication } from '@kiqjs/core';
import {
  RestController,
  GetMapping,
  PostMapping,
  PathVariable,
  RequestBody,
  KoaApplication,
} from '@kiqjs/http';

// Domain model
interface User {
  id: string;
  name: string;
  email: string;
}

// Repository
@Service()
class UserRepository {
  private users = new Map<string, User>();

  findById(id: string) {
    return this.users.get(id);
  }

  save(user: User) {
    this.users.set(user.id, user);
    return user;
  }
}

// Service
@Service()
class UserService {
  constructor(private userRepository: UserRepository) {}

  getUser(id: string) {
    return this.userRepository.findById(id);
  }

  createUser(name: string, email: string) {
    const user = { id: Math.random().toString(36), name, email };
    return this.userRepository.save(user);
  }
}

// Controller
@RestController('/api/users')
class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('/:id')
  getUser(@PathVariable('id') id: string) {
    return this.userService.getUser(id);
  }

  @PostMapping()
  createUser(@RequestBody() body: { name: string; email: string }) {
    return this.userService.createUser(body.name, body.email);
  }
}

// Application
@KiqApplication()
class MyApp {
  async run() {
    const app = new KiqHttpApplication(MyApp, {
      port: 3000,
      logging: true,
    });
    await app.start();
  }
}

new MyApp().run();
```

## Decorators

### Controller Decorators

#### `@RestController(path?: string)`

Marks a class as a REST controller. Automatically registers it as a `@Controller` component.

```typescript
@RestController('/api/users')
class UserController {
  // Routes will be prefixed with /api/users
}
```

#### `@RequestMapping(path: string, method?: HttpMethod)`

Maps HTTP requests to handler methods (can be used at class or method level).

```typescript
@RestController()
class MyController {
  @RequestMapping('/custom', 'GET')
  customRoute() {
    return { message: 'Hello' };
  }
}
```

### HTTP Method Decorators

#### `@GetMapping(path?: string)`

Maps GET requests to the handler method.

```typescript
@GetMapping('/:id')
getUser(@PathVariable('id') id: string) {
  return { id, name: 'John' };
}
```

#### `@PostMapping(path?: string)`

Maps POST requests to the handler method.

```typescript
@PostMapping()
createUser(@RequestBody() user: CreateUserDto) {
  return this.userService.create(user);
}
```

#### `@PutMapping(path?: string)`

Maps PUT requests to the handler method.

```typescript
@PutMapping('/:id')
updateUser(@PathVariable('id') id: string, @RequestBody() data: any) {
  return this.userService.update(id, data);
}
```

#### `@DeleteMapping(path?: string)`

Maps DELETE requests to the handler method.

```typescript
@DeleteMapping('/:id')
deleteUser(@PathVariable('id') id: string) {
  this.userService.delete(id);
  return { message: 'Deleted' };
}
```

#### `@PatchMapping(path?: string)`

Maps PATCH requests to the handler method.

### Parameter Decorators

#### `@PathVariable(name: string)`

Extracts a path parameter from the URL (like `{id}` in Spring).

```typescript
@GetMapping('/users/:id')
getUser(@PathVariable('id') id: string) {
  // id = '123' from URL /users/123
}
```

#### `@RequestBody()`

Extracts the request body (requires `koa-bodyparser`).

```typescript
@PostMapping()
createUser(@RequestBody() user: CreateUserDto) {
  // user = parsed JSON body
}
```

#### `@RequestParam(name: string, required?: boolean)`

Extracts a query parameter.

```typescript
@GetMapping()
search(@RequestParam('query') query: string, @RequestParam('page', false) page?: number) {
  // query = 'test' from URL ?query=test
  // page = 1 from URL ?page=1 (optional)
}
```

#### `@RequestHeader(name: string, required?: boolean)`

Extracts a request header.

```typescript
@GetMapping()
getProfile(@RequestHeader('Authorization') token: string) {
  // token = value of Authorization header
}
```

#### `@Context()`

Injects the Koa context object.

```typescript
@GetMapping()
handle(@Context() ctx: Koa.Context) {
  ctx.status = 201;
  ctx.body = { message: 'Created' };
}
```

#### `@Request()` and `@Response()`

Injects Koa request/response objects.

```typescript
@GetMapping()
handle(@Request() req: Koa.Request, @Response() res: Koa.Response) {
  res.status = 200;
}
```

## Security with Helmet

`@kiqjs/http` includes **Helmet** middleware by default to help secure your application by setting various HTTP headers.

### Default Security Headers

When you create a `KiqHttpApplication`, these security headers are automatically added:

- `Content-Security-Policy` - Helps prevent XSS attacks
- `Strict-Transport-Security` - Enforces HTTPS
- `X-Content-Type-Options` - Prevents MIME sniffing
- `X-Frame-Options` - Prevents clickjacking
- `X-XSS-Protection` - Additional XSS protection
- And many more...

### Configuring Helmet

#### Via YAML Configuration

```yaml
# resources/application.yml
server:
  port: 3000
  helmet:
    enabled: true
    options:
      contentSecurityPolicy:
        directives:
          defaultSrc: ["'self'"]
          styleSrc: ["'self'", "'unsafe-inline'"]
```

#### Via Code

```typescript
const app = new KiqHttpApplication(MyApp, {
  helmet: true,
  helmetOptions: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  },
});
```

### Disabling Helmet

If you need to disable Helmet (not recommended for production):

```typescript
const app = new KiqHttpApplication(MyApp, {
  helmet: false,
});
```

Or via YAML:

```yaml
server:
  helmet:
    enabled: false
```

For more information on Helmet configuration options, see the [Helmet documentation](https://helmetjs.github.io/).

## Automatic Server Configuration

`@kiqjs/http` automatically reads server configuration from your YAML files. No manual configuration needed!

### Configuration File

```yaml
# resources/application.yml
server:
  port: 3000
  host: localhost
  prefix: /api
```

### Application Bootstrap

```typescript
@KiqApplication()
class MyApp {
  async run() {
    // Configuration is read automatically from resources/application.yml
    const app = new KiqHttpApplication(MyApp, {
      logging: true,
      errorHandler: true,
      bodyParser: true,
    });

    await app.start(); // Uses port, host, and prefix from YAML
  }
}
```

### Configuration Priority

1. Parameters passed to `start()` method (highest priority)
2. Options passed to constructor
3. YAML configuration (`server.port`, `server.host`, `server.prefix`)
4. Default values (port: 3000, host: 'localhost', prefix: '')

### Override at Runtime

```typescript
// Override specific values
const app = new KiqHttpApplication(MyApp, {
  port: 8080,  // Override YAML port
});

// Or override when starting
await app.start(4000); // Override both constructor and YAML
```

## KiqHttpApplication

The `KiqHttpApplication` class provides a simple way to bootstrap your application.

```typescript
const app = new KiqHttpApplication(MyAppClass, {
  port: 3000,                    // Optional: override YAML config
  host: 'localhost',             // Optional: override YAML config
  bodyParser: true,              // Enable body parser (default: true)
  errorHandler: true,            // Enable error handler (default: true)
  logging: true,                 // Enable request logging (default: false)
  helmet: true,                  // Enable Helmet security headers (default: true)
  helmetOptions: {},             // Helmet configuration (optional)
  prefix: '/api/v1',             // Optional: override YAML config
  middlewares: [/* custom */],   // Custom middlewares (optional)
});

await app.start();
```

### Methods

- `getKoaApp()` - Returns the Koa instance
- `getRouter()` - Returns the Router instance
- `getContainer()` - Returns the KiqJS container
- `use(middleware)` - Adds a custom middleware
- `start(port?, host?)` - Starts the server (optional port and host override all configurations)

## DTO Validation

Automatic request validation using `class-validator` decorators:

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { RestController, PostMapping, RequestBody, Valid } from '@kiqjs/http';

// Define your DTO with validation rules
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

@RestController('/api/users')
export class UserController {
  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    // dto is automatically validated
    // If validation fails, returns 400 with detailed error messages
    return this.userService.create(dto);
  }
}
```

### Validation Configuration

Configure validation options in `resources/application.yml`:

```yaml
kiq:
  validator:
    skipMissingProperties: false
    whitelist: true              # Strip properties not in DTO
    forbidNonWhitelisted: true   # Reject extra properties
    forbidUnknownValues: true    # Reject unknown types
```

For more validation decorators, see [class-validator documentation](https://github.com/typestack/class-validator).

## Route-Level Security

Control access to routes using the `@Security` decorator:

```typescript
import { RestController, GetMapping, PostMapping, Security } from '@kiqjs/http';

@RestController('/api/users')
export class UserController {
  // Public endpoint - no authentication required
  @GetMapping('/profile/:id')
  getPublicProfile(@PathVariable('id') id: string) {
    return this.userService.getPublicProfile(id);
  }

  // Protected endpoint - authentication required
  @GetMapping('/me')
  @Security()
  getCurrentUser() {
    return this.userService.getCurrentUser();
  }

  // Protected endpoint - authentication required
  @PostMapping()
  @Security()
  createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

### Public URL Configuration

Configure public URLs (that bypass authentication) in `resources/application.yml`:

```yaml
server:
  security:
    public:
      - /api/health              # Exact match
      - /api/public/*            # Wildcard match
      - /api/users/*/profile     # Segment wildcard
```

**Pattern Types:**
- **Exact match**: `/api/health` - Matches only this exact path
- **Wildcard**: `/api/public/*` - Matches any path starting with `/api/public/`
- **Segment wildcard**: `/api/users/*/profile` - Matches `/api/users/123/profile`, `/api/users/abc/profile`, etc.

**Important:** The `@Security` decorator marks routes that require authentication, but it **does not implement authentication**. You need to implement your own authentication middleware (JWT, sessions, etc.) and integrate it with the security system.

### Example: Implementing JWT Authentication

```typescript
import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

// Custom authentication middleware
export async function jwtAuthMiddleware(ctx: Context, next: Next) {
  // Skip authentication for public URLs (already handled by @Security)
  const token = ctx.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ctx.state.user = decoded;
    } catch (error) {
      ctx.throw(401, 'Invalid token');
    }
  }

  await next();
}

// Add to your application
const app = new KiqHttpApplication(MyApp, {
  middlewares: [jwtAuthMiddleware],
});
```

## Error Handling

Errors thrown in controllers are automatically caught and formatted:

```typescript
@GetMapping('/:id')
getUser(@PathVariable('id') id: string) {
  if (!user) {
    throw new Error('User not found');  // Returns 500 with error message
  }
  return user;
}
```

For custom HTTP status codes, use the `KiqError` class:

```typescript
import { KiqError } from '@kiqjs/http';

@GetMapping('/:id')
getUser(@PathVariable('id') id: string) {
  const user = this.userService.findById(id);
  if (!user) {
    throw new KiqError('User not found', 404);
  }
  return user;
}
```

## Security Considerations

This package includes comprehensive security tests documenting potential vulnerabilities. See [`test/security-*.test.ts`](./test) for details.

**Known Security Issues:**
1. **Prototype Pollution** - Configuration merging doesn't filter dangerous keys
2. **URL Pattern Matching** - Pattern `/posts*` matches `/postsecret` (too broad)
3. **No Authentication Verification** - `@Security` decorator only checks URL patterns, doesn't verify actual authentication
4. **Input Validation** - Validation is optional (easy to forget `@Valid` decorator)
5. **Information Disclosure** - Stack traces and sensitive data may be exposed in errors

**Recommendations:**
- Always use `@Valid()` decorator with `@RequestBody()` for input validation
- Configure strict validator options (`forbidNonWhitelisted: true`)
- Implement proper authentication middleware with JWT or sessions
- Use environment-specific error handling (hide stack traces in production)
- Review and test public URL patterns carefully
- Implement rate limiting and request size limits
- Use HTTPS in production

For detailed security analysis, see the test files:
- `test/security-configuration.test.ts` - Configuration security
- `test/security-authentication.test.ts` - Authentication bypass vulnerabilities
- `test/security-injection.test.ts` - Injection vulnerabilities
- `test/security-validation.test.ts` - Validation bypass
- `test/security-disclosure.test.ts` - Information disclosure
- `test/security-dos.test.ts` - Denial of Service vulnerabilities

## Example

See the complete example at [`examples/thread-architecture`](../../examples/thread-architecture).

## License

MIT

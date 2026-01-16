# THREAD Architecture Example

**Domain-Driven, Product-Oriented, and Execution-Focused Software Architecture**

This example demonstrates how to implement **THREAD Architecture** using **KiqJS** with decorators, YAML configuration, profile-based activation, and resource loading.

## Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Test the API
curl http://localhost:3000/api/users
```

The example includes a complete user management feature with:

- RESTful endpoints (`@RestController`, `@GetMapping`, `@PostMapping`, etc.)
- DTO validation with `@Valid()` and class-validator
- Domain-driven design with pure entities
- Event publishing and profile-based logging
- YAML configuration with `@Value()` injection
- Resource loading (email templates)
- Type-safe error handling with Result pattern

## What is THREAD Architecture?

THREAD Architecture is an architectural pattern that prioritizes:

- **Explicit Domain in Code** - Clear and isolated business rules
- **Vertical Delivery** - Complete features from start to finish
- **Events as Language** - Decoupled communication
- **Clear Names** - Obvious responsibility of each file
- **One Reason to Change** - Single Responsibility Principle in practice

## Project Structure

```
thread-architecture/
├── resources/                              # Resources folder
│   ├── application.yml                     # Base configuration
│   ├── application-development.yml         # Dev profile config
│   ├── application-production.yml          # Prod profile config (optional)
│   └── templates/                          # Email templates
│       └── welcome-email.html
├── src/
│   ├── Application.ts                      # Entry point with KiqHttpApplication
│   ├── config/
│   │   └── AppConfig.ts                    # Configuration class with @Value and @Bean
│   ├── core/
│   │   └── DomainEvent.ts                  # Base domain event interface
│   ├── domains/                            # Pure domain layer
│   │   ├── User.ts                         # User entity with business rules
│   │   └── UserRepository.ts               # In-memory repository implementation
│   └── features/
│       └── user/                           # Vertical feature slice
│           ├── UserDto.ts                  # Data transfer objects with validation
│           ├── UserService.ts              # Business orchestration layer
│           ├── UserHttpController.ts       # HTTP endpoints with REST decorators
│           ├── UserEventPublisher.ts       # Event publishing
│           ├── UserCreatedEvent.ts         # User created domain event
│           ├── UserUpdatedEvent.ts         # User updated domain event
│           ├── UserLogger.ts               # Profile-based loggers
│           └── TemplateService.ts          # Resource loading example
├── package.json
└── tsconfig.json
```

## KiqJS Features Demonstrated

### 1. Dependency Injection

```typescript
@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userEventPublisher: UserEventPublisher
  ) {}
}
```

### 2. YAML Configuration

```yaml
# resources/application.yml
spring:
  profiles:
    active: development

server:
  port: 3000
  host: localhost
  prefix: /api

app:
  name: THREAD Architecture Example
  version: 1.0.0

features:
  userManagement:
    enabled: true
    maxUsers: 1000
```

Inject values with `@Value`:

```typescript
@Configuration()
export class AppConfig {
  @Value('server.port')
  serverPort!: number;

  @Value('app.name')
  appName!: string;
}
```

### 3. Profile-based Component Activation

```typescript
// Active only in development
@Service()
@Profile('development')
export class DevelopmentUserLogger implements UserLogger {
  logUserCreated(userId: string, name: string) {
    console.log(`[DEV] User created: ${userId}, ${name}`);
  }
}

// Active only in production
@Service()
@Profile('production')
export class ProductionUserLogger implements UserLogger {
  logUserCreated(userId: string, name: string) {
    // Send to monitoring service
  }
}

// Active in all profiles except production
@Service()
@Profile('!production')
export class DebugUserLogger {
  logDebugInfo(message: string, data?: any) {
    console.log(`[DEBUG] ${message}`, data);
  }
}
```

### 4. Resource Loading

```typescript
@Service()
export class TemplateService {
  private resourceLoader = new ResourceLoader();

  renderWelcomeEmail(username: string, email: string) {
    // Load template from resources/templates/
    const template = this.resourceLoader.getResourceAsString('templates/welcome-email.html');
    return template.replace('{{username}}', username).replace('{{email}}', email);
  }
}
```

### 5. REST Controllers

```typescript
@RestController('/users')
export class UserHttpController {
  constructor(
    private readonly userService: UserService,
    private readonly templateService: TemplateService
  ) {}

  @GetMapping()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @GetMapping('/:id/welcome-email')
  async getWelcomeEmail(@PathVariable('id') id: string) {
    const user = await this.userService.getUserById(id);
    const html = this.templateService.renderWelcomeEmail(user.name, user.email);
    return { subject: 'Welcome!', html };
  }
}
```

### 6. DTO Validation

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;

  @IsEmail()
  email!: string;
}
```

## Layers and Responsibilities

### `domains/` - Domain Layer

Contains **entities**, **value objects**, **invariant rules**, and **repository implementations**.

The domain layer includes:

- **Domain entities** with business logic (User.ts)
- **Repository implementations** for data access (UserRepository.ts)

```typescript
// domains/User.ts
export class User {
  activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('Only pending users can be activated');
    }
    return new User(this.id, this.name, this.email, UserStatus.ACTIVE, this.createdAt);
  }

  deactivate(): User {
    if (this.status !== UserStatus.ACTIVE) {
      throw new Error('Only active users can be deactivated');
    }
    return new User(this.id, this.name, this.email, UserStatus.INACTIVE, this.createdAt);
  }
}
```

```typescript
// domains/UserRepository.ts
@Service()
export class UserRepository {
  private users = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }
}
```

### `features/<feature>/` - Vertical Feature Slices

Each **feature** is a **complete vertical slice** containing:

- **HTTP Controller** - REST endpoints with decorators
- **Service** - Business orchestration and coordination
- **DTOs** - Data transfer objects with validation
- **Events** - Domain events for communication
- **Event Publisher** - Event publishing logic
- **Profile-based components** - Environment-specific implementations

```typescript
// features/user/UserHttpController.ts
@RestController('/users')
export class UserHttpController {
  constructor(
    private readonly userService: UserService,
    private readonly templateService: TemplateService
  ) {}

  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    const result = await this.userService.createUser(dto);
    if (!result.success) {
      throw BadRequest(result.error);
    }
    return toResponse(result.data);
  }

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string) {
    // ...
  }
}
```

### `config/` - Explicit Configuration

Infrastructure configuration and feature flags.

```typescript
// config/AppConfig.ts
@Configuration()
export class AppConfig {
  @Value('server.port')
  serverPort!: number;

  @Bean()
  serverConfig() {
    return {
      port: this.serverPort,
      host: this.serverHost,
      prefix: this.serverPrefix,
    };
  }

  @Bean()
  featureFlags() {
    return {
      userManagement: {
        enabled: this.userManagementEnabled,
        maxUsers: this.maxUsers,
      },
    };
  }
}
```

### `resources/` - Non-Code Assets

Resources folder for:

- YAML configuration files
- Email templates
- Static files
- Seed data

## Request Flow

```
HTTP Request
    ↓
UserHttpController        ← HTTP Entry (features/user/)
    ↓  (validates DTO with @Valid)
    ↓
UserService               ← Orchestration + Business Logic (features/user/)
    ↓
User (Domain)             ← Domain Rules & Validations (domains/)
    ↓
UserRepository            ← Persistence (domains/)
    ↓
UserEventPublisher        ← Event Publishing (features/user/)
    ↓  (publishes UserCreatedEvent, UserUpdatedEvent)
    ↓
UserLogger                ← Profile-based logging (features/user/)
    ↓
Console/External Service (depending on active profile)
```

## Naming Convention

All files follow **PascalCase** with suffix indicating responsibility:

- `UserHttpController.ts` - HTTP controller
- `UserService.ts` - Application service
- `UserRepository.ts` - Data layer
- `UserCreatedEvent.ts` - Domain event
- `UserEventPublisher.ts` - Event publisher
- `UserDto.ts` - Data transfer objects
- `UserLogger.ts` - Logging implementations

## How to Run

### Development Mode

```bash
# From the monorepo root or example directory
pnpm install

# Run in development mode (default profile: development)
pnpm dev
```

The server will start at `http://localhost:3000` with:

- Hot reload enabled (nodemon + ts-node)
- Development logger active
- Debug utilities enabled

### Production Mode

```bash
# Build TypeScript to JavaScript
pnpm build

# Run with production profile
KIQJS_PROFILES_ACTIVE=production node dist/Application.js
```

Or configure the active profile in `resources/application.yml`:

```yaml
spring:
  profiles:
    active: production
```

Environment variables take precedence over YAML configuration.

## Available Endpoints

### List Users

```bash
curl http://localhost:3000/api/users
```

### Filter by Status

```bash
curl "http://localhost:3000/api/users?status=ACTIVE"
```

### Get User by ID

```bash
curl http://localhost:3000/api/users/1
```

### Create User

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Bob Wilson", "email": "bob@example.com"}'
```

### Update User

```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'
```

### Activate User

```bash
curl -X PATCH http://localhost:3000/api/users/2/activate
```

### Deactivate User

```bash
curl -X PATCH http://localhost:3000/api/users/1/deactivate
```

### Delete User

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### Get Welcome Email (Resource Loading Demo)

```bash
curl http://localhost:3000/api/users/1/welcome-email
```

This endpoint demonstrates:

- Resource loading from `resources/templates/`
- Template rendering
- Integration with domain entities

## Principles Applied

### 1. Domain Above Framework

Domain entities are pure TypeScript classes without framework dependencies:

```typescript
// Good: Pure domain entity
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly status: UserStatus,
    public readonly createdAt: Date
  ) {}

  activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('Only pending users can be activated');
    }
    return new User(this.id, this.name, this.email, UserStatus.ACTIVE, this.createdAt);
  }
}

// Bad: Domain coupled to framework
class User extends FrameworkModel {
  @Column() name!: string;
}
```

### 2. Vertical Delivery Always

Each feature is **self-contained** with all necessary components:

```
features/user/
├── UserHttpController.ts    # HTTP layer
├── UserService.ts            # Business layer
├── UserDto.ts                # Data contracts
├── UserEventPublisher.ts     # Event communication
├── UserCreatedEvent.ts       # Domain events
├── UserUpdatedEvent.ts       # Domain events
├── UserLogger.ts             # Observability
└── TemplateService.ts        # Feature utilities
```

The domain layer (repository and entities) lives separately in `domains/` to ensure domain isolation.

### 3. Single Responsibility

Each file has **one clear responsibility**:

| File                    | Responsibility                 |
| ----------------------- | ------------------------------ |
| `UserHttpController.ts` | HTTP request/response handling |
| `UserService.ts`        | Business logic orchestration   |
| `UserRepository.ts`     | Data persistence               |
| `UserEventPublisher.ts` | Event publishing               |
| `UserLogger.ts`         | Logging implementation         |
| `TemplateService.ts`    | Template rendering             |
| `User.ts`               | Domain entity and rules        |
| `UserDto.ts`            | Data transfer and validation   |

### 4. Events as Language

Communication between components happens through well-defined domain events:

```typescript
// Service orchestrates and publishes events
@Service()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userEventPublisher: UserEventPublisher
  ) {}

  async createUser(dto: CreateUserDto): Promise<Result<User, string>> {
    const user = new User(/* ... */);
    await this.userRepository.save(user);

    // Publish domain event
    await this.userEventPublisher.publishUserCreated(
      new UserCreatedEvent(user.id, user.name, user.email, user.createdAt)
    );

    return success(user);
  }
}
```

### 5. Names are Contracts

- `UserHttpController` → Obviously handles HTTP
- `UserCreatedEvent` → Obviously a creation event
- `UserRepository` → Obviously persists data

## Benefits of THREAD Architecture

**Clarity** - Any developer understands the structure quickly

**Scalability** - Adding features doesn't affect others

**Testability** - Isolated domain is easy to test

**Maintainability** - Changes are localized

**Fast Onboarding** - Predictable structure

**AI-friendly** - Easy indexing and analysis

## Comparison: Traditional vs. THREAD Architecture

### Traditional Layered Structure

```
src/
├── controllers/
│   ├── UserController.ts
│   ├── OrderController.ts
│   └── ProductController.ts
├── services/
│   ├── UserService.ts
│   ├── OrderService.ts
│   └── ProductService.ts
├── repositories/
│   ├── UserRepository.ts
│   ├── OrderRepository.ts
│   └── ProductRepository.ts
└── models/
    ├── User.ts
    ├── Order.ts
    └── Product.ts
```

**Problems**:

- Features scattered across multiple folders
- Hard to understand feature scope
- Changes require navigating many directories
- Difficult to extract features to microservices

### THREAD Architecture

```
src/
├── domains/
│   ├── User.ts                    # Pure domain entities
│   └── UserRepository.ts          # Persistence abstraction
├── features/
│   ├── user/                      # Everything user-related
│   │   ├── UserHttpController.ts
│   │   ├── UserService.ts
│   │   ├── UserDto.ts
│   │   ├── UserEventPublisher.ts
│   │   ├── UserCreatedEvent.ts
│   │   ├── UserUpdatedEvent.ts
│   │   └── UserLogger.ts
│   └── order/                     # Everything order-related
│       ├── OrderHttpController.ts
│       ├── OrderService.ts
│       └── ...
└── config/
    └── AppConfig.ts               # Cross-cutting configuration
```

**Advantages**:

- Complete feature in one folder
- Easy to understand feature boundaries
- Simple to navigate and maintain
- Ready for microservice extraction
- Clear separation between domain and features

## Configuration Profiles

### Development Profile

```yaml
# resources/application-development.yml
features:
  analytics: true
  debugMode: true

logging:
  level: debug
```

Components active in development:

- `DevelopmentUserLogger` - Verbose logging
- `DebugUserLogger` - Debug utilities

### Production Profile

```yaml
# resources/application-production.yml
server:
  port: 8080
  host: 0.0.0.0

features:
  analytics: false
  debugMode: false

logging:
  level: warn
```

Components active in production:

- `ProductionUserLogger` - Minimal logging, sends to monitoring

## Testing

The architecture makes testing straightforward thanks to dependency injection:

```typescript
describe('UserService', () => {
  it('should create user successfully', async () => {
    // Arrange - Create test doubles
    const mockRepository = new MockUserRepository();
    const mockEventPublisher = new MockUserEventPublisher();
    const service = new UserService(mockRepository, mockEventPublisher);

    // Act
    const result = await service.createUser({
      name: 'Test User',
      email: 'test@example.com',
    });

    // Assert
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Test User');
    expect(mockEventPublisher.publishedEvents).toHaveLength(1);
  });

  it('should fail when email already exists', async () => {
    // Arrange
    const mockRepository = new MockUserRepository();
    await mockRepository.save(
      new User('1', 'Existing', 'test@example.com', UserStatus.ACTIVE, new Date())
    );
    const service = new UserService(mockRepository, new MockUserEventPublisher());

    // Act
    const result = await service.createUser({
      name: 'Test User',
      email: 'test@example.com',
    });

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toContain('already exists');
  });
});

describe('User Domain', () => {
  it('should activate pending user', () => {
    const user = new User('1', 'Test', 'test@example.com', UserStatus.PENDING, new Date());

    const activated = user.activate();

    expect(activated.status).toBe(UserStatus.ACTIVE);
  });

  it('should throw error when activating non-pending user', () => {
    const user = new User('1', 'Test', 'test@example.com', UserStatus.ACTIVE, new Date());

    expect(() => user.activate()).toThrow('Only pending users can be activated');
  });
});
```

## Key Takeaways

1. **Domain Isolation** - Domain entities (`User`) are pure TypeScript classes with no framework dependencies
2. **Vertical Slicing** - Features are organized by business capability, not technical layers
3. **Dependency Injection** - KiqJS automatically wires components using `@Service()`, `@RestController()`, etc.
4. **Profile-based Configuration** - Different implementations for different environments using `@Profile()`
5. **YAML Configuration** - External configuration with `@Value()` decorator injection
6. **Resource Loading** - Load templates and static resources using `ResourceLoader`
7. **DTO Validation** - Automatic request validation with `@Valid()` and class-validator
8. **Result Pattern** - Type-safe error handling with `Result<T, E>` from `@kiqjs/http/dto`
9. **Event-Driven** - Domain events enable loose coupling between components
10. **Testable** - Constructor injection makes unit testing straightforward

## Next Steps for Production

To evolve this example into a production-ready application:

- **Database Integration** - Replace in-memory repository with PostgreSQL, MongoDB, etc.
- **Event Bus** - Integrate Kafka, RabbitMQ, or Redis for real event publishing
- **Authentication** - Add JWT/OAuth with `@Authenticated()` decorator
- **Authorization** - Implement role-based access control
- **Structured Logging** - Use Winston or Pino for production logging
- **Monitoring** - Add Prometheus metrics and APM tracing
- **Testing** - Write unit, integration, and E2E tests
- **CI/CD** - Set up automated builds and deployments
- **Containerization** - Create Docker images and Kubernetes manifests
- **API Documentation** - Generate OpenAPI/Swagger docs from decorators

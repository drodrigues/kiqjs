# THREAD Architecture Example

**Arquitetura de Software Orientada a Domínio, Produto e Execução**

Este exemplo demonstra como implementar a **THREAD Architecture** usando **KiqJS** com decorators, YAML configuration, profile-based activation, e resource loading.

## O que é THREAD Architecture?

A THREAD Architecture é um padrão arquitetural que prioriza:

- **Domínio explícito no código** - Regras de negócio claras e isoladas
- **Entregas verticais** - Features completas do início ao fim
- **Eventos como linguagem** - Comunicação desacoplada
- **Nomes claros** - Responsabilidade óbvia de cada arquivo
- **Uma razão para mudar** - Single Responsibility Principle na prática

## Estrutura do Projeto

```
thread-architecture/
├── resources/                              # Resources folder
│   ├── application.yml                     # Base configuration
│   ├── application-development.yml         # Dev profile config
│   ├── application-production.yml          # Prod profile config
│   └── templates/                          # Email templates
│       └── welcome-email.html
├── src/
│   ├── Application.ts                      # Entry point
│   ├── config/
│   │   └── AppConfig.ts                    # Configuration class with @Bean
│   ├── domains/
│   │   └── User.ts                         # Pure domain entity
│   └── features/
│       └── user/                           # Vertical feature slice
│           ├── UserDto.ts                  # Data transfer objects
│           ├── UserRepository.ts           # Persistence layer
│           ├── UserService.ts              # Business logic
│           ├── UserHttpController.ts       # HTTP endpoints
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
    const template = this.resourceLoader.getResourceAsString(
      'templates/welcome-email.html'
    );
    return template
      .replace('{{username}}', username)
      .replace('{{email}}', email);
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
    const html = this.templateService.renderWelcomeEmail(
      user.name,
      user.email
    );
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

### `domains/` - Pure Business Model

Contains **entities**, **value objects**, and **invariant rules**.

- No framework dependencies
- No database dependencies
- Pure domain logic

```typescript
// domains/User.ts
export class User {
  activate(): User {
    if (this.status !== UserStatus.PENDING) {
      throw new Error('Only pending users can be activated');
    }
    return new User(/* ... */, UserStatus.ACTIVE, /* ... */);
  }
}
```

### `features/<feature>/` - Vertical Feature Slices

Each **feature** is a **complete vertical slice**:

- HTTP Controller → Service → Repository → Events
- One file per responsibility
- File name clearly indicates its function

```typescript
// features/user/UserHttpController.ts
@RestController('/users')
export class UserHttpController {
  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
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
UserHttpController        ← HTTP Entry
    ↓
UserService               ← Orchestration + Business Rules
    ↓
User (Domain)             ← Domain Validations
    ↓
UserRepository            ← Persistence
    ↓
UserEventPublisher        ← Event Publishing
    ↓
Kafka/Redis (future)
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
# Install dependencies
pnpm install

# Run in development mode (kiqjs.profiles.active=development)
pnpm dev
```

The server will start at `http://localhost:3000`

### Production Mode

```bash
# Build
pnpm build

# Run in production mode
NODE_ENV=production node dist/Application.js
```

Or set in `resources/application.yml`:

```yaml
spring:
  profiles:
    active: production
```

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

```typescript
// Good: Pure domain
class User {
  activate(): User { /* ... */ }
}

// Bad: Domain coupled to framework
class User extends KoaModel { /* ... */ }
```

### 2. Vertical Delivery Always

Each feature contains **everything** it needs:
- Controller (HTTP)
- Service (Business)
- Repository (Data)
- Events (Communication)
- DTOs (Transfer)
- Loggers (Observability)

### 3. Single Responsibility

Each file has **one responsibility**:
- `UserHttpController` - Only handles HTTP
- `UserService` - Only orchestrates business logic
- `UserRepository` - Only persists data
- `UserLogger` - Only logs events

### 4. Events as Language

```typescript
// System communicates via events
await this.publisher.publishUserCreated(new UserCreatedEvent(user));
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

## Comparison: Before vs. After

### Traditional Structure

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
└── repositories/
    ├── UserRepository.ts
    └── ...
```

**Problem**: Features scattered across multiple folders

### THREAD Architecture

```
src/
├── features/
│   ├── user/
│   │   ├── UserHttpController.ts
│   │   ├── UserService.ts
│   │   ├── UserRepository.ts
│   │   └── UserLogger.ts
│   ├── order/
│   │   ├── OrderHttpController.ts
│   │   ├── OrderService.ts
│   │   └── OrderRepository.ts
```

**Advantage**: Complete feature in one place

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

The architecture makes testing straightforward:

```typescript
describe('UserService', () => {
  it('should create user', () => {
    const repo = new InMemoryUserRepository();
    const service = new UserService(repo, eventPublisher);

    const result = await service.createUser({
      name: 'Test',
      email: 'test@example.com'
    });

    expect(result.success).toBe(true);
  });
});
```

## Next Steps

For a complete production implementation, add:

- Real Kafka/Redis integration
- Database (PostgreSQL, MongoDB, etc)
- Authentication/Authorization
- Structured logging
- Metrics and observability
- Automated tests
- CI/CD pipeline
- Docker deployment

## References

- [THREAD Architecture - Full Documentation](https://thread.com.br/architecture)
- [KiqJS Documentation](../../README.md)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

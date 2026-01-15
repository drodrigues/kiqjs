# KiqJS

A dependency injection framework for TypeScript/Node.js with decorators, YAML configuration, and profile-based component activation.

## Features

- **Dependency Injection**: Constructor and property injection with `@Service`, `@Component`, `@Repository`
- **Configuration Management**: YAML configuration with profiles
- **Profile-based Activation**: Conditional component registration using `@Profile` decorator
- **Resource Loading**: Load templates, configs, and assets from `resources/` folder
- **HTTP Decorators**: REST controllers with `@RestController`, `@GetMapping`, etc.
- **DTO Validation**: Automatic request validation with `class-validator` decorators
- **Bean Management**: Factory methods with `@Configuration` and `@Bean` decorators
- **Lifecycle Hooks**: `@PostConstruct` for initialization logic

## Packages

### @kiqjs/core

Core dependency injection container with configuration management.

```typescript
import { Service, Inject, Value, Configuration, Bean, Profile, PostConstruct } from '@kiqjs/core';

@Service()
@Profile('development')
export class UserService {
  @Inject()
  private userRepository!: UserRepository;

  @Value('app.name')
  private appName!: string;

  @PostConstruct()
  init() {
    console.log(`${this.appName} initialized`);
  }
}

@Configuration()
export class AppConfig {
  @Value('database.host')
  private dbHost!: string;

  @Value('database.port')
  private dbPort!: number;

  @Bean()
  database() {
    return new Database({
      host: this.dbHost,
      port: this.dbPort
    });
  }
}
```

**Documentation:**
- [Configuration Management](./packages/core/CONFIGURATION.md)
- [Resource Loader](./packages/core/RESOURCE-LOADER.md)
- [Profile-based Activation](./packages/core/PROFILES.md)

### @kiqjs/http

HTTP framework with REST decorators.

```typescript
import { RestController, GetMapping, PostMapping, PathVariable, RequestBody, Valid } from '@kiqjs/http';

@RestController('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('/:id')
  async getUser(@PathVariable('id') id: string) {
    return this.userService.findById(id);
  }

  @PostMapping()
  async createUser(@RequestBody() @Valid() dto: CreateUserDto) {
    return this.userService.create(dto);
  }
}
```

**Documentation:**
- [HTTP Decorators](./packages/http/README.md)
- [DTO Validation](./packages/http/DTO_VALIDATION.md)

### @kiqjs/repository

Type-safe repository pattern with multiple storage backends.

```typescript
import { Repository, InjectRepository } from '@kiqjs/repository';

interface User {
  id: string;
  name: string;
  email: string;
}

@Service()
export class UserService {
  @InjectRepository('User')
  private userRepo: Repository<User>;

  async findByEmail(email: string) {
    return this.userRepo.findOne({ email });
  }
}
```

## Installation

```bash
npm install @kiqjs/core @kiqjs/http @kiqjs/repository
# or
yarn add @kiqjs/core @kiqjs/http @kiqjs/repository
# or
pnpm add @kiqjs/core @kiqjs/http @kiqjs/repository
```

## Quick Start

### Using @kiqjs/core Only (CLI/Background Tasks)

For applications that don't need HTTP (CLI tools, background workers, scheduled tasks):

```typescript
// src/services/TaskService.ts
import { Service, Value, Inject } from '@kiqjs/core';
import { LoggerService } from './LoggerService';

@Service()
export class TaskService {
  @Inject()
  private logger!: LoggerService;

  @Value('app.name')
  private appName!: string;

  async processTask(data: any) {
    this.logger.info(`${this.appName} - Processing task:`, data);
    // Your business logic here
  }
}

// src/Application.ts
import 'reflect-metadata';
import { Container, runApplication } from '@kiqjs/core';
import { TaskService } from './services/TaskService';

class Application {
  private container!: Container;

  async run() {
    // Initialize KiqJS container (scans and registers all components)
    this.container = await runApplication(Application);

    // Resolve dependencies from container
    const taskService = this.container.get(TaskService);

    // Run your tasks
    await taskService.processTask({ id: 1, name: 'Example' });
    console.log('Application completed!');
  }
}

// Bootstrap the application (simple one-liner)
new Application().run().catch(console.error);
```

**Configuration (resources/application.yml):**
```yaml
kiq:
  profiles:
    active: development

app:
  name: My CLI Tool
  version: 1.0.0
```

**Run:**
```bash
ts-node src/Application.ts
```

**Key Points:**
- Simple bootstrap: `new Application().run().catch(console.error)`
- `runApplication()` scans and registers all components automatically
- Resolve dependencies with `container.get(ServiceName)`
- No decorators needed on Application class

**Examples:**

1. **CLI Tool** - [examples/cli-tool](./examples/cli-tool)
   - Configuration management with `@Value`
   - Profile-based components with `@Profile`
   - Resource loading with `ResourceLoader`
   - Logging and data processing services

2. **Daemon Worker** - [examples/daemon-worker](./examples/daemon-worker)
   - Long-running process with infinite loop
   - Graceful shutdown on SIGTERM/SIGINT
   - Batch task processing
   - Perfect for background jobs, message queue consumers

### Using @kiqjs/http (Web Applications)

### 1. Project Structure

```
my-project/
  ├── resources/                    # YAML configs, templates, static files
  │   ├── application.yml
  │   ├── application-development.yml
  │   └── application-production.yml
  ├── src/
  │   ├── config/                   # TypeScript configuration classes
  │   │   └── AppConfig.ts
  │   ├── features/
  │   │   └── user/
  │   │       ├── UserService.ts
  │   │       ├── UserController.ts
  │   │       └── UserDto.ts
  │   └── Application.ts
  ├── package.json
  └── tsconfig.json
```

### 2. Configuration (resources/application.yml)

```yaml
kiq:
  profiles:
    active: development

server:
  port: 3000
  host: localhost
  prefix: /api

app:
  name: My Application
  version: 1.0.0

database:
  host: localhost
  port: 5432
```

### 3. Service Layer

```typescript
// src/features/user/UserService.ts
import { Service, Value } from '@kiqjs/core';

@Service()
export class UserService {
  @Value('database.host')
  private dbHost: string;

  async findAll() {
    // Use this.dbHost from configuration
    return [];
  }
}
```

### 4. HTTP Controller

```typescript
// src/features/user/UserController.ts
import { RestController, GetMapping } from '@kiqjs/http';

@RestController('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping()
  async getAll() {
    return this.userService.findAll();
  }
}
```

### 5. Application Bootstrap

```typescript
// src/Application.ts
import 'reflect-metadata';
import { KiqHttpApplication } from '@kiqjs/http';

class Application {
  async run() {
    // Server config (port, host, prefix) is loaded automatically from YAML
    const app = new KiqHttpApplication(Application, {
      logging: true,
      errorHandler: true,
      bodyParser: true,
    });

    await app.start();
  }
}

new Application().run().catch(console.error);
```

### 6. Run

```bash
# Development
npm run dev

# Production
NODE_ENV=production npm start
```

## Configuration Management

KiqJS uses YAML configuration with profile support:

```yaml
# resources/application.yml
kiq:
  profiles:
    active: development

server:
  port: 3000
  host: localhost
  prefix: /api

app:
  name: My App
```

Inject values in your services:

```typescript
@Service()
export class MyService {
  @Value('server.port')
  private port: number;

  @Value('app.name')
  private appName: string;
}
```

**Priority:**
1. Environment variables (highest)
2. `resources/application-{profile}.yml`
3. `resources/application.yml`

**Environment variable override:**
```bash
SERVER_PORT=8080 node app.js
```

## Profile-based Activation

Use `@Profile` to conditionally register components:

```typescript
@Service()
@Profile('development')
export class DevLogger {
  log(msg: string) {
    console.log(`[DEV] ${msg}`);
  }
}

@Service()
@Profile('production')
export class ProdLogger {
  log(msg: string) {
    // Send to monitoring service
  }
}

@Service()
@Profile('!production')  // All except production
export class DebugService {}
```

**Set active profile:**

```yaml
# resources/application.yml
kiq:
  profiles:
    active: production
```

Or use environment variable:

```bash
NODE_ENV=production node app.js
```

## Resource Loading

Load files from `resources/` folder:

```typescript
import { ResourceLoader } from '@kiqjs/core';

@Service()
export class EmailService {
  private loader = new ResourceLoader();

  sendWelcomeEmail(user: User) {
    const template = this.loader.getResourceAsString('templates/welcome.html');
    const html = template.replace('{{name}}', user.name);
    // Send email...
  }
}
```

## HTTP Decorators

REST controllers with decorator support:

```typescript
@RestController('/api/users')
export class UserController {
  @GetMapping()
  async findAll(@RequestParam({ name: 'page', required: false }) page?: number) {
    return this.userService.findAll(page);
  }

  @GetMapping('/:id')
  async findOne(@PathVariable('id') id: string) {
    return this.userService.findById(id);
  }

  @PostMapping()
  async create(@RequestBody() @Valid() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @PutMapping('/:id')
  async update(
    @PathVariable('id') id: string,
    @RequestBody() @Valid() dto: UpdateUserDto
  ) {
    return this.userService.update(id, dto);
  }

  @DeleteMapping('/:id')
  async delete(@PathVariable('id') id: string) {
    await this.userService.delete(id);
    return { message: 'Deleted successfully' };
  }
}
```

## DTO Validation

Automatic request validation with decorators:

```typescript
import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;
}

@PostMapping()
async create(@RequestBody() @Valid() dto: CreateUserDto) {
  // dto is already validated
  return this.userService.create(dto);
}
```

## Configuration Classes

Factory methods for complex objects:

```typescript
@Configuration()
export class DatabaseConfig {
  @Value('database.host')
  private host: string;

  @Value('database.port')
  private port: number;

  @Bean()
  dataSource() {
    return new DataSource({
      host: this.host,
      port: this.port,
      database: 'myapp'
    });
  }

  @Bean()
  connectionPool() {
    return new ConnectionPool(this.dataSource());
  }
}

// Inject beans anywhere
@Service()
export class UserRepository {
  @Inject('dataSource')
  private dataSource: DataSource;
}
```

## Examples

### CLI Tool Example

Check [examples/cli-tool](./examples/cli-tool) for a complete CLI application:

- **Simple Bootstrap**: `new Application().run().catch(console.error)`
- **Dependency Injection**: Automatic component scanning and resolution
- **Configuration Management**: @Value decorator with YAML files
- **Profile-based Activation**: @Profile decorator for environment-specific components
- **Resource Loading**: ResourceLoader for reading files from resources/
- **Service Architecture**: @Service, @Component, @Configuration decorators
- **Logging Service**: Configurable logging with different levels and formats

Run:
```bash
cd examples/cli-tool
pnpm install
pnpm dev
```

### Daemon Worker Example

Check [examples/daemon-worker](./examples/daemon-worker) for a long-running worker process:

- **Infinite Loop Pattern**: Worker runs continuously with `while(running)`
- **Graceful Shutdown**: Responds to SIGTERM/SIGINT signals
- **Task Processing**: Batch processing with configurable intervals
- **Cleanup**: Proper shutdown with statistics logging
- **Docker/K8s Ready**: Perfect for containerized deployments

Run:
```bash
cd examples/daemon-worker
pnpm install
pnpm dev  # Press Ctrl+C to test graceful shutdown
```

### Web Application Example

Check [examples/thread-architecture](./examples/thread-architecture) for a complete web application:

- **THREAD Architecture** pattern (domain-driven, feature-oriented)
- **REST API** with validation
- **Auto-config**: Server settings loaded from YAML automatically
- **Profile-based component activation**
- **YAML configuration** with profiles
- **Resource loading** (templates, configs)

Run:
```bash
cd examples/thread-architecture
pnpm install
pnpm dev
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "outDir": "./dist"
  }
}
```

## Architecture Principles

KiqJS promotes clean architecture with:

- **Dependency Injection**: Loose coupling, testable code
- **Separation of Concerns**: Clear boundaries between layers
- **Configuration Management**: Centralized, environment-aware configuration
- **Profile-based Activation**: Environment-specific implementations
- **Type Safety**: Full TypeScript support
- **Decorator-based**: Clean, declarative API with TypeScript decorators

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Run example
cd examples/thread-architecture
pnpm dev
```

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Author

Built for the Node.js/TypeScript ecosystem.

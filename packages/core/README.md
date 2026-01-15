# @kiqjs/core

> Dependency injection container for Node.js/TypeScript with decorators, YAML configuration, and profile-based component activation

## Overview

`@kiqjs/core` is a lightweight dependency injection (DI) container that brings powerful features to TypeScript applications. It provides a clean, decorator-based API for managing dependencies, configuration, and application lifecycle.

## Features

- **Dependency Injection** - Constructor and property injection with `@Inject` decorator
- **Component Scanning** - Automatic discovery and registration of components
- **Configuration Management** - YAML-based configuration with environment variable support
- **Profile-based Activation** - Conditional component registration using `@Profile` decorator
- **Resource Loading** - Load files from `resources/` directory (templates, configs, assets)
- **Bean Management** - Factory methods with `@Configuration` and `@Bean` decorators
- **Lifecycle Hooks** - `@PostConstruct` for initialization logic
- **Type-safe** - Full TypeScript support with type inference
- **Zero runtime dependencies** - Only requires `reflect-metadata` and `js-yaml`

## Installation

```bash
npm install @kiqjs/core
# or
pnpm add @kiqjs/core
# or
yarn add @kiqjs/core
```

## Quick Start

### 1. Basic Service with Dependency Injection

```typescript
import 'reflect-metadata';
import { Service, Inject, Component, runApplication } from '@kiqjs/core';

@Service()
class UserRepository {
  findById(id: string) {
    return { id, name: 'John Doe' };
  }
}

@Service()
class UserService {
  @Inject()
  private userRepository!: UserRepository;

  getUser(id: string) {
    return this.userRepository.findById(id);
  }
}

@Component()
class Application {
  @Inject()
  private userService!: UserService;

  async run() {
    const user = this.userService.getUser('1');
    console.log('User:', user);
  }
}

// Bootstrap
async function bootstrap() {
  const container = await runApplication(Application);
  const app = container.get(Application);
  await app.run();
}

bootstrap();
```

### 2. Configuration with @Value

```typescript
import { Service, Value } from '@kiqjs/core';

@Service()
class EmailService {
  @Value('email.host')
  private host!: string;

  @Value('email.port')
  private port!: number;

  @Value('email.from')
  private from!: string;

  sendEmail(to: string, subject: string, body: string) {
    console.log(`Sending email via ${this.host}:${this.port}`);
    console.log(`From: ${this.from}, To: ${to}`);
  }
}
```

**Configuration file** (`resources/application.yml`):
```yaml
email:
  host: smtp.gmail.com
  port: 587
  from: noreply@example.com
```

### 3. Profile-based Components

```typescript
import { Service, Profile } from '@kiqjs/core';

@Service()
@Profile('development')
class DevEmailService {
  sendEmail(to: string, subject: string) {
    console.log(`[DEV] Email to ${to}: ${subject}`);
  }
}

@Service()
@Profile('production')
class ProdEmailService {
  sendEmail(to: string, subject: string) {
    // Send via real SMTP server
  }
}
```

**Configuration** (`resources/application.yml`):
```yaml
kiq:
  profiles:
    active: development
```

## Core Concepts

### Decorators

#### Component Registration

- **`@Component()`** - Marks a class as a component to be managed by the DI container
- **`@Service()`** - Alias for `@Component`, semantically represents a service
- **`@Repository()`** - Alias for `@Component`, semantically represents a repository
- **`@Controller()`** - Alias for `@Component`, semantically represents a controller
- **`@Configuration()`** - Marks a class as a configuration provider with `@Bean` methods

#### Dependency Injection

- **`@Inject()`** - Injects a dependency by type (property injection)
- **`@Named(name)`** - Qualifies a component with a specific name
- **`@Qualifier(name)`** - Alias for `@Named`

#### Configuration & Lifecycle

- **`@Value(key)`** - Injects configuration value from YAML or environment variables
- **`@PostConstruct()`** - Marks a method to be called after dependency injection
- **`@Profile(profiles)`** - Conditionally registers component based on active profiles
- **`@Bean(name?, scope?)`** - Declares a factory method in a `@Configuration` class

### Container API

```typescript
import { Container, scanAndRegister } from '@kiqjs/core';

// Scan and register components
await scanAndRegister(__dirname);

// Create container
const container = new Container();

// Resolve dependencies
const userService = container.get(UserService);
const configInstance = container.get(AppConfiguration);
```

### Application Bootstrap

#### Using `runApplication()` (Recommended)

```typescript
import { Component, Inject, runApplication } from '@kiqjs/core';

@Component()
class Application {
  @Inject()
  private myService!: MyService;

  async run() {
    // Your application logic
  }
}

async function bootstrap() {
  // Automatically scans and registers components
  const container = await runApplication(Application);
  const app = container.get(Application);
  await app.run();
}

bootstrap();
```

#### Manual Container Setup

```typescript
import { Container, scanAndRegister } from '@kiqjs/core';

async function bootstrap() {
  // Scan directory for components
  await scanAndRegister(__dirname);

  // Create container
  const container = new Container();

  // Resolve services
  const service = container.get(MyService);
}
```

## Configuration Management

### YAML Configuration Files

Place configuration files in the `resources/` directory:

```
project/
├── resources/
│   ├── application.yml           # Base configuration
│   ├── application-development.yml   # Development overrides
│   └── application-production.yml    # Production overrides
└── src/
    └── ...
```

**Base configuration** (`resources/application.yml`):
```yaml
kiq:
  profiles:
    active: development

app:
  name: My Application
  version: 1.0.0

database:
  host: localhost
  port: 5432
  name: mydb

email:
  host: smtp.gmail.com
  port: 587
```

**Profile-specific** (`resources/application-production.yml`):
```yaml
database:
  host: prod-db.example.com
  port: 5432
  name: prod_db

email:
  host: smtp.sendgrid.net
```

### Environment Variables

Environment variables override YAML configuration:

```bash
DATABASE_HOST=db.example.com npm start
```

Configuration lookup order (highest to lowest priority):
1. Environment variables
2. Profile-specific YAML (`application-{profile}.yml`)
3. Base YAML (`application.yml`)

### Accessing Configuration

```typescript
import { getConfiguration } from '@kiqjs/core';

const config = getConfiguration();
const dbHost = config.get<string>('database.host');
const dbPort = config.get<number>('database.port', 5432); // with default
```

See [CONFIGURATION.md](./CONFIGURATION.md) for detailed documentation.

## Profile-based Activation

Profiles allow you to conditionally register components based on the environment:

```typescript
@Service()
@Profile('development')
class LocalStorageService {
  save(data: any) {
    console.log('Saving to local file system');
  }
}

@Service()
@Profile('production')
class S3StorageService {
  save(data: any) {
    console.log('Saving to S3 bucket');
  }
}

@Service()
@Profile('!production')  // All except production
class DebugLogger {
  log(message: string) {
    console.log('[DEBUG]', message);
  }
}

@Service()
@Profile(['development', 'staging'])  // Multiple profiles
class TestDataSeeder {
  seed() {
    console.log('Seeding test data');
  }
}
```

**Set active profile:**

```yaml
# resources/application.yml
kiq:
  profiles:
    active: development
```

Or via environment variable:
```bash
NODE_ENV=production npm start
```

See [PROFILES.md](./PROFILES.md) for detailed documentation.

## Resource Loading

Load files from the `resources/` directory:

```typescript
import { ResourceLoader, Inject, Service } from '@kiqjs/core';

@Service()
class EmailService {
  @Inject()
  private resourceLoader!: ResourceLoader;

  sendWelcomeEmail(user: User) {
    // Load HTML template
    const template = this.resourceLoader.getResourceAsString('templates/welcome.html');
    const html = template.replace('{{name}}', user.name);

    // Send email with template
  }

  loadConfig() {
    // Load JSON config
    const config = this.resourceLoader.getResourceAsJson('config/email.json');

    // Load YAML config
    const settings = this.resourceLoader.getResourceAsYaml('config/settings.yml');
  }

  checkTemplateExists() {
    if (this.resourceLoader.exists('templates/welcome.html')) {
      console.log('Template exists');
    }
  }

  listTemplates() {
    const files = this.resourceLoader.listResources('templates');
    console.log('Templates:', files);
  }
}
```

See [RESOURCE-LOADER.md](./RESOURCE-LOADER.md) for detailed documentation.

## Bean Factory Methods

Use `@Configuration` and `@Bean` for complex object creation:

```typescript
import { Configuration, Bean, Value } from '@kiqjs/core';

@Configuration()
class DatabaseConfig {
  @Value('database.host')
  private host!: string;

  @Value('database.port')
  private port!: number;

  @Value('database.name')
  private database!: string;

  @Bean()
  dataSource() {
    return new DataSource({
      host: this.host,
      port: this.port,
      database: this.database,
    });
  }

  @Bean()
  connectionPool() {
    return new ConnectionPool(this.dataSource());
  }

  @Bean('customRepository', 'singleton')
  userRepository() {
    return new UserRepository(this.connectionPool());
  }
}

// Inject beans anywhere
@Service()
class UserService {
  @Inject('dataSource')
  private dataSource!: DataSource;

  @Inject('customRepository')
  private userRepository!: UserRepository;
}
```

## Lifecycle Hooks

Use `@PostConstruct` to run initialization logic after dependency injection:

```typescript
@Service()
class DatabaseService {
  @Inject()
  private config!: DatabaseConfig;

  private connection: any;

  @PostConstruct()
  async init() {
    console.log('Initializing database connection...');
    this.connection = await this.connect();
    console.log('Database connected!');
  }

  private async connect() {
    // Connection logic
  }
}
```

## Scopes

Components can have different lifecycle scopes:

```typescript
@Component({ scope: 'singleton' })  // Default - one instance
class SingletonService {}

@Component({ scope: 'prototype' })  // New instance per injection
class PrototypeService {}
```

## Advanced Patterns

### Optional Dependencies

Use try-catch to handle optional dependencies:

```typescript
@Component()
class Application {
  @Inject()
  private container!: Container;

  async run() {
    // Try to get optional debug component
    let debugger: DebugComponent | undefined;
    try {
      debugger = this.container.get(DebugComponent);
      debugger.printInfo();
    } catch {
      // DebugComponent not registered (debug profile not active)
    }
  }
}
```

### Named Components

```typescript
@Service()
@Named('primaryDatabase')
class PrimaryDatabase {}

@Service()
@Named('secondaryDatabase')
class SecondaryDatabase {}

// Inject by name
@Service()
class DataService {
  @Inject('primaryDatabase')
  private primary!: PrimaryDatabase;

  @Inject('secondaryDatabase')
  private secondary!: SecondaryDatabase;
}
```

### Circular Dependencies

The container handles circular dependencies automatically using proxies for property injection:

```typescript
@Service()
class ServiceA {
  @Inject()
  private serviceB!: ServiceB;
}

@Service()
class ServiceB {
  @Inject()
  private serviceA!: ServiceA;  // Circular dependency - works fine!
}
```

## Examples

### CLI Application

See [examples/cli-tool](../../examples/cli-tool) for a complete CLI application demonstrating:
- Dependency injection with `@Inject`
- Configuration management with `@Value`
- Profile-based components with `@Profile`
- Resource loading with `ResourceLoader`
- Logging service with configurable levels
- Data processing with batch support

### Web Application

See [examples/thread-architecture](../../examples/thread-architecture) for a REST API application using `@kiqjs/http`.

## API Reference

### Exported Types

```typescript
import type { Token, Scope, ComponentOptions, ValueSource, Newable } from '@kiqjs/core';

type Token<T = any> = string | symbol | Newable<T>;
type Scope = 'singleton' | 'prototype';

interface ComponentOptions {
  name?: string;
  scope?: Scope;
}

interface ValueSource {
  get(key: string): any;
}

type Newable<T = any> = new (...args: any[]) => T;
```

### Core Functions

```typescript
// Bootstrap
import { runApplication } from '@kiqjs/core';
const container = await runApplication(AppClass);

// Manual scanning
import { scanAndRegister } from '@kiqjs/core';
await scanAndRegister(__dirname);

// Configuration
import { getConfiguration, ConfigurationLoader } from '@kiqjs/core';
const config = getConfiguration();
const value = config.get<string>('key');

// Resource loading
import { getResourceLoader, ResourceLoader } from '@kiqjs/core';
const loader = getResourceLoader();
const content = loader.getResourceAsString('file.txt');

// Profile checks
import { getActiveProfiles, isProfileActive } from '@kiqjs/core';
const profiles = getActiveProfiles();
const isDev = isProfileActive('development');

// Container
import { Container, GlobalRegistry } from '@kiqjs/core';
const container = new Container();
const instance = container.get(MyService);
```

## Best Practices

1. **Use `@Inject()` for dependencies** - Prefer property injection for cleaner code
2. **Use `@Value()` for configuration** - Keep configuration in YAML files
3. **Use profiles for environment-specific code** - Separate dev/prod implementations
4. **Use `@Configuration` for complex objects** - Factory methods for third-party libraries
5. **Use `@PostConstruct` for initialization** - Run setup after dependencies are injected
6. **Use `ResourceLoader` for file access** - Load templates and configs from resources/
7. **Keep services focused** - Single responsibility principle
8. **Use semantic decorators** - `@Service`, `@Repository` for better code clarity

## TypeScript Configuration

Enable decorators in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true
  }
}
```

## Documentation

- [Configuration Management](./CONFIGURATION.md) - Detailed YAML configuration guide
- [Profile-based Activation](./PROFILES.md) - Environment-specific components
- [Resource Loading](./RESOURCE-LOADER.md) - Loading files from resources/

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

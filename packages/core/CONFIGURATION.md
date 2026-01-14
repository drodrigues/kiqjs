# YAML Configuration (Spring Boot Style)

KiqJS Core supports Spring Boot style YAML configuration files with profile support and environment variable overrides.

## Features

- 📄 **YAML Configuration Files**: Use `application.yml` in project root
- 🎯 **Profile Support**: Environment-specific configs with `application-{profile}.yml`
- 🔧 **Environment Variables**: Override any config with env vars
- 💉 **@Value Decorator**: Inject configuration values into your classes
- 🌳 **Nested Properties**: Access nested config with dot notation
- 📁 **Node.js Convention**: Files in project root (like `.env`)

## Quick Start

### 1. Create Configuration Files

Create an `application.yml` in your project root (same level as `package.json`):

```yaml
# application.yml
server:
  port: 3000
  host: localhost

database:
  host: localhost
  port: 5432
  name: myapp

features:
  userManagement: true
  analytics: false
```

### 2. Profile-Specific Configuration

Create profile-specific configurations in the project root:

```yaml
# application-production.yml
server:
  port: 8080
  host: 0.0.0.0

database:
  host: prod-db.example.com
  password: ${DATABASE_PASSWORD}
```

```yaml
# application-development.yml
features:
  analytics: true
```

Your project structure:
```
my-project/
  ├── application.yml
  ├── application-development.yml
  ├── application-production.yml
  ├── package.json
  └── src/
```

### 3. Use @Value Decorator

Inject configuration values into your services:

```typescript
import { Service, Value } from '@kiqjs/core';

@Service()
export class DatabaseService {
  @Value('database.host')
  private host!: string;

  @Value('database.port')
  private port!: number;

  @Value('database.name')
  private dbName!: string;

  connect() {
    console.log(`Connecting to ${this.host}:${this.port}/${this.dbName}`);
  }
}
```

### 4. Access Configuration Programmatically

```typescript
import { getConfiguration } from '@kiqjs/core';

const config = getConfiguration();

const serverPort = config.get('server.port', 3000);
const dbHost = config.get('database.host');
const serverConfig = config.getObject('server');
```

## Configuration Loading Order

Configuration is loaded and merged in this order (later overrides earlier):

1. `application.yml` or `application.yaml` (base configuration)
2. `application-{profile}.yml` (profile-specific)
3. Environment variables (highest priority)

The active profile is determined by:
- Explicit profile parameter
- `NODE_ENV` environment variable
- Defaults to `'development'`

## Environment Variable Overrides

Environment variables can override any configuration value using uppercase underscore notation:

| Configuration Key | Environment Variable |
|-------------------|---------------------|
| `server.port` | `SERVER_PORT` |
| `database.host` | `DATABASE_HOST` |
| `features.userManagement` | `FEATURES_USERMANAGEMENT` |

### Example

```yaml
# application.yml
server:
  port: 3000
```

```bash
# Override with environment variable
SERVER_PORT=8080 node app.js
```

## API Reference

### ConfigurationLoader

```typescript
class ConfigurationLoader {
  constructor(baseDir?: string, profile?: string);

  get<T>(key: string, defaultValue?: T): T;
  getObject(key: string): Record<string, any>;
  getAll(): Record<string, any>;
  has(key: string): boolean;
}
```

### Functions

```typescript
// Get global configuration instance
function getConfiguration(baseDir?: string, profile?: string): ConfigurationLoader;

// Reset configuration (useful for testing)
function resetConfiguration(): void;
```

### @Value Decorator

```typescript
@Value(key: string)
```

Injects configuration value into a class property.

## Examples

### Basic Usage

```typescript
import { Service, Value } from '@kiqjs/core';

@Service()
export class AppService {
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  version!: string;

  @Value('features.analytics')
  analyticsEnabled!: boolean;

  getInfo() {
    return {
      name: this.appName,
      version: this.version,
      analytics: this.analyticsEnabled
    };
  }
}
```

### Configuration Class

```typescript
import { Configuration, Bean, Value } from '@kiqjs/core';

@Configuration()
export class AppConfig {
  @Value('server.port')
  serverPort!: number;

  @Value('server.host')
  serverHost!: string;

  @Bean()
  serverConfig() {
    return {
      port: this.serverPort,
      host: this.serverHost,
    };
  }
}
```

### Runtime Access

```typescript
import { getConfiguration } from '@kiqjs/core';

// In your application startup
const config = getConfiguration();

console.log('Server config:', config.getObject('server'));
console.log('Database host:', config.get('database.host'));

if (config.has('features.newFeature')) {
  // Feature flag check
}
```

## Best Practices

1. **Use Profiles**: Separate configs for dev/staging/prod
2. **Sensible Defaults**: Provide defaults in base `application.yml`
3. **Environment Secrets**: Never commit secrets, use env vars
4. **Type Safety**: Use `@Value` decorator for type-safe injection
5. **Documentation**: Comment your YAML files

## Migration from process.env

**Before:**
```typescript
const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || 'localhost';
```

**After:**
```typescript
@Value('server.port')
port!: number;

@Value('server.host')
host!: string;
```

With `application.yml`:
```yaml
server:
  port: 3000
  host: localhost
```

## TypeScript Support

Configuration is fully typed when using the `@Value` decorator with TypeScript:

```typescript
@Value('server.port')
port!: number;  // Type: number

@Value('server.host')
host!: string;  // Type: string

@Value('features.enabled')
enabled!: boolean;  // Type: boolean
```

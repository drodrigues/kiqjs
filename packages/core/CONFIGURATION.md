# YAML Configuration

KiqJS Core supports YAML configuration files with profile support and environment variable overrides.

## Features

- 📄 **YAML Configuration Files**: Use `application.yml` in `resources/` folder
- 🎯 **Profile Support**: Environment-specific configs with `application-{profile}.yml`
- 🔧 **Environment Variables**: Override any config with env vars
- 💉 **@Value Decorator**: Inject configuration values into your classes
- 🌳 **Nested Properties**: Access nested config with dot notation
- 🔍 **Auto-Detection**: Automatically finds `resources/` folder or falls back to project root
- 🐳 **Docker-Friendly**: Clean separation for easy containerization
- 🎨 **Multi-Purpose**: Resources folder can also hold templates, static files, etc.

## Quick Start

### 1. Create Resources Directory

Create a `resources/` directory in your project root:

```yaml
# resources/application.yml
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

Create profile-specific configurations:

```yaml
# resources/application-production.yml
server:
  port: 8080
  host: 0.0.0.0

database:
  host: prod-db.example.com
  password: ${DATABASE_PASSWORD}
```

```yaml
# resources/application-development.yml
features:
  analytics: true
```

### Project Structure

```
my-project/
  ├── resources/                        # Resources folder
  │   ├── application.yml               # Base configuration
  │   ├── application-development.yml   # Dev overrides
  │   ├── application-production.yml    # Prod overrides
  │   └── templates/                    # (Optional) Template files
  ├── src/
  │   └── config/                       # Configuration classes (TypeScript)
  │       └── AppConfig.ts              # @Configuration classes
  ├── package.json
  └── Dockerfile
```

**Note:** `resources/` for non-code assets (YAML, templates, static files), `src/` for code. No conflict!

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

1. `resources/application.yml` or `application.yaml` (base configuration)
2. `resources/application-{profile}.yml` (profile-specific)
3. Environment variables (highest priority)

The active profile is determined by:
- Explicit profile parameter
- `NODE_ENV` environment variable
- Defaults to `'development'`

## Directory Detection

The ConfigurationLoader automatically detects the resources directory:

1. **Preferred**: `resources/` folder in project root
2. **Fallback**: Project root (for backward compatibility)

This keeps your project organized.

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

## Docker Support

The `resources/` folder structure makes Docker deployments clean and efficient:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy only what's needed
COPY package*.json ./
RUN npm ci --production

COPY resources/ ./resources/     # Configuration files
COPY dist/ ./dist/               # Compiled code

CMD ["node", "dist/index.js"]
```

### Multi-stage Build Example

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY resources/ ./resources/     # Resources folder (configs, templates, etc.)
COPY --from=builder /app/dist ./dist/
CMD ["node", "dist/index.js"]
```

Benefits:
- ✅ Clean separation of concerns
- ✅ Easy to override configs per environment
- ✅ Smaller Docker layers
- ✅ No root pollution
- ✅ Can hold configs, templates, and static files

## Best Practices

1. **Use Profiles**: Separate configs for dev/staging/prod
2. **Sensible Defaults**: Provide defaults in base `application.yml`
3. **Environment Secrets**: Never commit secrets, use env vars
4. **Type Safety**: Use `@Value` decorator for type-safe injection
5. **Documentation**: Comment your YAML files
6. **Docker**: Keep configs in `resources/` for clean containerization
7. **Git**: Add `resources/application-local.yml` to `.gitignore` for local overrides
8. **Multi-Purpose**: Use `resources/` for templates, static files, and other non-code assets

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

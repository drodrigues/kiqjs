# @kiqjs/yaml

YAML configuration templates and helpers for KiqJS applications with server configuration defaults.

## Features

- **Default Configuration Templates**: Ready-to-use YAML configuration files
- **Profile-based Configs**: Development and production profile templates
- **Type-safe Helpers**: TypeScript functions to access common configurations
- **Server Config**: Pre-configured server settings (port, host, prefix)
- **Logging Config**: Standard logging configuration structure
- **Feature Flags**: Built-in support for feature flag patterns

## Installation

```bash
pnpm add @kiqjs/yaml
```

## Quick Start

### 1. Copy Configuration Templates

Copy the template configuration files to your project's `resources/` folder:

```bash
# From packages/yaml/resources/ to your-project/resources/
cp -r node_modules/@kiqjs/yaml/resources/*.yml resources/
```

This will give you:
- `application.yml` - Base configuration
- `application-development.yml` - Development overrides
- `application-production.yml` - Production overrides

### 2. Use Configuration Helpers

```typescript
import { getServerConfig, getAppConfig, getLoggingConfig } from '@kiqjs/yaml';

// Get server configuration
const serverConfig = getServerConfig();
console.log(`Server: ${serverConfig.host}:${serverConfig.port}`);
// Output: Server: localhost:3000

// Get app metadata
const appConfig = getAppConfig();
console.log(`${appConfig.name} v${appConfig.version}`);
// Output: KiqJS Application v1.0.0

// Get logging configuration
const loggingConfig = getLoggingConfig();
if (loggingConfig.pretty) {
  console.log('Using pretty logging format');
}
```

### 3. Use with HTTP Server

```typescript
import { KiqHttpApplication } from '@kiqjs/http';
import { getServerConfig } from '@kiqjs/yaml';

const app = new KiqHttpApplication();

const serverConfig = getServerConfig();

app.start(serverConfig.port, serverConfig.host).then(() => {
  console.log(`Server running at http://${serverConfig.host}:${serverConfig.port}`);
});
```

## Default Configuration Structure

### Base Configuration (`application.yml`)

```yaml
# Active profiles
kiq:
  profiles:
    active: development

# Server configuration
server:
  port: 3000
  host: localhost
  prefix: /api

# Application metadata
app:
  name: KiqJS Application
  version: 1.0.0
  description: KiqJS application with default configuration

# Logging
logging:
  level: info
  format: json
  pretty: false

# Feature flags
features:
  enabled: true
```

### Development Profile (`application-development.yml`)

- Port: 3000
- Host: localhost
- Logging: debug, pretty format
- Features: enabled

### Production Profile (`application-production.yml`)

- Port: 8080
- Host: 0.0.0.0
- Logging: warn, json format
- Features: enabled

## API Reference

### `getServerConfig(): ServerConfig`

Returns server configuration from YAML:

```typescript
interface ServerConfig {
  port: number;      // Default: 3000
  host: string;      // Default: 'localhost'
  prefix?: string;   // Default: undefined
}
```

### `getAppConfig(): AppConfig`

Returns application metadata from YAML:

```typescript
interface AppConfig {
  name: string;        // Default: 'KiqJS Application'
  version: string;     // Default: '1.0.0'
  description?: string;
}
```

### `getLoggingConfig(): LoggingConfig`

Returns logging configuration from YAML:

```typescript
interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';  // Default: 'info'
  format: 'json' | 'pretty';                   // Default: 'json'
  pretty?: boolean;                            // Default: false
}
```

### `isFeatureEnabled(featureName: string, defaultValue?: boolean): boolean`

Checks if a feature flag is enabled:

```typescript
if (isFeatureEnabled('features.newUI', false)) {
  // Enable new UI
}
```

## Customization

You can customize the configuration files after copying them to your project:

```yaml
# resources/application.yml
server:
  port: 4000              # Change port
  host: 0.0.0.0          # Change host
  prefix: /api/v2        # Add API prefix

app:
  name: My Awesome App   # Your app name
  version: 2.0.0

features:
  newFeature: true       # Add custom feature flags
  beta: false
```

## Environment Variables

You can override any configuration value with environment variables:

```bash
SERVER_PORT=5000 node dist/index.js
```

The naming convention is uppercase with underscores, replacing dots:
- `server.port` → `SERVER_PORT`
- `logging.level` → `LOGGING_LEVEL`
- `app.name` → `APP_NAME`

## Profiles

Switch between profiles using:

1. YAML configuration:
```yaml
kiq:
  profiles:
    active: production
```

2. Environment variable:
```bash
NODE_ENV=production node dist/index.js
```

## License

MIT

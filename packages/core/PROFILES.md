# Profile-based Component Activation

KiqJS Core provides a `@Profile` decorator for activating components based on the active profile.

## Features

- 🎯 **Profile-based Activation**: Components only load in specific profiles
- 🔧 **Configuration-based**: Uses `kiqjs.profiles.active` from YAML
- 🌍 **Environment Variable Support**: Falls back to `NODE_ENV`
- ❗ **Negation Support**: Use `!production` to activate in all profiles except production
- 📦 **Multiple Profiles**: Support for arrays like `['development', 'test']`
- 🏗️ **Works with All Decorators**: `@Service`, `@Component`, `@Configuration`, `@Repository`

## Quick Start

### 1. Configure Active Profile

Set the active profile in `resources/application.yml`:

```yaml
# resources/application.yml
kiqjs:
  profiles:
    active: development
```

Or use environment variable:

```bash
NODE_ENV=production node dist/app.js
```

### 2. Use @Profile Decorator

```typescript
import { Service, Profile } from '@kiqjs/core';

// Active only in development
@Service()
@Profile('development')
export class DevelopmentLogger {
  log(message: string) {
    console.log(`[DEV] ${message}`);
  }
}

// Active only in production
@Service()
@Profile('production')
export class ProductionLogger {
  log(message: string) {
    // Send to cloud logging service
  }
}

// Active in all profiles except production
@Service()
@Profile('!production')
export class DebugService {
  debug(data: any) {
    console.log('DEBUG:', JSON.stringify(data, null, 2));
  }
}
```

## Profile Resolution Order

Profiles are determined in this order (first wins):

1. `kiqjs.profiles.active` in `resources/application.yml`
2. `NODE_ENV` environment variable
3. `'development'` (default)

### Examples

```yaml
# resources/application.yml
kiqjs:
  profiles:
    active: production
```

```bash
# Override with environment variable
NODE_ENV=staging node dist/app.js
```

```bash
# Multiple profiles (comma-separated)
spring:
  profiles:
    active: dev,local,debug
```

## Decorator Order

**Important:** Decorators execute bottom-to-top, so `@Profile` must come **after** (below) the component decorator:

```typescript
// ✅ Correct - @Profile executes first
@Service()
@Profile('development')
export class MyService {}

// ❌ Wrong - @Profile executes after @Service
@Profile('development')
@Service()
export class MyService {}
```

## Profile Expressions

### Single Profile

```typescript
@Service()
@Profile('development')
export class DevService {}
```

### Multiple Profiles (OR logic)

```typescript
// Active in 'development' OR 'test'
@Service()
@Profile(['development', 'test'])
export class LocalService {}
```

### Negation

```typescript
// Active in all profiles EXCEPT 'production'
@Service()
@Profile('!production')
export class DebugService {}
```

### Multiple Negations

```typescript
// Active in all profiles EXCEPT 'production' or 'staging'
@Service()
@Profile(['!production', '!staging'])
export class DevelopmentOnlyService {}
```

## Use Cases

### 1. Different Implementations Per Profile

```typescript
interface Logger {
  log(message: string): void;
}

@Service()
@Profile('development')
export class ConsoleLogger implements Logger {
  log(message: string) {
    console.log(`[DEV] ${message}`);
  }
}

@Service()
@Profile('production')
export class CloudLogger implements Logger {
  log(message: string) {
    // Send to CloudWatch/Datadog/etc
    sendToMonitoring(message);
  }
}
```

### 2. Environment-Specific Configuration

```typescript
@Configuration()
@Profile('development')
export class DevelopmentConfig {
  @Bean()
  database() {
    return {
      host: 'localhost',
      port: 5432,
      database: 'myapp_dev'
    };
  }
}

@Configuration()
@Profile('production')
export class ProductionConfig {
  @Bean()
  database() {
    return {
      host: process.env.DB_HOST,
      port: 5432,
      database: 'myapp_prod'
    };
  }
}
```

### 3. Debug/Development Tools

```typescript
// Only active in non-production environments
@Service()
@Profile('!production')
export class DebugService {
  logRequest(req: any) {
    console.log('Request:', JSON.stringify(req, null, 2));
  }

  logResponse(res: any) {
    console.log('Response:', JSON.stringify(res, null, 2));
  }
}
```

### 4. Test-Specific Mocks

```typescript
@Service()
@Profile('test')
export class MockEmailService implements EmailService {
  async send(to: string, subject: string, body: string) {
    console.log(`[MOCK] Email to ${to}: ${subject}`);
    return { success: true, messageId: 'mock-123' };
  }
}

@Service()
@Profile(['development', 'production'])
export class RealEmailService implements EmailService {
  async send(to: string, subject: string, body: string) {
    // Actually send email via SendGrid/AWS SES/etc
    return await this.emailProvider.send(to, subject, body);
  }
}
```

### 5. Feature Flags

```typescript
@Service()
@Profile(['development', 'staging'])
export class BetaFeatureService {
  isEnabled() {
    return true;
  }

  doSomethingNew() {
    // New feature only in dev/staging
  }
}

@Service()
@Profile('production')
export class BetaFeatureService {
  isEnabled() {
    return false;
  }

  doSomethingNew() {
    throw new Error('Feature not available');
  }
}
```

## API Reference

### @Profile Decorator

```typescript
@Profile(profiles: string | string[])
```

**Parameters:**
- `profiles`: Profile name(s) as string or array of strings
  - Single profile: `'development'`
  - Multiple profiles: `['development', 'test']` (OR logic)
  - Negation: `'!production'` (NOT logic)

**Usage:**
Must be placed **after** (below) component decorators:
- `@Service()`
- `@Component()`
- `@Configuration()`
- `@Repository()`
- `@Controller()`

### Profile Functions

```typescript
// Get active profiles
function getActiveProfiles(): string[];

// Check if profile is active
function isProfileActive(profileExpr: string | string[]): boolean;
```

**Example:**
```typescript
import { getActiveProfiles, isProfileActive } from '@kiqjs/core';

const profiles = getActiveProfiles();
console.log('Active profiles:', profiles);

if (isProfileActive('development')) {
  console.log('Running in development mode');
}

if (isProfileActive(['development', 'test'])) {
  console.log('Running in local environment');
}
```

## Configuration Files

### Base Configuration

```yaml
# resources/application.yml
spring:
  profiles:
    active: development  # Default profile

app:
  name: My Application
  version: 1.0.0

server:
  port: 3000
```

### Profile-Specific Configuration

```yaml
# resources/application-production.yml
# Only loaded when profile is 'production'

server:
  port: 8080
  host: 0.0.0.0

logging:
  level: warn
```

```yaml
# resources/application-development.yml
# Only loaded when profile is 'development'

server:
  port: 3000
  host: localhost

logging:
  level: debug
```

## Multiple Profiles

Support for comma-separated profiles:

```yaml
# resources/application.yml
spring:
  profiles:
    active: dev,local,debug
```

Components can match any of the active profiles:

```typescript
@Service()
@Profile('dev')  // Matches if 'dev' is in active profiles
export class DevService {}

@Service()
@Profile('local')  // Matches if 'local' is in active profiles
export class LocalService {}
```

## Best Practices

1. **Use Profiles for Environment Differences**
   ```typescript
   // Different database configs per environment
   @Configuration()
   @Profile('production')
   export class ProdConfig { ... }
   ```

2. **Keep Debug Tools Out of Production**
   ```typescript
   @Service()
   @Profile('!production')
   export class DebugLogger { ... }
   ```

3. **Test with Mock Implementations**
   ```typescript
   @Service()
   @Profile('test')
   export class MockPaymentService { ... }
   ```

4. **Document Profile Requirements**
   ```typescript
   /**
    * Production-only service
    * Requires: kiqjs.profiles.active=production
    */
   @Service()
   @Profile('production')
   export class ProductionService { ... }
   ```

5. **Use Interface-Based Design**
   ```typescript
   interface Logger {
     log(msg: string): void;
   }

   @Service()
   @Profile('dev')
   export class DevLogger implements Logger { ... }

   @Service()
   @Profile('prod')
   export class ProdLogger implements Logger { ... }
   ```

6. **Default to Safe Profiles**
   ```yaml
   # Default to development for safety
   spring:
     profiles:
       active: development
   ```

## Testing

### Unit Tests

```typescript
import { GlobalRegistry } from '@kiqjs/core';

describe('ProfiledService', () => {
  beforeEach(() => {
    GlobalRegistry.instance.clear();
    process.env.NODE_ENV = 'test';
  });

  it('should register in test profile', () => {
    @Service()
    @Profile('test')
    class TestService {}

    const providers = GlobalRegistry.instance.list();
    expect(providers).toHaveLength(1);
  });
});
```

### Integration Tests

```typescript
describe('Profile Integration', () => {
  it('should use mock services in test profile', () => {
    process.env.NODE_ENV = 'test';

    const container = new Container();
    const emailService = container.get(EmailService);

    // Should be MockEmailService in test profile
    expect(emailService.constructor.name).toBe('MockEmailService');
  });
});
```

## Common Patterns

### Pattern 1: Database Per Environment

```typescript
@Configuration()
@Profile('development')
export class DevDatabaseConfig {
  @Bean()
  dataSource() {
    return new DataSource({ host: 'localhost', database: 'dev' });
  }
}

@Configuration()
@Profile('production')
export class ProdDatabaseConfig {
  @Bean()
  dataSource() {
    return new DataSource({
      host: process.env.DB_HOST,
      database: process.env.DB_NAME
    });
  }
}
```

### Pattern 2: Logging Levels

```typescript
@Service()
@Profile(['development', 'test'])
export class VerboseLogger {
  log(level: string, message: string, data?: any) {
    console.log(`[${level.toUpperCase()}] ${message}`, data);
  }
}

@Service()
@Profile('production')
export class ProductionLogger {
  log(level: string, message: string) {
    if (level === 'error' || level === 'warn') {
      console.log(`[${level.toUpperCase()}] ${message}`);
    }
  }
}
```

### Pattern 3: Feature Toggles

```typescript
@Service()
@Profile('!production')
export class BetaFeatures {
  canAccessBetaUI(): boolean {
    return true;
  }

  canUseExperimentalAPI(): boolean {
    return true;
  }
}

@Service()
@Profile('production')
export class BetaFeatures {
  canAccessBetaUI(): boolean {
    // Check feature flag from database/config service
    return this.featureFlagService.isEnabled('beta-ui');
  }

  canUseExperimentalAPI(): boolean {
    return false;  // Disabled in prod
  }
}
```

## Comparison with Spring Boot

KiqJS `@Profile` is inspired by Spring Boot's `@Profile`:

| Spring Boot | KiqJS |
|-------------|-------|
| `@Profile("dev")` | `@Profile('development')` |
| `@Profile({"dev", "test"})` | `@Profile(['development', 'test'])` |
| `@Profile("!prod")` | `@Profile('!production')` |
| `spring.profiles.active` (application.properties) | `kiqjs.profiles.active` (resources/application.yml) |
| `@Component @Profile("dev")` | `@Service() @Profile('development')` |
| Multiple active profiles | Comma-separated in YAML |

## Troubleshooting

### Component Not Loading

**Problem:** Component with `@Profile` not being registered.

**Solution:** Check decorator order - `@Profile` must come **after** the component decorator:

```typescript
// ✅ Correct
@Service()
@Profile('development')
export class MyService {}
```

### Wrong Profile Active

**Problem:** Wrong profile is active.

**Solution:** Check priority order:
1. `kiqjs.profiles.active` in `resources/application.yml`
2. `NODE_ENV` environment variable
3. Default: `'development'`

```typescript
import { getActiveProfiles } from '@kiqjs/core';

console.log('Active profiles:', getActiveProfiles());
```

### Profile Not Matching

**Problem:** Component not loading even though profile seems correct.

**Solution:** Profile names are case-sensitive:

```typescript
// These are DIFFERENT:
@Profile('development')  // lowercase
@Profile('Development')  // capital D
```

## Migration from Environment Variables

**Before:**
```typescript
if (process.env.NODE_ENV === 'production') {
  app.use(productionLogger);
} else {
  app.use(devLogger);
}
```

**After:**
```typescript
@Service()
@Profile('production')
export class ProductionLogger { ... }

@Service()
@Profile('!production')
export class DevelopmentLogger { ... }
```

Benefits:
- ✅ Cleaner code
- ✅ Automatic registration
- ✅ Type-safe dependency injection
- ✅ Testable
- ✅ Spring Boot familiar pattern

## Related Features

- **Configuration Loader**: For loading YAML configuration files (see [CONFIGURATION.md](./CONFIGURATION.md))
- **Dependency Injection**: For component registration and resolution
- **Resource Loader**: For loading profile-specific resources (see [RESOURCE-LOADER.md](./RESOURCE-LOADER.md))

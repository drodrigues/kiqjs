# KiqJS CLI Tool Example

A comprehensive example of building a command-line application using **@kiqjs/core** without any HTTP dependencies. This example demonstrates the core features of KiqJS including dependency injection, configuration management, profile-based activation, and resource loading.

## Features Demonstrated

### 1. Dependency Injection (`@Autowired`)
- Services are automatically injected into components
- Optional dependencies with `@Autowired({ required: false })`
- Clean separation of concerns

### 2. Configuration Management (`@Value`)
- Type-safe configuration injection
- YAML-based configuration files
- Profile-specific configuration overrides

### 3. Profile-Based Activation (`@Profile`)
- Components activated based on active profiles
- Multiple profiles can be active simultaneously
- Useful for environment-specific behavior

### 4. Resource Loading (`ResourceLoader`)
- Load files from the `resources/` directory
- List available resources
- Type-safe resource access

### 5. Service Architecture
- `@Service` decorator for business logic
- `@Component` decorator for utility components
- `@Configuration` decorator for configuration classes

## Project Structure

```
cli-tool/
├── src/
│   ├── services/
│   │   ├── LoggerService.ts        # Logging service with configurable levels
│   │   └── DataProcessorService.ts # Data processing with batch support
│   ├── components/
│   │   ├── FileReaderComponent.ts  # File reading with ResourceLoader
│   │   └── DebugComponent.ts       # Debug-only component (@Profile)
│   ├── config/
│   │   └── AppConfiguration.ts     # Application configuration
│   └── Application.ts              # Main application entry point
├── resources/
│   ├── application.yml                 # Base configuration
│   ├── application-development.yml     # Development profile config
│   ├── application-production.yml      # Production profile config
│   └── data.txt                        # Sample data file
├── package.json
└── tsconfig.json
```

## Configuration

### Base Configuration (`application.yml`)
```yaml
app:
  name: "KiqJS CLI Tool"
  version: "1.0.0"
  description: "Example CLI tool demonstrating KiqJS Core features"

processor:
  batchSize: 10
  timeout: 5000
  enabled: true

logger:
  level: "info"
  format: "json"
```

### Profile-Specific Configuration
- **development**: Debug logging, smaller batches, longer timeouts
- **production**: Warn-level logging, larger batches, shorter timeouts
- **debug**: Activates the DebugComponent for detailed diagnostics

## Running the Example

### Install Dependencies
```bash
pnpm install
```

### Run with Default Profile
```bash
pnpm dev
```

### Run with Production Profile
```bash
pnpm dev:prod
# or
KIQJS_PROFILES_ACTIVE=production pnpm dev
```

### Run with Multiple Profiles (Development + Debug)
```bash
pnpm dev:debug
# or
KIQJS_PROFILES_ACTIVE=development,debug pnpm dev
```

## Example Output

### Default Profile (info level)
```
============================================================
KiqJS CLI Tool v1.0.0 - Example CLI tool demonstrating KiqJS Core features
============================================================

[2026-01-14T...] INFO: Application started
[2026-01-14T...] INFO: Listing resource files
[2026-01-14T...] INFO: Found 4 resource files
[2026-01-14T...] INFO: Reading data file from resources
[2026-01-14T...] INFO: Processing 5 items with batch size 10
[2026-01-14T...] INFO: Processing completed

============================================================
PROCESSING RESULTS
============================================================
1. [PROCESSED] This is sample data for the CLI tool
2. [PROCESSED] Line 1: Hello from KiqJS
3. [PROCESSED] Line 2: Dependency Injection rocks!
4. [PROCESSED] Line 3: Configuration management made easy
5. [PROCESSED] Line 4: Profile-based activation
============================================================

[2026-01-14T...] INFO: Application completed successfully
```

### With Debug Profile
When running with `debug` profile, additional diagnostic information is displayed:
- DebugComponent is activated
- Detailed batch processing logs
- Process information (PID, Node version, platform)
- Active profiles
- Configuration values

## Key Components

### LoggerService
Demonstrates `@Value` decorator usage:
- Injects `logger.level` and `logger.format` from configuration
- Supports multiple log levels (debug, info, warn, error)
- Formats output based on configuration (json or pretty)

### DataProcessorService
Demonstrates both `@Autowired` and `@Value`:
- Injects LoggerService via `@Autowired`
- Injects configuration values via `@Value`
- Processes data in configurable batches

### FileReaderComponent
Demonstrates `ResourceLoader`:
- Reads files from the `resources/` directory
- Lists available resources
- Error handling for missing files

### DebugComponent
Demonstrates `@Profile`:
- Only activated when 'debug' profile is active
- Provides detailed diagnostic information
- Shows how to create environment-specific components

### AppConfiguration
Demonstrates `@Configuration`:
- Centralizes application configuration
- Type-safe configuration access
- Provides computed properties

## Learning Points

1. **No HTTP Dependencies**: This example uses only `@kiqjs/core`, demonstrating that KiqJS is not just for web applications.

2. **Dependency Injection**: All dependencies are automatically resolved and injected by the KiqJS container.

3. **Configuration Management**: Configuration is externalized and can be changed without code modifications.

4. **Profile-Based Behavior**: Different environments can have different configurations and even different components.

5. **Resource Loading**: Files can be loaded from the classpath (resources directory) in a platform-independent way.

6. **Type Safety**: All configuration values and dependencies are type-safe with TypeScript.

## Extending This Example

You can extend this example by:
- Adding more services with complex dependencies
- Creating additional profiles for different environments
- Adding command-line argument parsing
- Implementing more complex data processing logic
- Adding file writing capabilities
- Creating scheduled tasks
- Implementing event-driven architecture

## Related Documentation

- [@kiqjs/core Documentation](../../packages/core/README.md)
- [Configuration Guide](../../packages/core/CONFIGURATION.md)
- [Profiles Guide](../../packages/core/PROFILES.md)
- [Resource Loader Guide](../../packages/core/RESOURCE-LOADER.md)

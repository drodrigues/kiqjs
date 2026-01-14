# Resource Loader (Spring Boot Style)

KiqJS Core provides a `ResourceLoader` class for loading files from the `resources/` directory, similar to Spring Boot's ResourceLoader.

## Features

- 📁 **Automatic Detection**: Auto-detects `resources/` folder
- 📄 **Multiple Formats**: Load text, JSON, YAML, and binary files
- 🔍 **File Checking**: Check if resources exist before loading
- 📋 **Directory Listing**: List files in resource directories
- 🎯 **Type-Safe**: Full TypeScript support with generics
- 🐳 **Docker-Friendly**: Works seamlessly in containerized environments

## Quick Start

### 1. Create Resources Directory

Create a `resources/` directory in your project root (Spring Boot convention):

```
my-project/
  ├── resources/
  │   ├── templates/
  │   │   └── email.html
  │   ├── config/
  │   │   └── settings.json
  │   └── data/
  │       └── users.yml
  ├── src/
  └── package.json
```

### 2. Use ResourceLoader

```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();

// Load text file
const template = loader.getResourceAsString('templates/email.html');

// Load JSON file
const config = loader.getResourceAsJson('config/settings.json');

// Load YAML file
const data = loader.getResourceAsYaml('data/users.yml');

// Check if file exists
if (loader.exists('templates/welcome.html')) {
  const content = loader.getResourceAsString('templates/welcome.html');
}
```

## API Reference

### ResourceLoader

```typescript
class ResourceLoader {
  constructor(baseDir?: string);

  // Get full path to resource
  getResourcePath(resourcePath: string): string;

  // Check if resource exists
  exists(resourcePath: string): boolean;

  // Load as Buffer (binary files)
  getResource(resourcePath: string): Buffer;

  // Load as string (text files)
  getResourceAsString(resourcePath: string, encoding?: BufferEncoding): string;

  // Load as JSON
  getResourceAsJson<T = any>(resourcePath: string): T;

  // Load as YAML
  getResourceAsYaml<T = any>(resourcePath: string): T;

  // List files in directory
  listResources(resourcePath?: string): string[];

  // Get resources directory path
  getResourcesDirectory(): string;
}
```

### Global Instance

```typescript
// Get or create global instance
function getResourceLoader(baseDir?: string): ResourceLoader;

// Reset global instance (useful for testing)
function resetResourceLoader(): void;
```

## Examples

### Loading Templates

```typescript
import { Service } from '@kiqjs/core';
import { ResourceLoader } from '@kiqjs/core';

@Service()
export class EmailService {
  private loader = new ResourceLoader();

  sendWelcomeEmail(username: string, email: string) {
    // Load template from resources/templates/
    const template = this.loader.getResourceAsString('templates/welcome-email.html');

    // Replace placeholders
    const html = template
      .replace('{{username}}', username)
      .replace('{{email}}', email);

    // Send email...
    return html;
  }
}
```

### Loading Configuration Files

```typescript
import { Configuration, Bean } from '@kiqjs/core';
import { ResourceLoader } from '@kiqjs/core';

interface ApiConfig {
  endpoint: string;
  apiKey: string;
  timeout: number;
}

@Configuration()
export class ApiConfiguration {
  private loader = new ResourceLoader();

  @Bean()
  apiConfig(): ApiConfig {
    // Load JSON config from resources/
    return this.loader.getResourceAsJson<ApiConfig>('config/api.json');
  }
}
```

### Loading YAML Data

```typescript
import { ResourceLoader } from '@kiqjs/core';

interface SeedData {
  users: Array<{
    name: string;
    email: string;
  }>;
}

const loader = new ResourceLoader();
const seedData = loader.getResourceAsYaml<SeedData>('data/seed.yml');

seedData.users.forEach(user => {
  console.log(`Creating user: ${user.name}`);
});
```

### Loading Binary Files

```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();

// Load image as Buffer
const imageBuffer = loader.getResource('images/logo.png');

// Load PDF
const pdfBuffer = loader.getResource('documents/manual.pdf');
```

### Checking Resource Existence

```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();

// Check before loading
if (loader.exists('templates/custom-email.html')) {
  const template = loader.getResourceAsString('templates/custom-email.html');
  // Use custom template
} else {
  const template = loader.getResourceAsString('templates/default-email.html');
  // Use default template
}
```

### Listing Resources

```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();

// List all templates
const templates = loader.listResources('templates');
console.log('Available templates:', templates);
// Output: ['welcome-email.html', 'notification.html', 'reset-password.html']

// List all files in resources root
const allResources = loader.listResources();
console.log('Resource directories:', allResources);
// Output: ['templates', 'config', 'data', 'images']
```

### Using Global Instance

```typescript
import { getResourceLoader } from '@kiqjs/core';

// Get global instance (created once, reused everywhere)
const loader = getResourceLoader();
const template = loader.getResourceAsString('templates/email.html');

// Same instance is returned everywhere
const sameLoader = getResourceLoader();
console.log(loader === sameLoader); // true
```

## Directory Detection

The `ResourceLoader` automatically detects the resources directory:

1. **Preferred**: `resources/` folder in project root
2. **Fallback**: Project root (for backward compatibility)

You can also specify a custom directory:

```typescript
const loader = new ResourceLoader('/custom/path/to/resources');
```

## Error Handling

All methods throw errors if resources are not found or cannot be parsed:

```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();

try {
  const config = loader.getResourceAsJson('config/api.json');
} catch (error) {
  if (error.message.includes('Resource not found')) {
    console.error('Config file not found');
  } else if (error.message.includes('Failed to parse JSON')) {
    console.error('Invalid JSON format');
  }
}
```

## Use Cases

### 1. Email Templates

Store HTML email templates in `resources/templates/` and load them dynamically:

```typescript
@Service()
export class EmailService {
  private loader = new ResourceLoader();

  sendEmail(type: string, data: any) {
    const template = this.loader.getResourceAsString(`templates/${type}.html`);
    // Render template with data...
  }
}
```

### 2. Static Configuration

Load static configuration files that don't change at runtime:

```typescript
@Configuration()
export class AppConfiguration {
  private loader = new ResourceLoader();

  @Bean()
  featureFlags() {
    return this.loader.getResourceAsJson('config/features.json');
  }
}
```

### 3. Seed Data

Load initial data for database seeding:

```typescript
@Service()
export class DatabaseSeeder {
  private loader = new ResourceLoader();

  async seed() {
    const users = this.loader.getResourceAsYaml('data/users.yml');
    const products = this.loader.getResourceAsYaml('data/products.yml');
    // Insert into database...
  }
}
```

### 4. Static Assets

Serve static files from resources:

```typescript
@RestController('/assets')
export class AssetsController {
  private loader = new ResourceLoader();

  @GetMapping('/:filename')
  serveAsset(@PathVariable('filename') filename: string) {
    if (!loader.exists(`static/${filename}`)) {
      throw NotFound('Asset not found');
    }
    return loader.getResource(`static/${filename}`);
  }
}
```

### 5. Documentation

Load documentation files:

```typescript
@Service()
export class DocumentationService {
  private loader = new ResourceLoader();

  getHelp(topic: string): string {
    return this.loader.getResourceAsString(`docs/${topic}.md`);
  }

  listTopics(): string[] {
    return this.loader.listResources('docs');
  }
}
```

## Docker Support

The `resources/` folder works seamlessly with Docker:

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy resources
COPY resources/ ./resources/

# Copy app
COPY dist/ ./dist/

CMD ["node", "dist/index.js"]
```

The `ResourceLoader` will automatically detect and use the `resources/` directory in the container.

## Testing

Use `resetResourceLoader()` to reset the global instance between tests:

```typescript
import { ResourceLoader, resetResourceLoader } from '@kiqjs/core';

describe('MyService', () => {
  beforeEach(() => {
    resetResourceLoader();
  });

  it('should load template', () => {
    const loader = new ResourceLoader('./test-resources');
    const template = loader.getResourceAsString('test.html');
    expect(template).toContain('Hello');
  });
});
```

## Best Practices

1. **Organize by Type**: Use subdirectories for different resource types
   ```
   resources/
     ├── templates/    # HTML/email templates
     ├── config/       # Static JSON configs
     ├── data/         # YAML seed data
     ├── static/       # CSS, JS, images
     └── docs/         # Documentation
   ```

2. **Check Existence**: Always check if a resource exists before loading when it's optional
   ```typescript
   if (loader.exists('templates/custom.html')) {
     // Load custom template
   }
   ```

3. **Error Handling**: Wrap resource loading in try-catch for robust error handling
   ```typescript
   try {
     const config = loader.getResourceAsJson('config.json');
   } catch (error) {
     // Handle error or use defaults
   }
   ```

4. **Type Safety**: Use TypeScript generics for type-safe resource loading
   ```typescript
   interface Config {
     apiKey: string;
   }
   const config = loader.getResourceAsJson<Config>('config.json');
   ```

5. **Caching**: Cache loaded resources if they're accessed frequently
   ```typescript
   @Service()
   export class TemplateService {
     private cache = new Map<string, string>();
     private loader = new ResourceLoader();

     getTemplate(name: string): string {
       if (!this.cache.has(name)) {
         this.cache.set(name, this.loader.getResourceAsString(`templates/${name}`));
       }
       return this.cache.get(name)!;
     }
   }
   ```

6. **Environment-Specific**: Use profiles for environment-specific resources
   ```typescript
   const env = process.env.NODE_ENV || 'development';
   const config = loader.getResourceAsJson(`config/database-${env}.json`);
   ```

## Comparison with Spring Boot

KiqJS `ResourceLoader` is inspired by Spring Boot's ResourceLoader:

| Spring Boot | KiqJS |
|------------|-------|
| `ResourceLoader.getResource("classpath:templates/email.html")` | `loader.getResourceAsString('templates/email.html')` |
| `@Value("classpath:config.json")` | `loader.getResourceAsJson('config.json')` |
| `src/main/resources/` | `resources/` |
| `Resource.exists()` | `loader.exists(path)` |
| `Resource.getInputStream()` | `loader.getResource(path)` |

## Migration from Direct File Access

**Before:**
```typescript
import * as fs from 'fs';
import * as path from 'path';

const template = fs.readFileSync(
  path.join(__dirname, '../templates/email.html'),
  'utf-8'
);
```

**After:**
```typescript
import { ResourceLoader } from '@kiqjs/core';

const loader = new ResourceLoader();
const template = loader.getResourceAsString('templates/email.html');
```

Benefits:
- ✅ No more `__dirname` or `path.join()` complexity
- ✅ Automatic `resources/` directory detection
- ✅ Works consistently in development and production
- ✅ Docker-friendly paths
- ✅ Built-in error handling
- ✅ Type-safe with TypeScript

## Related Features

- **Configuration Loader**: For loading YAML configuration files (see [CONFIGURATION.md](./CONFIGURATION.md))
- **Dependency Injection**: Inject ResourceLoader into your services using `@Service()` decorator

import * as fs from 'fs';
import * as path from 'path';

import * as yaml from 'js-yaml';

/**
 * Configuration loader for YAML files (Spring Boot style)
 *
 * Loads configuration with auto-detection:
 * 1. resources/application.yml (base configuration) - preferred
 * 2. resources/application-{profile}.yml (profile-specific)
 * 3. Environment variables (highest priority)
 *
 * Auto-detects resources directory (prefers resources/, falls back to root).
 * Following Spring Boot convention: resources/ for configs/templates, src/ for code.
 *
 * @example
 * // Project structure (Spring Boot style):
 * // my-project/
 * //   ├── resources/               (YAML configs, templates, static files)
 * //   │   ├── application.yml
 * //   │   └── application-production.yml
 * //   ├── src/
 * //   │   └── config/              (TypeScript configuration classes)
 * //   │       └── AppConfig.ts
 * //   ├── package.json
 * //   └── Dockerfile
 *
 * // resources/application.yml
 * server:
 *   port: 3000
 *   host: localhost
 *
 * database:
 *   host: localhost
 *   port: 5432
 *
 * // resources/application-production.yml
 * database:
 *   host: prod-db.example.com
 */
export class ConfigurationLoader {
  private config: Record<string, any> = {};
  private flatConfig: Record<string, any> = {};

  /**
   * Load configuration from YAML files
   *
   * @param baseDir Directory containing configuration files (default: auto-detect)
   * @param profile Active profile (default: process.env.NODE_ENV or 'development')
   */
  constructor(baseDir?: string, profile?: string) {
    const activeProfile = profile || process.env.NODE_ENV || 'development';

    // Auto-detect config directory: prefer config/ folder, fallback to root
    const configDir = baseDir || this.findConfigDirectory();

    // Load base configuration (application.yml)
    this.loadConfigFile(configDir, 'application.yml');
    this.loadConfigFile(configDir, 'application.yaml');

    // Load profile-specific configuration
    this.loadConfigFile(configDir, `application-${activeProfile}.yml`);
    this.loadConfigFile(configDir, `application-${activeProfile}.yaml`);

    // Flatten configuration for easy access
    this.flatConfig = this.flattenObject(this.config);

    // Override with environment variables
    this.overrideWithEnv();
  }

  /**
   * Find configuration directory
   * Tries resources/ first (Spring Boot style), then falls back to project root
   */
  private findConfigDirectory(): string {
    const resourcesDir = path.join(process.cwd(), 'resources');
    if (fs.existsSync(resourcesDir)) {
      return resourcesDir;
    }
    return process.cwd();
  }

  /**
   * Load a configuration file
   */
  private loadConfigFile(baseDir: string, filename: string): void {
    const configPath = path.join(baseDir, filename);

    if (fs.existsSync(configPath)) {
      try {
        const content = fs.readFileSync(configPath, 'utf8');
        const parsed = yaml.load(content) as Record<string, any>;

        if (parsed && typeof parsed === 'object') {
          this.mergeConfig(this.config, parsed);
        }
      } catch (error) {
        console.warn(`Failed to load configuration file: ${configPath}`, error);
      }
    }
  }

  /**
   * Deep merge configuration objects
   */
  private mergeConfig(target: Record<string, any>, source: Record<string, any>): void {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.mergeConfig(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  /**
   * Flatten nested object into dot notation
   *
   * @example
   * { server: { port: 3000 } } => { 'server.port': 3000 }
   */
  private flattenObject(obj: Record<string, any>, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        Object.assign(result, this.flattenObject(obj[key], fullKey));
      } else {
        result[fullKey] = obj[key];
      }
    }

    return result;
  }

  /**
   * Override configuration with environment variables
   *
   * Environment variables use underscore notation and are uppercase
   * @example
   * SERVER_PORT=4000 overrides server.port
   * DATABASE_HOST=localhost overrides database.host
   */
  private overrideWithEnv(): void {
    for (const key in this.flatConfig) {
      // Convert dot notation to uppercase underscore notation
      // server.port => SERVER_PORT
      const envKey = key.toUpperCase().replace(/\./g, '_');

      if (process.env[envKey] !== undefined) {
        // Try to parse as JSON, otherwise use as string
        try {
          this.flatConfig[key] = JSON.parse(process.env[envKey]!);
        } catch {
          this.flatConfig[key] = process.env[envKey];
        }
      }
    }
  }

  /**
   * Get configuration value by key (dot notation)
   *
   * @param key Configuration key in dot notation (e.g., 'server.port')
   * @param defaultValue Default value if key is not found
   * @returns Configuration value or default value
   *
   * @example
   * const port = config.get('server.port', 3000);
   * const dbHost = config.get('database.host', 'localhost');
   */
  get<T = any>(key: string, defaultValue?: T): T {
    const value = this.flatConfig[key];
    return value !== undefined ? value : defaultValue!;
  }

  /**
   * Get all configuration as flat object
   */
  getAll(): Record<string, any> {
    return { ...this.flatConfig };
  }

  /**
   * Get nested configuration object
   *
   * @example
   * const serverConfig = config.getObject('server');
   * // Returns: { port: 3000, host: 'localhost' }
   */
  getObject(key: string): Record<string, any> {
    const prefix = key + '.';
    const result: Record<string, any> = {};

    for (const k in this.flatConfig) {
      if (k.startsWith(prefix)) {
        const subKey = k.substring(prefix.length);
        this.setNestedValue(result, subKey, this.flatConfig[k]);
      }
    }

    return result;
  }

  /**
   * Set a nested value in an object using dot notation
   */
  private setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[keys[keys.length - 1]] = value;
  }

  /**
   * Check if a configuration key exists
   */
  has(key: string): boolean {
    return key in this.flatConfig;
  }
}

/**
 * Global configuration instance
 * Automatically loads configuration on first access
 */
let globalConfig: ConfigurationLoader | null = null;

/**
 * Get or create global configuration instance
 *
 * @param baseDir Directory containing configuration files
 * @param profile Active profile
 * @returns Global configuration instance
 */
export function getConfiguration(baseDir?: string, profile?: string): ConfigurationLoader {
  if (!globalConfig) {
    globalConfig = new ConfigurationLoader(baseDir, profile);
  }
  return globalConfig;
}

/**
 * Reset global configuration (useful for testing)
 */
export function resetConfiguration(): void {
  globalConfig = null;
}

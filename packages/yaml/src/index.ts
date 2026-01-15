import { getConfiguration } from '@kiqjs/core';

/**
 * Server configuration interface
 */
export interface ServerConfig {
  port: number;
  host: string;
  prefix?: string;
}

/**
 * Application metadata interface
 */
export interface AppConfig {
  name: string;
  version: string;
  description?: string;
}

/**
 * Logging configuration interface
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'pretty';
  pretty?: boolean;
}

/**
 * Get server configuration from application.yml
 *
 * @returns Server configuration object
 *
 * @example
 * ```typescript
 * const serverConfig = getServerConfig();
 * console.log(`Server starting on ${serverConfig.host}:${serverConfig.port}`);
 * ```
 */
export function getServerConfig(): ServerConfig {
  const config = getConfiguration();

  return {
    port: config.get<number>('server.port', 3000),
    host: config.get<string>('server.host', 'localhost'),
    prefix: config.get<string>('server.prefix'),
  };
}

/**
 * Get application metadata from application.yml
 *
 * @returns Application configuration object
 *
 * @example
 * ```typescript
 * const appConfig = getAppConfig();
 * console.log(`${appConfig.name} v${appConfig.version}`);
 * ```
 */
export function getAppConfig(): AppConfig {
  const config = getConfiguration();

  return {
    name: config.get<string>('app.name', 'KiqJS Application'),
    version: config.get<string>('app.version', '1.0.0'),
    description: config.get<string>('app.description'),
  };
}

/**
 * Get logging configuration from application.yml
 *
 * @returns Logging configuration object
 *
 * @example
 * ```typescript
 * const loggingConfig = getLoggingConfig();
 * if (loggingConfig.pretty) {
 *   // Use pretty logging
 * }
 * ```
 */
export function getLoggingConfig(): LoggingConfig {
  const config = getConfiguration();

  return {
    level: config.get<'debug' | 'info' | 'warn' | 'error'>('logging.level', 'info'),
    format: config.get<'json' | 'pretty'>('logging.format', 'json'),
    pretty: config.get<boolean>('logging.pretty', false),
  };
}

/**
 * Check if a feature is enabled
 *
 * @param featureName - Name of the feature to check
 * @param defaultValue - Default value if not specified in config
 * @returns True if feature is enabled
 *
 * @example
 * ```typescript
 * if (isFeatureEnabled('features.myFeature')) {
 *   // Feature is enabled
 * }
 * ```
 */
export function isFeatureEnabled(featureName: string, defaultValue = false): boolean {
  const config = getConfiguration();
  return config.get<boolean>(featureName, defaultValue);
}

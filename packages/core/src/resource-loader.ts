import * as fs from 'fs';
import * as path from 'path';

import * as yaml from 'js-yaml';

/**
 * Resource loader for reading files from resources directory (Spring Boot style)
 *
 * Provides convenient methods to load resources from the resources/ folder,
 * similar to Spring Boot's ResourceLoader.
 *
 * Auto-detects resources directory (prefers resources/, falls back to root).
 *
 * @example
 * // Load text file
 * const loader = new ResourceLoader();
 * const content = loader.getResourceAsString('templates/email.html');
 *
 * @example
 * // Load JSON file
 * const config = loader.getResourceAsJson<AppConfig>('config/settings.json');
 *
 * @example
 * // Load YAML file
 * const data = loader.getResourceAsYaml('data/users.yml');
 *
 * @example
 * // Check if resource exists
 * if (loader.exists('templates/welcome.txt')) {
 *   const content = loader.getResourceAsString('templates/welcome.txt');
 * }
 */
export class ResourceLoader {
  private resourcesDir: string;

  /**
   * Create a new ResourceLoader
   *
   * @param baseDir Base directory containing resources (default: auto-detect)
   */
  constructor(baseDir?: string) {
    this.resourcesDir = baseDir || this.findResourcesDirectory();
  }

  /**
   * Find resources directory
   * Tries resources/ first (Spring Boot style), then falls back to project root
   */
  private findResourcesDirectory(): string {
    const resourcesDir = path.join(process.cwd(), 'resources');
    if (fs.existsSync(resourcesDir)) {
      return resourcesDir;
    }
    return process.cwd();
  }

  /**
   * Get the full path to a resource file
   *
   * @param resourcePath Relative path within resources directory
   * @returns Absolute path to the resource file
   *
   * @example
   * const fullPath = loader.getResourcePath('templates/email.html');
   * // Returns: /project/resources/templates/email.html
   */
  getResourcePath(resourcePath: string): string {
    return path.join(this.resourcesDir, resourcePath);
  }

  /**
   * Check if a resource exists
   *
   * @param resourcePath Relative path within resources directory
   * @returns True if the resource exists
   *
   * @example
   * if (loader.exists('templates/email.html')) {
   *   // Resource exists
   * }
   */
  exists(resourcePath: string): boolean {
    const fullPath = this.getResourcePath(resourcePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Get resource as Buffer (for binary files)
   *
   * @param resourcePath Relative path within resources directory
   * @returns Buffer containing the file contents
   * @throws Error if the file does not exist
   *
   * @example
   * const imageBuffer = loader.getResource('images/logo.png');
   */
  getResource(resourcePath: string): Buffer {
    const fullPath = this.getResourcePath(resourcePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Resource not found: ${resourcePath}`);
    }

    return fs.readFileSync(fullPath);
  }

  /**
   * Get resource as string (for text files)
   *
   * @param resourcePath Relative path within resources directory
   * @param encoding File encoding (default: 'utf-8')
   * @returns String containing the file contents
   * @throws Error if the file does not exist
   *
   * @example
   * const template = loader.getResourceAsString('templates/email.html');
   * const css = loader.getResourceAsString('static/styles.css');
   */
  getResourceAsString(resourcePath: string, encoding: BufferEncoding = 'utf-8'): string {
    const buffer = this.getResource(resourcePath);
    return buffer.toString(encoding);
  }

  /**
   * Get resource as JSON object
   *
   * @param resourcePath Relative path within resources directory
   * @returns Parsed JSON object
   * @throws Error if the file does not exist or is not valid JSON
   *
   * @example
   * interface Config {
   *   apiKey: string;
   *   endpoint: string;
   * }
   *
   * const config = loader.getResourceAsJson<Config>('config/api.json');
   */
  getResourceAsJson<T = any>(resourcePath: string): T {
    const content = this.getResourceAsString(resourcePath);

    try {
      return JSON.parse(content) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON from resource: ${resourcePath}. ${error}`);
    }
  }

  /**
   * Get resource as YAML object
   *
   * @param resourcePath Relative path within resources directory
   * @returns Parsed YAML object
   * @throws Error if the file does not exist or is not valid YAML
   *
   * @example
   * const config = loader.getResourceAsYaml('config/database.yml');
   */
  getResourceAsYaml<T = any>(resourcePath: string): T {
    const content = this.getResourceAsString(resourcePath);

    try {
      return yaml.load(content) as T;
    } catch (error) {
      throw new Error(`Failed to parse YAML from resource: ${resourcePath}. ${error}`);
    }
  }

  /**
   * List all files in a resource directory
   *
   * @param resourcePath Relative path within resources directory (default: root)
   * @returns Array of file names (not full paths)
   * @throws Error if the directory does not exist
   *
   * @example
   * const files = loader.listResources('templates');
   * // Returns: ['email.html', 'welcome.txt']
   */
  listResources(resourcePath: string = ''): string[] {
    const fullPath = this.getResourcePath(resourcePath);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Resource directory not found: ${resourcePath}`);
    }

    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) {
      throw new Error(`Resource path is not a directory: ${resourcePath}`);
    }

    return fs.readdirSync(fullPath);
  }

  /**
   * Get the resources directory path
   *
   * @returns Absolute path to the resources directory
   */
  getResourcesDirectory(): string {
    return this.resourcesDir;
  }
}

/**
 * Global resource loader instance
 */
let globalResourceLoader: ResourceLoader | null = null;

/**
 * Get or create global resource loader instance
 *
 * @param baseDir Base directory containing resources
 * @returns Global resource loader instance
 *
 * @example
 * const loader = getResourceLoader();
 * const content = loader.getResourceAsString('templates/email.html');
 */
export function getResourceLoader(baseDir?: string): ResourceLoader {
  if (!globalResourceLoader) {
    globalResourceLoader = new ResourceLoader(baseDir);
  }
  return globalResourceLoader;
}

/**
 * Reset global resource loader (useful for testing)
 */
export function resetResourceLoader(): void {
  globalResourceLoader = null;
}

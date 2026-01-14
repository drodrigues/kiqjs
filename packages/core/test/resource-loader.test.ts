import * as fs from 'fs';
import * as path from 'path';

import { ResourceLoader, getResourceLoader, resetResourceLoader } from '../src/resource-loader';

describe('ResourceLoader', () => {
  const testResourcesDir = path.join(__dirname, 'test-resources');
  const originalCwd = process.cwd();

  beforeEach(() => {
    // Create test resources directory
    if (!fs.existsSync(testResourcesDir)) {
      fs.mkdirSync(testResourcesDir, { recursive: true });
    }

    // Create subdirectory for testing
    const templatesDir = path.join(testResourcesDir, 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Create test files
    fs.writeFileSync(path.join(testResourcesDir, 'test.txt'), 'Hello, World!');
    fs.writeFileSync(
      path.join(testResourcesDir, 'config.json'),
      JSON.stringify({ name: 'test', version: '1.0.0' })
    );
    fs.writeFileSync(
      path.join(testResourcesDir, 'data.yml'),
      'server:\n  port: 3000\n  host: localhost'
    );
    fs.writeFileSync(path.join(templatesDir, 'email.html'), '<h1>Welcome</h1>');

    // Reset global instance
    resetResourceLoader();
  });

  afterEach(() => {
    // Clean up test resources
    if (fs.existsSync(testResourcesDir)) {
      fs.rmSync(testResourcesDir, { recursive: true, force: true });
    }

    // Reset global instance
    resetResourceLoader();

    // Restore original cwd
    process.chdir(originalCwd);
  });

  describe('constructor', () => {
    it('should use provided base directory', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(loader.getResourcesDirectory()).toBe(testResourcesDir);
    });

    it('should auto-detect resources directory', () => {
      // Create resources/ in current directory
      const resourcesDir = path.join(process.cwd(), 'resources');
      fs.mkdirSync(resourcesDir, { recursive: true });

      try {
        const loader = new ResourceLoader();
        expect(loader.getResourcesDirectory()).toBe(resourcesDir);
      } finally {
        fs.rmSync(resourcesDir, { recursive: true, force: true });
      }
    });

    it('should fallback to current directory if resources/ does not exist', () => {
      const loader = new ResourceLoader();
      expect(loader.getResourcesDirectory()).toBe(process.cwd());
    });
  });

  describe('getResourcePath', () => {
    it('should return full path to resource', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const fullPath = loader.getResourcePath('test.txt');
      expect(fullPath).toBe(path.join(testResourcesDir, 'test.txt'));
    });

    it('should handle nested paths', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const fullPath = loader.getResourcePath('templates/email.html');
      expect(fullPath).toBe(path.join(testResourcesDir, 'templates', 'email.html'));
    });
  });

  describe('exists', () => {
    it('should return true if resource exists', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(loader.exists('test.txt')).toBe(true);
    });

    it('should return false if resource does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(loader.exists('nonexistent.txt')).toBe(false);
    });

    it('should work with nested paths', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(loader.exists('templates/email.html')).toBe(true);
      expect(loader.exists('templates/nonexistent.html')).toBe(false);
    });
  });

  describe('getResource', () => {
    it('should read file as Buffer', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const buffer = loader.getResource('test.txt');
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.toString()).toBe('Hello, World!');
    });

    it('should throw error if file does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResource('nonexistent.txt')).toThrow('Resource not found: nonexistent.txt');
    });
  });

  describe('getResourceAsString', () => {
    it('should read file as string', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const content = loader.getResourceAsString('test.txt');
      expect(content).toBe('Hello, World!');
    });

    it('should support custom encoding', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const content = loader.getResourceAsString('test.txt', 'utf-8');
      expect(content).toBe('Hello, World!');
    });

    it('should read HTML files', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const html = loader.getResourceAsString('templates/email.html');
      expect(html).toBe('<h1>Welcome</h1>');
    });

    it('should throw error if file does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResourceAsString('nonexistent.txt')).toThrow(
        'Resource not found: nonexistent.txt'
      );
    });
  });

  describe('getResourceAsJson', () => {
    it('should parse JSON file', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const config = loader.getResourceAsJson('config.json');
      expect(config).toEqual({ name: 'test', version: '1.0.0' });
    });

    it('should support type parameter', () => {
      interface Config {
        name: string;
        version: string;
      }

      const loader = new ResourceLoader(testResourcesDir);
      const config = loader.getResourceAsJson<Config>('config.json');
      expect(config.name).toBe('test');
      expect(config.version).toBe('1.0.0');
    });

    it('should throw error for invalid JSON', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResourceAsJson('test.txt')).toThrow(
        'Failed to parse JSON from resource: test.txt'
      );
    });

    it('should throw error if file does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResourceAsJson('nonexistent.json')).toThrow(
        'Resource not found: nonexistent.json'
      );
    });
  });

  describe('getResourceAsYaml', () => {
    it('should parse YAML file', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const data = loader.getResourceAsYaml('data.yml');
      expect(data).toEqual({
        server: {
          port: 3000,
          host: 'localhost',
        },
      });
    });

    it('should support type parameter', () => {
      interface ServerConfig {
        server: {
          port: number;
          host: string;
        };
      }

      const loader = new ResourceLoader(testResourcesDir);
      const config = loader.getResourceAsYaml<ServerConfig>('data.yml');
      expect(config.server.port).toBe(3000);
      expect(config.server.host).toBe('localhost');
    });

    it('should throw error for invalid YAML', () => {
      // Create invalid YAML file
      fs.writeFileSync(path.join(testResourcesDir, 'invalid.yml'), '{ invalid: yaml: content');

      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResourceAsYaml('invalid.yml')).toThrow(
        'Failed to parse YAML from resource: invalid.yml'
      );
    });

    it('should throw error if file does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.getResourceAsYaml('nonexistent.yml')).toThrow(
        'Resource not found: nonexistent.yml'
      );
    });
  });

  describe('listResources', () => {
    it('should list files in resource directory', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const files = loader.listResources();
      expect(files).toContain('test.txt');
      expect(files).toContain('config.json');
      expect(files).toContain('data.yml');
      expect(files).toContain('templates');
    });

    it('should list files in subdirectory', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const files = loader.listResources('templates');
      expect(files).toContain('email.html');
    });

    it('should throw error if directory does not exist', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.listResources('nonexistent')).toThrow(
        'Resource directory not found: nonexistent'
      );
    });

    it('should throw error if path is not a directory', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(() => loader.listResources('test.txt')).toThrow(
        'Resource path is not a directory: test.txt'
      );
    });
  });

  describe('getResourcesDirectory', () => {
    it('should return resources directory path', () => {
      const loader = new ResourceLoader(testResourcesDir);
      expect(loader.getResourcesDirectory()).toBe(testResourcesDir);
    });
  });

  describe('global instance', () => {
    it('should create global instance with getResourceLoader', () => {
      const loader1 = getResourceLoader(testResourcesDir);
      const loader2 = getResourceLoader(testResourcesDir);
      expect(loader1).toBe(loader2);
    });

    it('should reset global instance with resetResourceLoader', () => {
      const loader1 = getResourceLoader(testResourcesDir);
      resetResourceLoader();
      const loader2 = getResourceLoader(testResourcesDir);
      expect(loader1).not.toBe(loader2);
    });
  });

  describe('real-world usage', () => {
    it('should load email template', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const template = loader.getResourceAsString('templates/email.html');
      expect(template).toContain('<h1>Welcome</h1>');
    });

    it('should load configuration file', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const config = loader.getResourceAsJson('config.json');
      expect(config.name).toBe('test');
    });

    it('should check if resource exists before loading', () => {
      const loader = new ResourceLoader(testResourcesDir);

      if (loader.exists('templates/email.html')) {
        const template = loader.getResourceAsString('templates/email.html');
        expect(template).toContain('Welcome');
      }
    });

    it('should list all templates', () => {
      const loader = new ResourceLoader(testResourcesDir);
      const templates = loader.listResources('templates');
      expect(templates).toContain('email.html');
    });
  });
});

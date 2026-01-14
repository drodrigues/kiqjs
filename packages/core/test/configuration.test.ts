import * as fs from 'fs';
import * as path from 'path';

import { ConfigurationLoader, resetConfiguration } from '../src/configuration';

describe('ConfigurationLoader', () => {
  const testDir = path.join(__dirname, '.test-config');

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    // Reset global configuration
    resetConfiguration();

    // Clear all test environment variables
    delete process.env.SERVER_PORT;
    delete process.env.SERVER_HOST;
    delete process.env.DATABASE_HOST;
    delete process.env.FEATURE_ENABLED;
    delete process.env.FEATURE_COUNT;
    delete process.env.NODE_ENV;
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach((file) => {
        fs.unlinkSync(path.join(testDir, file));
      });
      fs.rmdirSync(testDir);
    }

    // Clear all test environment variables
    delete process.env.SERVER_PORT;
    delete process.env.SERVER_HOST;
    delete process.env.DATABASE_HOST;
    delete process.env.FEATURE_ENABLED;
    delete process.env.FEATURE_COUNT;
    delete process.env.NODE_ENV;

    resetConfiguration();
  });

  describe('Basic configuration loading', () => {
    it('should load configuration from application.yml', () => {
      const yamlContent = `
server:
  port: 3000
  host: localhost

database:
  host: localhost
  port: 5432
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), yamlContent);

      const config = new ConfigurationLoader(testDir);

      expect(config.get('server.port')).toBe(3000);
      expect(config.get('server.host')).toBe('localhost');
      expect(config.get('database.host')).toBe('localhost');
      expect(config.get('database.port')).toBe(5432);
    });

    it('should load configuration from application.yaml', () => {
      const yamlContent = `
app:
  name: MyApp
  version: 1.0.0
`;
      fs.writeFileSync(path.join(testDir, 'application.yaml'), yamlContent);

      const config = new ConfigurationLoader(testDir);

      expect(config.get('app.name')).toBe('MyApp');
      expect(config.get('app.version')).toBe('1.0.0');
    });

    it('should return default value when key does not exist', () => {
      fs.writeFileSync(path.join(testDir, 'application.yml'), 'app:\n  name: Test');

      const config = new ConfigurationLoader(testDir);

      expect(config.get('nonexistent.key', 'default')).toBe('default');
      expect(config.get('another.missing', 123)).toBe(123);
    });
  });

  describe('Profile-specific configuration', () => {
    it('should load and merge profile-specific configuration', () => {
      const baseConfig = `
server:
  port: 3000
  host: localhost

database:
  host: localhost
  port: 5432
`;

      const prodConfig = `
server:
  port: 8080

database:
  host: prod-db.example.com
  password: secret
`;

      fs.writeFileSync(path.join(testDir, 'application.yml'), baseConfig);
      fs.writeFileSync(path.join(testDir, 'application-production.yml'), prodConfig);

      const config = new ConfigurationLoader(testDir, 'production');

      // Profile-specific values override base values
      expect(config.get('server.port')).toBe(8080);
      expect(config.get('database.host')).toBe('prod-db.example.com');

      // Base values are preserved if not overridden
      expect(config.get('server.host')).toBe('localhost');
      expect(config.get('database.port')).toBe(5432);

      // New values from profile are added
      expect(config.get('database.password')).toBe('secret');
    });

    it('should use NODE_ENV for profile when not specified', () => {
      process.env.NODE_ENV = 'test';

      const baseConfig = 'app:\n  env: base';
      const testConfig = 'app:\n  env: test';

      fs.writeFileSync(path.join(testDir, 'application.yml'), baseConfig);
      fs.writeFileSync(path.join(testDir, 'application-test.yml'), testConfig);

      const config = new ConfigurationLoader(testDir);

      expect(config.get('app.env')).toBe('test');
    });
  });

  describe('Environment variable override', () => {
    it('should override configuration with environment variables', () => {
      const yamlContent = `
server:
  port: 3000
  host: localhost
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), yamlContent);

      process.env.SERVER_PORT = '4000';
      process.env.SERVER_HOST = '0.0.0.0';

      const config = new ConfigurationLoader(testDir);

      expect(config.get('server.port')).toBe(4000);
      expect(config.get('server.host')).toBe('0.0.0.0');
    });

    it('should parse JSON values from environment variables', () => {
      const yamlContent = `
feature:
  enabled: false
  count: 10
  tags: []
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), yamlContent);

      process.env.FEATURE_ENABLED = 'true';
      process.env.FEATURE_COUNT = '20';
      process.env.FEATURE_TAGS = '["tag1","tag2"]';

      const config = new ConfigurationLoader(testDir);

      expect(config.get('feature.enabled')).toBe(true);
      expect(config.get('feature.count')).toBe(20);
      expect(config.get('feature.tags')).toEqual(['tag1', 'tag2']);
    });
  });

  describe('Configuration access methods', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  port: 3000
  host: localhost
  ssl:
    enabled: true
    port: 443

database:
  host: localhost
  port: 5432
  credentials:
    username: admin
    password: secret
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), yamlContent);
    });

    it('should get nested configuration object', () => {
      const config = new ConfigurationLoader(testDir);

      const serverConfig = config.getObject('server');
      expect(serverConfig).toEqual({
        port: 3000,
        host: 'localhost',
        ssl: {
          enabled: true,
          port: 443,
        },
      });

      const sslConfig = config.getObject('server.ssl');
      expect(sslConfig).toEqual({
        enabled: true,
        port: 443,
      });
    });

    it('should check if configuration key exists', () => {
      const config = new ConfigurationLoader(testDir);

      expect(config.has('server.port')).toBe(true);
      expect(config.has('server.host')).toBe(true);
      expect(config.has('nonexistent.key')).toBe(false);
    });

    it('should get all configuration as flat object', () => {
      const config = new ConfigurationLoader(testDir);
      const allConfig = config.getAll();

      expect(allConfig['server.port']).toBe(3000);
      expect(allConfig['server.host']).toBe('localhost');
      expect(allConfig['database.port']).toBe(5432);
      expect(allConfig['database.credentials.username']).toBe('admin');
    });
  });

  describe('Edge cases', () => {
    it('should handle missing configuration files gracefully', () => {
      const config = new ConfigurationLoader(testDir);

      expect(config.get('any.key', 'default')).toBe('default');
      expect(config.has('any.key')).toBe(false);
    });

    it('should handle arrays in configuration', () => {
      const yamlContent = `
allowed:
  hosts:
    - localhost
    - example.com
    - api.example.com
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), yamlContent);

      const config = new ConfigurationLoader(testDir);
      const hosts = config.get('allowed.hosts');

      expect(Array.isArray(hosts)).toBe(true);
      expect(hosts).toHaveLength(3);
      expect(hosts).toContain('localhost');
      expect(hosts).toContain('example.com');
    });

    it('should handle invalid YAML gracefully', () => {
      const invalidYaml = `
server:
  port: 3000
    invalid indentation
`;
      fs.writeFileSync(path.join(testDir, 'application.yml'), invalidYaml);

      // Should not throw, just log warning
      expect(() => new ConfigurationLoader(testDir)).not.toThrow();
    });
  });
});

import { getActiveProfiles, isProfileActive } from '../src/profile';
import { getConfiguration, resetConfiguration } from '../src/configuration';
import * as fs from 'fs';
import * as path from 'path';

describe('Profile', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const testResourcesDir = path.join(__dirname, 'test-profile-resources');

  beforeEach(() => {
    // Reset configuration before each test
    resetConfiguration();

    // Clean up test resources
    if (fs.existsSync(testResourcesDir)) {
      fs.rmSync(testResourcesDir, { recursive: true, force: true });
    }

    // Create test resources directory
    fs.mkdirSync(testResourcesDir, { recursive: true });
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    // Reset configuration
    resetConfiguration();

    // Clean up test resources
    if (fs.existsSync(testResourcesDir)) {
      fs.rmSync(testResourcesDir, { recursive: true, force: true });
    }
  });

  describe('getActiveProfiles', () => {
    it('should return default profile when no config or env', () => {
      delete process.env.NODE_ENV;
      const profiles = getActiveProfiles();
      expect(profiles).toEqual(['development']);
    });

    it('should return NODE_ENV as profile', () => {
      process.env.NODE_ENV = 'production';
      const profiles = getActiveProfiles();
      expect(profiles).toEqual(['production']);
    });

    it('should read from kiq.profiles.active in YAML config', () => {
      // Create application.yml with kiq.profiles.active
      const yamlContent = 'kiq:\n  profiles:\n    active: production';
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);

      // Change working directory to test resources
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);

      try {
        // Force reload configuration
        resetConfiguration();
        getConfiguration();

        const profiles = getActiveProfiles();
        expect(profiles).toEqual(['production']);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should support comma-separated profiles', () => {
      // Create application.yml with multiple profiles
      const yamlContent = 'kiq:\n  profiles:\n    active: dev,local,debug';
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);

      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);

      try {
        resetConfiguration();
        getConfiguration();

        const profiles = getActiveProfiles();
        expect(profiles).toEqual(['dev', 'local', 'debug']);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should prioritize kiq.profiles.active over NODE_ENV', () => {
      process.env.NODE_ENV = 'test';

      const yamlContent = 'kiq:\n  profiles:\n    active: production';
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);

      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);

      try {
        resetConfiguration();
        getConfiguration();

        const profiles = getActiveProfiles();
        expect(profiles).toEqual(['production']);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should fallback to NODE_ENV when YAML config not available', () => {
      process.env.NODE_ENV = 'staging';

      // No YAML file created
      const profiles = getActiveProfiles();
      expect(profiles).toEqual(['staging']);
    });
  });

  describe('isProfileActive', () => {
    it('should match single profile', () => {
      process.env.NODE_ENV = 'development';
      expect(isProfileActive('development')).toBe(true);
      expect(isProfileActive('production')).toBe(false);
    });

    it('should match multiple profiles with OR logic', () => {
      process.env.NODE_ENV = 'development';
      expect(isProfileActive(['development', 'test'])).toBe(true);
      expect(isProfileActive(['test', 'production'])).toBe(false);
    });

    it('should support negation with !', () => {
      process.env.NODE_ENV = 'development';
      expect(isProfileActive('!production')).toBe(true);
      expect(isProfileActive('!development')).toBe(false);
    });

    it('should support negation in arrays', () => {
      process.env.NODE_ENV = 'development';
      expect(isProfileActive(['!production', '!staging'])).toBe(true);
    });

    it('should work with multiple active profiles', () => {
      const yamlContent = 'kiq:\n  profiles:\n    active: dev,local';
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);

      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);

      try {
        resetConfiguration();
        getConfiguration();

        expect(isProfileActive('dev')).toBe(true);
        expect(isProfileActive('local')).toBe(true);
        expect(isProfileActive('production')).toBe(false);
        expect(isProfileActive(['dev', 'test'])).toBe(true);
        expect(isProfileActive(['test', 'production'])).toBe(false);
      } finally {
        process.chdir(originalCwd);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty profile expression', () => {
      process.env.NODE_ENV = 'development';
      // This shouldn't crash
      expect(isProfileActive([])).toBe(false);
    });

    it('should handle whitespace in comma-separated profiles', () => {
      const yamlContent = 'kiq:\n  profiles:\n    active: " dev , local , test "';
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);

      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);

      try {
        resetConfiguration();
        getConfiguration();

        const profiles = getActiveProfiles();
        expect(profiles).toEqual(['dev', 'local', 'test']);
        expect(isProfileActive('dev')).toBe(true);
        expect(isProfileActive('local')).toBe(true);
      } finally {
        process.chdir(originalCwd);
      }
    });

    it('should handle case-sensitive profile names', () => {
      process.env.NODE_ENV = 'Development';
      expect(isProfileActive('Development')).toBe(true);
      expect(isProfileActive('development')).toBe(false);
    });
  });
});

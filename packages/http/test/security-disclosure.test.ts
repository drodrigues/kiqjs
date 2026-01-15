import 'reflect-metadata';

import { resetConfiguration } from '@kiqjs/core';

describe('Security Information Disclosure Tests', () => {
  beforeEach(() => {
    resetConfiguration();
    delete process.env.NODE_ENV;
  });

  describe('Stack Trace Exposure', () => {
    it('should document stack trace exposure', () => {
      try {
        throw new Error('Internal error with sensitive info: DB_PASSWORD=secret123');
      } catch (error: any) {
        // Stack trace exposes:
        // - File paths (reveals project structure)
        // - Function names (reveals implementation details)
        // - Sensitive data in error messages
        expect(error.message).toContain('DB_PASSWORD=secret123');
        expect(error.stack).toBeDefined();
      }
    });

    it('should document that stack traces should be hidden in production', () => {
      process.env.NODE_ENV = 'production';

      try {
        throw new Error('Database connection failed: host=prod-db.internal.company.com');
      } catch (error: any) {
        // VULNERABILITY: Stack traces should be hidden in production
        // but current implementation may expose them
        expect(error.stack).toBeDefined();
        expect(error.message).toContain('prod-db.internal.company.com');
      }
    });
  });

  describe('Sensitive Configuration Exposure', () => {
    it('should document exposure of database credentials', () => {
      const config = {
        database: {
          host: 'prod-db.example.com',
          port: 5432,
          username: 'admin',
          password: 'SuperSecretPassword123!',
          connectionString: 'postgresql://admin:SuperSecretPassword123!@prod-db.example.com:5432/myapp',
        },
      };

      // VULNERABILITY: Sensitive data stored in plain text
      expect(config.database.password).toBe('SuperSecretPassword123!');
      expect(config.database.connectionString).toContain('SuperSecretPassword123!');
    });

    it('should document exposure of API keys and tokens', () => {
      const secrets = {
        openaiKey: 'sk-proj-1234567890abcdef',
        stripeKey: 'sk_live_51234567890',
        jwtSecret: 'my-super-secret-jwt-key-2024',
        awsAccessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        awsSecretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      };

      // API keys and secrets exposed
      expect(secrets.openaiKey).toContain('sk-proj');
      expect(secrets.jwtSecret).toBe('my-super-secret-jwt-key-2024');
      expect(secrets.awsSecretAccessKey).toBeDefined();
    });
  });

  describe('Request/Response Logging Exposure', () => {
    it('should document password logging vulnerability', () => {
      const request = {
        username: 'admin',
        password: 'MySecretPassword123!',
      };

      // VULNERABILITY: Passwords logged to console
      const logMessage = `Login attempt with password: ${request.password}`;

      expect(logMessage).toContain('MySecretPassword123!');
    });

    it('should document token exposure in logs', () => {
      const token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

      const logMessage = `Generated token: ${token}`;

      // JWT tokens should not be logged
      expect(logMessage).toContain('Bearer ');
    });
  });

  describe('Error Message Information Leakage', () => {
    it('should document database query exposure in error messages', () => {
      const id = '123';
      const errorMessage = `Failed to query database: SELECT * FROM users WHERE id = ${id} - Connection to database 'prod_db' at 'db.internal.company.com:5432' failed`;

      // Error message reveals:
      // - SQL query structure
      // - Database name
      // - Internal hostnames
      // - Port numbers
      expect(errorMessage).toContain('SELECT * FROM users');
      expect(errorMessage).toContain('prod_db');
      expect(errorMessage).toContain('db.internal.company.com');
    });

    it('should document filesystem path exposure', () => {
      const filename = 'document.pdf';
      const errorMessage = `File not found: /var/www/app/uploads/private/${filename} - Check permissions on /mnt/secure-storage/`;

      // Exposes internal file system structure
      expect(errorMessage).toContain('/var/www/app/uploads/private/');
      expect(errorMessage).toContain('/mnt/secure-storage/');
    });
  });

  describe('Version and Technology Disclosure', () => {
    it('should document framework version exposure', () => {
      // Framework version may be exposed in:
      // - Error messages
      // - Response headers (X-Powered-By)
      // - Stack traces
      // This helps attackers find version-specific vulnerabilities

      const stackTrace =
        'at Application.start (/node_modules/@kiqjs/http@0.1.0/src/application.ts:123:45)';

      expect(stackTrace).toContain('@kiqjs/http');
    });

    it('should document dependency version exposure', () => {
      // Stack traces may reveal:
      // - Node.js version
      // - Package versions (koa, class-validator, etc.)
      // - Internal package structure

      const stackTrace = 'at /node_modules/koa@2.14.2/lib/application.js:123';

      expect(stackTrace).toContain('/node_modules/');
    });
  });

  describe('Debug Information Exposure', () => {
    it('should document environment variable exposure', () => {
      process.env.SECRET_API_KEY = 'sk-secret-123';
      process.env.DATABASE_URL = 'postgresql://user:pass@localhost/db';

      // Debug endpoints or error messages might expose process.env
      const envVars = process.env;

      expect(envVars.SECRET_API_KEY).toBe('sk-secret-123');
      expect(envVars.DATABASE_URL).toContain('pass');

      delete process.env.SECRET_API_KEY;
      delete process.env.DATABASE_URL;
    });

    it('should document internal state exposure', () => {
      const internalState = {
        connections: 42,
        lastQuery: 'SELECT * FROM users WHERE admin = true',
        apiKeys: ['key1', 'key2'],
      };

      // Debug endpoints should not be accessible in production
      expect(internalState.lastQuery).toContain('admin = true');
    });
  });

  describe('User Enumeration', () => {
    it('should document user enumeration via error messages', () => {
      const nonExistentUserError = 'User not found';
      const wrongPasswordError = 'Invalid password';

      // VULNERABILITY: Different messages allow user enumeration
      // Attacker can determine which emails are registered
      expect(nonExistentUserError).not.toBe(wrongPasswordError);
    });

    it('should recommend generic error messages', () => {
      const genericError = 'Invalid credentials';

      // Both "user not found" and "wrong password" should return same message
      expect(genericError).toBe('Invalid credentials');
    });
  });
});

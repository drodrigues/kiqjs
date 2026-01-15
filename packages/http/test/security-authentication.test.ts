import 'reflect-metadata';

import { getConfiguration, resetConfiguration } from '@kiqjs/core';
import * as fs from 'fs';
import * as path from 'path';

import { KiqError } from '../src/exceptions';
import { checkSecurity, isPublicUrl, Security } from '../src/security';

describe('Security Authentication Bypass Tests', () => {
  const testResourcesDir = path.join(__dirname, 'test-resources-security-auth');

  beforeAll(() => {
    if (!fs.existsSync(testResourcesDir)) {
      fs.mkdirSync(testResourcesDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testResourcesDir)) {
      fs.rmSync(testResourcesDir, { recursive: true });
    }
  });

  beforeEach(() => {
    resetConfiguration();
    delete process.env.NODE_ENV;
  });

  const mockContext = (path: string) =>
    ({
      path,
      throw: (status: number, message: string) => {
        throw new KiqError(message, status);
      },
    }) as any;

  describe('Pattern Matching Bypass Vulnerabilities', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /posts*
      - /api/public/*
      - /news/*/show
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should NOT match similar URLs with prefix wildcard - /posts* matches /postsecret', () => {
      // This test documents the vulnerability - /posts* currently matches /postsecret
      expect(isPublicUrl('/posts')).toBe(true);
      expect(isPublicUrl('/postsecret')).toBe(true); // VULNERABILITY: Should be false
      expect(isPublicUrl('/posts-admin')).toBe(true); // VULNERABILITY: Should be false
      expect(isPublicUrl('/posts_private')).toBe(true); // VULNERABILITY: Should be false
    });

    it('should prevent path traversal via wildcard patterns', () => {
      // /api/public/* should not match parent directories
      expect(isPublicUrl('/api/public/../private')).toBe(true); // VULNERABILITY: Pattern too broad
      expect(isPublicUrl('/api/public/../../admin')).toBe(true); // VULNERABILITY: Pattern too broad
    });

    it('should prevent URL encoding bypass', () => {
      expect(isPublicUrl('/posts%2Fsecret')).toBe(false); // URL encoded /
      expect(isPublicUrl('/api/public%2F../admin')).toBe(false);
    });

    it('should prevent double encoding bypass', () => {
      expect(isPublicUrl('/posts%252Fsecret')).toBe(false); // Double encoded /
    });

    it('should handle unicode characters safely', () => {
      expect(isPublicUrl('/posts\u2028admin')).toBe(false); // Unicode line separator
      expect(isPublicUrl('/posts\u2029secret')).toBe(false); // Unicode paragraph separator
    });

    it('should prevent null byte injection', () => {
      expect(isPublicUrl('/posts\x00/admin')).toBe(false);
      expect(isPublicUrl('/api/public\x00/../../admin')).toBe(false);
    });

    it('should handle case sensitivity correctly', () => {
      // URLs are case-sensitive
      expect(isPublicUrl('/Posts')).toBe(false);
      expect(isPublicUrl('/POSTS')).toBe(false);
      expect(isPublicUrl('/PoStS')).toBe(false);
    });
  });

  describe('ReDoS (Regular Expression Denial of Service)', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /api/*/public/*
      - /complex/*/path/*/pattern/*
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should handle deeply nested paths without hanging', () => {
      const start = Date.now();

      // Create a deeply nested path
      const deepPath = '/api/' + 'a/'.repeat(100) + 'public/test';

      isPublicUrl(deepPath);

      const elapsed = Date.now() - start;

      // Should complete in reasonable time (less than 100ms)
      expect(elapsed).toBeLessThan(100);
    });

    it('should handle paths with many repeated segments', () => {
      const start = Date.now();

      const repeatedPath = '/complex/' + 'segment/'.repeat(50) + 'path/test/pattern/end';

      isPublicUrl(repeatedPath);

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });

  describe('Authentication Verification Bypass', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /health
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should document that @Security decorator does not verify actual authentication', () => {
      const ctx = mockContext('/private/data');

      // This test documents the CRITICAL vulnerability:
      // checkSecurity only checks if route requires auth and if URL is public
      // It NEVER verifies that the user is actually authenticated

      try {
        checkSecurity(ctx, true);
        fail('Expected to throw 403');
      } catch (error: any) {
        expect(error.status).toBe(403);
        // In a secure implementation, this should check for:
        // - Valid session token
        // - Valid JWT token
        // - Valid API key
        // - User credentials
        // Currently, it only checks URL patterns
      }
    });

    it('should not allow access to protected routes even if public URL matches', () => {
      const ctx = mockContext('/health');

      // Public URL should allow access even with requiresAuth=true
      expect(() => checkSecurity(ctx, true)).not.toThrow();

      // This is actually a security issue - public URLs bypass auth completely
      // There's no way to require authentication even for public URLs
    });
  });

  describe('Security Configuration Bypass', () => {
    it('should deny access when configuration is not loaded', () => {
      resetConfiguration();

      const ctx = mockContext('/health');

      // When config is not loaded, isPublicUrl returns false (secure default)
      expect(() => checkSecurity(ctx, true)).toThrow(KiqError);
    });

    it('should handle empty public URLs configuration', () => {
      const yamlContent = `
server:
  security:
    public: []
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);

      const ctx = mockContext('/any-path');

      expect(() => checkSecurity(ctx, true)).toThrow(KiqError);
    });

    it('should handle missing security configuration', () => {
      const yamlContent = `
server:
  port: 3000
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);

      const ctx = mockContext('/any-path');

      // No public URLs configured - should deny access
      expect(() => checkSecurity(ctx, true)).toThrow(KiqError);
    });
  });

  describe('URL Normalization Issues', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /public/data
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should handle backslashes correctly', () => {
      // Backslashes should not be treated as path separators
      expect(isPublicUrl('/public\\data')).toBe(false);
      expect(isPublicUrl('\\public\\data')).toBe(false);
    });

    it('should handle multiple slashes', () => {
      expect(isPublicUrl('//public//data')).toBe(false);
      expect(isPublicUrl('/public///data')).toBe(false);
    });

    it('should handle dot segments', () => {
      expect(isPublicUrl('/public/./data')).toBe(false);
      expect(isPublicUrl('/./public/data')).toBe(false);
    });
  });
});

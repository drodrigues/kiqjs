import 'reflect-metadata';

import { getConfiguration, resetConfiguration } from '@kiqjs/core';
import * as fs from 'fs';
import * as path from 'path';

import { KiqError } from '../src/exceptions';
import { checkSecurity, isPublicUrl, requiresAuthentication, Security } from '../src/security';

describe('Security', () => {
  const testResourcesDir = path.join(__dirname, 'test-resources-security');

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

  describe('@Security decorator', () => {
    it('should mark method as requiring authentication', () => {
      class TestController {
        @Security()
        securedMethod() {
          return 'secured';
        }

        publicMethod() {
          return 'public';
        }
      }

      const instance = new TestController();
      expect(requiresAuthentication(instance, 'securedMethod')).toBe(true);
      expect(requiresAuthentication(instance, 'publicMethod')).toBe(false);
    });
  });

  describe('isPublicUrl', () => {
    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /health-check
      - /api/health
      - /public/*
      - /posts*
      - /news/*/show
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should match exact URLs', () => {
      expect(isPublicUrl('/health-check')).toBe(true);
      expect(isPublicUrl('/api/health')).toBe(true);
      expect(isPublicUrl('/other')).toBe(false);
    });

    it('should match prefix wildcards', () => {
      expect(isPublicUrl('/posts')).toBe(true);
      expect(isPublicUrl('/posts/123')).toBe(true);
      expect(isPublicUrl('/posts/abc/def')).toBe(true);
      expect(isPublicUrl('/post')).toBe(false);
    });

    it('should match path wildcards', () => {
      expect(isPublicUrl('/public/anything')).toBe(true);
      expect(isPublicUrl('/public/deep/path')).toBe(true);
      expect(isPublicUrl('/public')).toBe(false); // /public/* requires something after /public/
    });

    it('should match segment wildcards', () => {
      expect(isPublicUrl('/news/123/show')).toBe(true);
      expect(isPublicUrl('/news/abc/show')).toBe(true);
      expect(isPublicUrl('/news/show')).toBe(false);
      expect(isPublicUrl('/news/123/edit')).toBe(false);
    });

    it('should ignore query strings', () => {
      expect(isPublicUrl('/health-check?foo=bar')).toBe(true);
      expect(isPublicUrl('/posts/123?page=1')).toBe(true);
    });

    it('should ignore trailing slashes', () => {
      expect(isPublicUrl('/health-check/')).toBe(true);
      expect(isPublicUrl('/posts/123/')).toBe(true);
    });

    it('should return false when configuration is not loaded', () => {
      resetConfiguration();
      expect(isPublicUrl('/health-check')).toBe(false);
    });
  });

  describe('checkSecurity', () => {
    const mockContext = (path: string) =>
      ({
        path,
        throw: (status: number, message: string) => {
          throw new KiqError(message, status);
        },
      }) as any;

    beforeEach(() => {
      const yamlContent = `
server:
  security:
    public:
      - /health-check
      - /public/*
`;
      fs.writeFileSync(path.join(testResourcesDir, 'application.yml'), yamlContent);
      const originalCwd = process.cwd();
      process.chdir(testResourcesDir);
      getConfiguration();
      process.chdir(originalCwd);
    });

    it('should allow access when route does not require auth', () => {
      const ctx = mockContext('/private/endpoint');
      expect(() => checkSecurity(ctx, false)).not.toThrow();
    });

    it('should allow access when route requires auth but URL is public', () => {
      const ctx = mockContext('/health-check');
      expect(() => checkSecurity(ctx, true)).not.toThrow();
    });

    it('should allow access to public wildcard URLs', () => {
      const ctx = mockContext('/public/anything');
      expect(() => checkSecurity(ctx, true)).not.toThrow();
    });

    it('should deny access when route requires auth and URL is not public', () => {
      const ctx = mockContext('/private/endpoint');
      expect(() => checkSecurity(ctx, true)).toThrow(KiqError);

      try {
        checkSecurity(ctx, true);
      } catch (error: any) {
        expect(error.status).toBe(403);
        expect(error.messages).toEqual(['Forbidden: Authentication required']);
      }
    });
  });
});

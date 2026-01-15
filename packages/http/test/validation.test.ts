import 'reflect-metadata';

import { IsEmail, IsOptional, IsString, MinLength, IsNumber } from '../src/dto';
import { KiqError } from '../src/exceptions';
import { transformAndValidate, DEFAULT_VALIDATOR_OPTIONS } from '../src/validation';

class TestDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsOptional()
  address?: string;
}

describe('Validation', () => {
  describe('transformAndValidate', () => {
    it('should validate and transform valid data', async () => {
      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
      };

      const result = await transformAndValidate(TestDto, plain);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.address).toBe('123 Main St');
    });

    it('should validate optional fields', async () => {
      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = await transformAndValidate(TestDto, plain);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.address).toBeUndefined();
    });

    it('should throw KiqError for invalid name (too short)', async () => {
      const plain = {
        name: 'Jo',
        email: 'john@example.com',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(KiqError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.messages).toBeDefined();
        expect(Array.isArray(error.messages)).toBe(true);
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });

    it('should throw KiqError for invalid email', async () => {
      const plain = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(KiqError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.messages).toBeDefined();
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });

    it('should throw KiqError for multiple validation errors', async () => {
      const plain = {
        name: 'Jo',
        email: 'invalid',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(KiqError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.messages).toBeDefined();
        // Should have errors for both name and email
        expect(error.messages.length).toBeGreaterThan(1);
      }
    });

    it('should throw KiqError for missing required fields', async () => {
      const plain = {
        name: 'John Doe',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(KiqError);
    });

    it('should throw KiqError for null input', async () => {
      await expect(transformAndValidate(TestDto, null)).rejects.toThrow(KiqError);

      try {
        await transformAndValidate(TestDto, null);
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.messages).toEqual(['Request body must be an object']);
      }
    });

    it('should throw KiqError for undefined input', async () => {
      await expect(transformAndValidate(TestDto, undefined)).rejects.toThrow(KiqError);
    });

    it('should strip unknown properties by default', async () => {
      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'should be removed',
      };

      const result = await transformAndValidate(TestDto, plain);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect((result as any).unknownField).toBeUndefined();
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', async () => {
      const plain = {
        name: 'Jo',
        email: 'invalid-email',
      };

      try {
        await transformAndValidate(TestDto, plain);
        fail('Should have thrown KiqError');
      } catch (error: any) {
        expect(error.status).toBe(400);
        expect(error.messages).toBeDefined();
        expect(Array.isArray(error.messages)).toBe(true);
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Configuration from YAML', () => {
    // Mock the configuration module
    let originalRequire: any;
    let mockConfig: any;

    beforeEach(() => {
      // Reset module cache to allow re-importing with different config
      jest.resetModules();

      // Create mock configuration
      mockConfig = {
        has: jest.fn(),
        getObject: jest.fn(),
      };

      // Mock require to return our mock configuration
      originalRequire = require;
      jest.mock('@kiqjs/core', () => ({
        getConfiguration: jest.fn(() => mockConfig),
      }));
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.resetModules();
    });

    it('should use default options when no YAML configuration exists', async () => {
      mockConfig.has.mockReturnValue(false);

      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'should be removed',
      };

      const result = await transformAndValidate(TestDto, plain);

      // Default behavior: whitelist=true, so unknown fields are stripped
      expect((result as any).unknownField).toBeUndefined();
    });

    it('should merge YAML configuration with defaults', async () => {
      // This test validates that the configuration loading mechanism works
      // In practice, the YAML config would be loaded by ConfigurationLoader
      mockConfig.has.mockReturnValue(true);
      mockConfig.getObject.mockReturnValue({
        whitelist: true,
        forbidNonWhitelisted: false,
      });

      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const result = await transformAndValidate(TestDto, plain);

      expect(result).toBeInstanceOf(TestDto);
      expect(result.name).toBe('John Doe');
    });

    it('should allow programmatic options to override YAML configuration', async () => {
      mockConfig.has.mockReturnValue(true);
      mockConfig.getObject.mockReturnValue({
        whitelist: false, // From YAML
      });

      const plain = {
        name: 'John Doe',
        email: 'john@example.com',
        unknownField: 'test',
      };

      // Override with programmatic option: whitelist=true
      const result = await transformAndValidate(TestDto, plain, {
        whitelist: true,
      });

      // Programmatic option takes precedence, so unknown field is stripped
      expect((result as any).unknownField).toBeUndefined();
    });
  });

  describe('Configuration Priority', () => {
    class StrictDto {
      @IsString()
      @MinLength(3)
      name!: string;

      @IsNumber()
      age!: number;
    }

    it('should apply default options when no other config provided', async () => {
      const plain = {
        name: 'John',
        age: 25,
        extra: 'field',
      };

      const result = await transformAndValidate(StrictDto, plain);

      // Default: whitelist=true strips extra fields
      expect((result as any).extra).toBeUndefined();
    });

    it('should allow custom options to override defaults', async () => {
      const plain = {
        name: 'John',
        age: 25,
        extra: 'field',
      };

      const result = await transformAndValidate(StrictDto, plain, {
        whitelist: false, // Allow extra fields
      });

      // With whitelist=false, extra fields are preserved
      expect((result as any).extra).toBe('field');
    });

    it('should validate forbidNonWhitelisted option', async () => {
      const plain = {
        name: 'John',
        age: 25,
        extra: 'field',
      };

      // With forbidNonWhitelisted=true, should throw error for extra fields
      await expect(
        transformAndValidate(StrictDto, plain, {
          whitelist: true,
          forbidNonWhitelisted: true,
        })
      ).rejects.toThrow(KiqError);
    });
  });
});

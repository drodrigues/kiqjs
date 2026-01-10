import 'reflect-metadata';
import { transformAndValidate, formatValidationErrors, HttpError } from '../src/index';
import { IsString, IsEmail, MinLength, IsOptional } from '../src/dto';

class TestDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

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

    it('should throw HttpError for invalid name (too short)', async () => {
      const plain = {
        name: 'Jo',
        email: 'john@example.com',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(HttpError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.httpStatus).toBe(400);
        expect(error.messages).toBeDefined();
        expect(Array.isArray(error.messages)).toBe(true);
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });

    it('should throw HttpError for invalid email', async () => {
      const plain = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(HttpError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.httpStatus).toBe(400);
        expect(error.messages).toBeDefined();
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });

    it('should throw HttpError for multiple validation errors', async () => {
      const plain = {
        name: 'Jo',
        email: 'invalid',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(HttpError);

      try {
        await transformAndValidate(TestDto, plain);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.httpStatus).toBe(400);
        expect(error.messages).toBeDefined();
        // Should have errors for both name and email
        expect(error.messages.length).toBeGreaterThan(1);
      }
    });

    it('should throw HttpError for missing required fields', async () => {
      const plain = {
        name: 'John Doe',
      };

      await expect(transformAndValidate(TestDto, plain)).rejects.toThrow(HttpError);
    });

    it('should throw HttpError for null input', async () => {
      await expect(transformAndValidate(TestDto, null)).rejects.toThrow(HttpError);

      try {
        await transformAndValidate(TestDto, null);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.httpStatus).toBe(400);
        expect(error.messages).toEqual(['Request body must be an object']);
      }
    });

    it('should throw HttpError for undefined input', async () => {
      await expect(transformAndValidate(TestDto, undefined)).rejects.toThrow(HttpError);
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
        fail('Should have thrown HttpError');
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpError);
        expect(error.httpStatus).toBe(400);
        expect(error.messages).toBeDefined();
        expect(Array.isArray(error.messages)).toBe(true);
        expect(error.messages.length).toBeGreaterThan(0);
      }
    });
  });
});

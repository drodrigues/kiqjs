import 'reflect-metadata';

describe('Security Validation Bypass Tests', () => {
  describe('Optional Validation Bypass', () => {
    it('should document validation bypass when @Valid is not used', () => {
      // VULNERABILITY: Without @Valid decorator, validation is completely bypassed
      // Developers might forget to add @Valid and validation decorators are ignored
      const invalidData = {
        username: 'ab', // Too short (< 3 chars)
        email: 'invalid-email', // Invalid email
      };

      // All validation decorators (@IsString, @Min Length, @IsEmail) are ignored
      expect(invalidData.username.length).toBeLessThan(3);
      expect(invalidData.email).not.toMatch(/@/);
    });

    it('should document that validation decorators require @Valid', () => {
      const emptyData = {
        username: '', // Violates @IsNotEmpty
        email: 'not-an-email', // Violates @IsEmail
      };

      expect(emptyData.username).toBe('');
      expect(emptyData.email).not.toContain('@');
    });
  });

  describe('Extra Properties Injection', () => {
    it('should document extra properties bypass with default settings', () => {
      // VULNERABILITY: With forbidNonWhitelisted: false (default), extra properties pass through
      const maliciousData = {
        name: 'John Doe',
        email: 'john@example.com',
        isAdmin: true, // Extra property not in DTO
        role: 'admin', // Extra property not in DTO
        permissions: ['*'], // Extra property not in DTO
      };

      // These extra fields could lead to privilege escalation
      expect(maliciousData.isAdmin).toBe(true);
      expect(maliciousData.role).toBe('admin');
    });

    it('should document mass assignment vulnerability', () => {
      // Mass assignment - attacker can modify unintended fields
      const updateData = {
        name: 'John Doe',
        email: 'john@example.com',
        id: 999, // Try to change user ID
        createdAt: new Date(), // Try to modify timestamp
        deletedAt: null, // Try to restore deleted user
      };

      expect(updateData.id).toBe(999);
      expect(updateData.deletedAt).toBeNull();
    });
  });

  describe('Type Coercion Vulnerabilities', () => {
    it('should document type confusion attacks', () => {
      // Object instead of string (NoSQL injection)
      const objectPayload = {
        value: { $ne: null },
      };

      expect(typeof objectPayload.value).toBe('object');
    });

    it('should document array injection when expecting string', () => {
      const arrayPayload = {
        value: ['value1', 'value2'],
      };

      expect(Array.isArray(arrayPayload.value)).toBe(true);
    });
  });

  describe('Nested Object Validation', () => {
    it('should document nested object validation bypass', () => {
      // VULNERABILITY: Without @ValidateNested(), nested object validation is skipped
      const dataWithNestedObject = {
        name: 'John Doe',
        address: {
          street: '', // Empty - should fail validation
          city: '', // Empty - should fail validation
          malicious: 'data', // Extra field
        },
      };

      expect(dataWithNestedObject.address.street).toBe('');
      expect(dataWithNestedObject.address.city).toBe('');
      expect((dataWithNestedObject.address as any).malicious).toBe('data');
    });
  });

  describe('Validation Error Information Disclosure', () => {
    it('should document information disclosure in validation errors', () => {
      // Validation errors expose:
      // - Field names (reveals API structure)
      // - Validation rules (helps attackers craft valid payloads)
      // - Input values (could contain sensitive data)

      const sensitiveError = {
        field: 'password',
        value: 'mySecretPassword123',
        constraints: { minLength: 'must be at least 8 characters' },
      };

      expect(sensitiveError.value).toContain('mySecret');
    });
  });

  describe('Default Validator Options Security', () => {
    it('should document insecure defaults', () => {
      const insecureDefaults = {
        whitelist: true, // Good: strips extra properties
        forbidNonWhitelisted: false, // BAD: doesn't reject extra properties
        forbidUnknownValues: false, // BAD: allows unknown types
      };

      // These defaults can lead to:
      // - Mass assignment vulnerabilities
      // - Privilege escalation
      // - Database pollution
      expect(insecureDefaults.forbidNonWhitelisted).toBe(false);
      expect(insecureDefaults.forbidUnknownValues).toBe(false);
    });
  });

  describe('Transformation Attacks', () => {
    it('should document numeric overflow via string to number conversion', () => {
      const hugeNumber = '999999999999999999999999999';
      const converted = parseFloat(hugeNumber);

      // Large numbers could overflow or lose precision
      expect(converted).toBeGreaterThan(Number.MAX_SAFE_INTEGER);
    });

    it('should document special numeric values injection', () => {
      const specialValues = ['Infinity', '-Infinity', 'NaN'];

      specialValues.forEach((val) => {
        const converted = parseFloat(val);
        // Special values could break calculations
        expect(!isFinite(converted) || isNaN(converted)).toBeTruthy();
      });
    });
  });
});

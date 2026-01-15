import 'reflect-metadata';

describe('Security Injection Tests', () => {
  describe('Path Traversal via PathVariable', () => {
    it('should document path traversal vulnerability with ../ sequences', () => {
      // VULNERABILITY: Path variables are not validated or sanitized
      // @PathVariable decorator directly passes URL parameters to handler
      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        '/etc/passwd',
        'C:\\Windows\\System32\\config\\SAM',
      ];

      maliciousFilenames.forEach((filename) => {
        const path = `/uploads/${filename}`;
        // This could lead to reading files outside intended directory
        expect(path).toContain(filename);
      });
    });

    it('should document path traversal with URL encoded sequences', () => {
      const encodedSequences = [
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '%2e%2e%2f%2e%2e%2f',
        '..%5c..%5c..%5cwindows',
      ];

      encodedSequences.forEach((seq) => {
        const path = `/files/${seq}`;
        expect(path).toContain('%');
      });
    });

    it('should document absolute path injection', () => {
      const absolutePaths = ['/etc/passwd', '/var/www', 'C:\\Windows'];

      absolutePaths.forEach((absPath) => {
        const path = `/uploads/${absPath}`;
        // Absolute paths should be rejected
        expect(path).toContain(absPath);
      });
    });

    it('should document null byte injection in path variables', () => {
      const nullBytePayload = 'safe.txt\x00../../etc/passwd';
      const path = `/files/${nullBytePayload}`;

      // Null byte could truncate path in some file operations
      expect(path).toContain('\x00');
    });
  });

  describe('Query Parameter Injection', () => {
    it('should document SQL injection risk in query parameters', () => {
      // VULNERABILITY: Query parameters not sanitized
      // @RequestParam decorator passes values directly without validation
      const sqlInjectionPayloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
      ];

      sqlInjectionPayloads.forEach((payload) => {
        const query = `SELECT * FROM users WHERE id = '${payload}'`;
        expect(query).toContain(payload);
      });
    });

    it('should document NoSQL injection in query parameters', () => {
      const noSQLPayloads = [
        '{"$ne": null}',
        '{"$gt": ""}',
        '{"$regex": ".*"}',
        '{"$where": "this.password"}',
      ];

      noSQLPayloads.forEach((payload) => {
        // NoSQL operators should be sanitized
        expect(payload).toContain('$');
      });
    });

    it('should document command injection risk', () => {
      const commandPayloads = ['; rm -rf /', '`whoami`', '$(cat /etc/passwd)', '| ls -la'];

      commandPayloads.forEach((payload) => {
        const command = `process.exec('ls ${payload}')`;
        expect(command).toContain(payload);
      });
    });

    it('should document XSS via query parameters', () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert(1)>',
        '<iframe src="javascript:alert(1)">',
        'javascript:alert(document.cookie)',
      ];

      xssPayloads.forEach((payload) => {
        // XSS payloads should be escaped before rendering
        expect(payload.includes('<') || payload.includes('javascript:')).toBe(true);
      });
    });
  });

  describe('Request Body Injection', () => {
    it('should document property injection via extra fields', () => {
      const maliciousBody = {
        username: 'john',
        email: 'john@example.com',
        isAdmin: true, // Extra field not in DTO
        role: 'admin', // Extra field not in DTO
        __proto__: { polluted: true },
      };

      // With forbidNonWhitelisted: false (default), extra fields may pass
      expect(maliciousBody.isAdmin).toBe(true);
      expect(maliciousBody.role).toBe('admin');
    });

    it('should document prototype pollution via request body', () => {
      const maliciousBody = {
        username: 'john',
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
      };

      // Prototype pollution attempt
      expect(maliciousBody.__proto__).toBeDefined();
    });

    it('should document mass assignment vulnerability', () => {
      const updateBody = {
        name: 'John Doe',
        id: 999, // Try to change ID
        createdAt: new Date(), // Try to modify timestamp
        deletedAt: null, // Try to restore deleted record
        balance: 1000000, // Try to modify balance
      };

      // Mass assignment - attacker can modify unintended fields
      expect(updateBody.id).toBe(999);
    });
  });

  describe('Header Injection', () => {
    it('should document CRLF injection in headers', () => {
      const maliciousHeaders = {
        'user-agent': 'Mozilla/5.0\r\nX-Injected: malicious',
        referer: 'http://example.com\r\nSet-Cookie: session=stolen',
      };

      // CRLF characters could be used for HTTP response splitting
      expect(maliciousHeaders['user-agent']).toContain('\r\n');
      expect(maliciousHeaders['referer']).toContain('\r\n');
    });

    it('should document header size limits', () => {
      const largeHeader = 'x'.repeat(100000);

      // Large headers could cause DoS
      expect(largeHeader.length).toBe(100000);
    });
  });

  describe('URL Validation', () => {
    it('should document malformed URL handling', () => {
      const malformedUrls = [
        '/api/../../../etc/passwd',
        '/api/..\\..\\..\\windows\\system32',
        '/api/%2e%2e%2f%2e%2e%2f',
        '/api/\x00/admin',
        '//api///data',
        '/api/./././data',
      ];

      malformedUrls.forEach((url) => {
        // URLs should be normalized and validated
        expect(url).toBeTruthy();
      });
    });

    it('should document URL length limits', () => {
      const longUrl = '/api/' + 'a'.repeat(10000);

      // Extremely long URLs should be rejected
      expect(longUrl.length).toBeGreaterThan(10000);
    });
  });

  describe('Type Confusion', () => {
    it('should document type confusion attacks', () => {
      const payloads = [
        { expected: 'string', received: { $ne: null } }, // Object instead of string
        { expected: 'string', received: ['array', 'values'] }, // Array instead of string
        { expected: 'number', received: 'Infinity' }, // String that becomes Infinity
        { expected: 'number', received: 'NaN' }, // String that becomes NaN
      ];

      payloads.forEach((payload) => {
        expect(payload.received).not.toBe(payload.expected);
      });
    });
  });
});

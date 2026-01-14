import { Component, Service, Configuration, Bean, Profile } from '../src/decorators';
import { GlobalRegistry } from '../src/registry';
import { Container } from '../src/container';
import { resetConfiguration } from '../src/configuration';

describe('@Profile Decorator', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset registry and configuration
    GlobalRegistry.instance.clear();
    resetConfiguration();
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    // Reset
    GlobalRegistry.instance.clear();
    resetConfiguration();
  });

  describe('decorator order and behavior', () => {
    it('should work when @Profile is after @Service (decorator order bottom-to-top)', () => {
      process.env.NODE_ENV = 'development';

      // Decorators execute bottom-to-top, so @Profile executes first
      @Service()
      @Profile('development')
      class DevService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
      expect(providers[0].token).toBe(DevService);
    });

    it('should not register service when profile does not match', () => {
      process.env.NODE_ENV = 'production';

      @Service()
      @Profile('development')
      class DevService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(0);
    });

    it('should register service with multiple profiles', () => {
      process.env.NODE_ENV = 'test';

      @Service()
      @Profile(['development', 'test'])
      class LocalService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
    });

    it('should support negation profile', () => {
      process.env.NODE_ENV = 'development';

      @Service()
      @Profile('!production')
      class DebugService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
    });

    it('should not register with negation when profile matches', () => {
      process.env.NODE_ENV = 'production';

      @Service()
      @Profile('!production')
      class DebugService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(0);
    });

    it('should register service without @Profile in any profile', () => {
      process.env.NODE_ENV = 'production';

      @Service()
      class AlwaysActiveService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
    });
  });

  describe('with @Configuration', () => {
    it('should register configuration when profile matches', () => {
      process.env.NODE_ENV = 'production';

      @Configuration()
      @Profile('production')
      class ProductionConfig {
        @Bean()
        database() {
          return { type: 'production-db' };
        }
      }

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
      expect(providers[0].token).toBe(ProductionConfig);
    });

    it('should not register configuration when profile does not match', () => {
      process.env.NODE_ENV = 'development';

      @Configuration()
      @Profile('production')
      class ProductionConfig {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(0);
    });
  });

  describe('integration with Container', () => {
    it('should resolve profiled service correctly', () => {
      process.env.NODE_ENV = 'development';

      @Service()
      @Profile('development')
      class DevService {
        getMessage() {
          return 'dev';
        }
      }

      const container = new Container();
      const service = container.get(DevService);
      expect(service.getMessage()).toBe('dev');
    });

    it('should not register service when profile does not match', () => {
      process.env.NODE_ENV = 'production';

      @Service()
      @Profile('development')
      class DevService {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(0);

      // Note: Container has auto-registration fallback, so we only check the registry
    });

    it('should handle multiple services with different profiles', () => {
      process.env.NODE_ENV = 'development';

      @Service()
      @Profile('development')
      class DevService {
        getType() {
          return 'dev';
        }
      }

      @Service()
      @Profile('production')
      class ProdService {
        getType() {
          return 'prod';
        }
      }

      @Service()
      class CommonService {}

      // Check what was registered
      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(2); // DevService and CommonService

      const tokens = providers.map((p) => p.token);
      expect(tokens).toContain(DevService);
      expect(tokens).toContain(CommonService);
      expect(tokens).not.toContain(ProdService);

      // Verify they can be resolved
      const container = new Container();
      const devService = container.get(DevService);
      expect(devService.getType()).toBe('dev');

      const commonService = container.get(CommonService);
      expect(commonService).toBeDefined();
    });
  });

  describe('with @Component variants', () => {
    it('should work with @Component', () => {
      process.env.NODE_ENV = 'test';

      @Component()
      @Profile('test')
      class TestComponent {}

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);
    });
  });

  describe('real-world use cases', () => {
    it('should enable different database configs per profile', () => {
      process.env.NODE_ENV = 'test';

      @Configuration()
      @Profile('test')
      class TestConfig {
        @Bean()
        database() {
          return { host: 'localhost', port: 5432 };
        }
      }

      @Configuration()
      @Profile('production')
      class ProdConfig {
        @Bean()
        database() {
          return { host: 'prod-db.example.com', port: 5432 };
        }
      }

      const providers = GlobalRegistry.instance.list();
      // Only TestConfig should be registered
      expect(providers).toHaveLength(1);
      expect(providers[0].token).toBe(TestConfig);
    });

    it('should allow debug services only in non-production', () => {
      process.env.NODE_ENV = 'development';

      @Service()
      @Profile('!production')
      class DebugLogger {
        log(msg: string) {
          console.log(`[DEBUG] ${msg}`);
        }
      }

      const providers = GlobalRegistry.instance.list();
      expect(providers).toHaveLength(1);

      // Switch to production - create new class to test
      GlobalRegistry.instance.clear();
      process.env.NODE_ENV = 'production';

      @Service()
      @Profile('!production')
      class DebugLogger2 {}

      const prodProviders = GlobalRegistry.instance.list();
      expect(prodProviders).toHaveLength(0);
    });
  });
});

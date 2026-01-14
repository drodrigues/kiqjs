import 'reflect-metadata';

import {
  Bean,
  Component,
  Configuration,
  Controller,
  Inject,
  Named,
  PostConstruct,
  Repository,
  Service,
  Value,
} from '../src/decorators';
import {
  META_BEAN_METHOD,
  META_COMPONENT,
  META_CONFIGURATION,
  META_INJECT_TOKENS,
  META_POST_CONSTRUCT,
  META_QUALIFIERS,
  META_VALUE_KEYS,
} from '../src/metadata-keys';
import { GlobalRegistry } from '../src/registry';

describe('decorators', () => {
  beforeEach(() => {
    GlobalRegistry.instance.clear();
  });

  it('registers @Service with explicit name', () => {
    @Service('myService')
    class MyService {}

    const providers = GlobalRegistry.instance.list();
    expect(providers).toHaveLength(1);
    expect(providers[0].useClass).toBe(MyService);
    expect(providers[0].name).toBe('myService');
    expect(Reflect.getMetadata(META_COMPONENT, MyService)).toEqual({});
  });

  it('registers @Service with automatic bean name from class (camelCase)', () => {
    @Service()
    class PaymentGatewayClient {}

    const [prov] = GlobalRegistry.instance.list();
    expect(prov.name).toBe('paymentGatewayClient');
    expect(prov.scope).toBe('singleton');
  });

  it('supports @Repository and @Controller as aliases of @Component', () => {
    @Repository()
    class UserRepo {}
    @Controller()
    class UserController {}

    const providers = GlobalRegistry.instance.list();
    const repo = providers.find((p) => p.useClass === UserRepo)!;
    const ctrl = providers.find((p) => p.useClass === UserController)!;

    expect(repo.name).toBe('userRepo');
    expect(ctrl.name).toBe('userController');
    expect(Reflect.getMetadata(META_COMPONENT, UserRepo)).toEqual({});
    expect(Reflect.getMetadata(META_COMPONENT, UserController)).toEqual({});
  });

  it('honors scope option via @Component({ scope: "prototype" })', () => {
    @Component({ scope: 'prototype' })
    class PrototypeBean {}
    const [prov] = GlobalRegistry.instance.list();
    expect(prov.scope).toBe('prototype');
  });

  it('merges @Named qualifiers and uses explicit @Service("name") precedence over qualifier', () => {
    @Named('qualA')
    @Named('qualB')
    @Service('explicitName')
    class WithQualifiers {}

    const [prov] = GlobalRegistry.instance.list();
    expect(prov.name).toBe('explicitName');

    const storedQuals: Set<string> = Reflect.getMetadata(META_QUALIFIERS, WithQualifiers);
    expect(storedQuals).toBeDefined();
    expect(storedQuals instanceof Set).toBe(true);
    expect(storedQuals.has('qualA')).toBe(true);
    expect(storedQuals.has('qualB')).toBe(true);
  });

  it('@Inject stores constructor parameter tokens (on class) and property tokens (on prototype)', () => {
    class TokenA {}
    class TokenB {}

    @Service()
    class Target {
      constructor(@Inject(TokenA) _a: TokenA, @Inject(TokenB) _b: TokenB) {}
      @Inject(TokenB) prop!: TokenB;
    }

    const ctorParamTokens: any[] | undefined = Reflect.getMetadata(META_INJECT_TOKENS, Target);
    expect(Array.isArray(ctorParamTokens)).toBe(true);
    expect(ctorParamTokens![0]).toBe(TokenA);

    const injectBag: any = Reflect.getMetadata(META_INJECT_TOKENS, Target.prototype);
    expect(injectBag).toBeDefined();
    expect(injectBag['prop']).toBe(TokenB);
  });

  it('@Value stores value key mapping on prototype', () => {
    @Service()
    class NeedsValue {
      @Value('REPORT_BUCKET')
      bucket!: string;
    }
    const map: Record<string, string> = Reflect.getMetadata(META_VALUE_KEYS, NeedsValue.prototype);
    expect(map).toBeDefined();
    expect(map.bucket).toBe('REPORT_BUCKET');
  });

  it('@PostConstruct stores method name on constructor', () => {
    @Service()
    class LifeCycle {
      @PostConstruct()
      init() {}
    }
    const methodName = Reflect.getMetadata(META_POST_CONSTRUCT, LifeCycle);
    expect(methodName).toBe('init');
  });

  it('@Configuration flag and @Bean methods (default & custom names, scopes)', () => {
    @Configuration()
    class AppConfig {
      @Bean() httpClient() {
        return {};
      }
      @Bean('auditLogger', 'prototype') makeAudit() {
        return {};
      }
    }

    expect(Reflect.getMetadata(META_CONFIGURATION, AppConfig)).toBe(true);

    const beans: Array<{ method: string; name?: string; scope: 'singleton' | 'prototype' }> =
      Reflect.getMetadata(META_BEAN_METHOD, AppConfig) ?? [];

    expect(beans).toHaveLength(2);

    const byMethod = Object.fromEntries(beans.map((b) => [b.method, b]));
    expect(byMethod['httpClient'].name).toBe('httpClient');
    expect(byMethod['httpClient'].scope).toBe('singleton');
    expect(byMethod['makeAudit'].name).toBe('auditLogger');
    expect(byMethod['makeAudit'].scope).toBe('prototype');
  });
});

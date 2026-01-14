import 'reflect-metadata';

import { Container } from '../src/container';
import {
  Bean,
  Component,
  Configuration,
  Inject,
  PostConstruct,
  Service,
  Value,
} from '../src/decorators';
import { GlobalRegistry } from '../src/registry';

describe('Container', () => {
  beforeEach(() => {
    GlobalRegistry.instance.clear();
    delete (process.env as any).REPORT_BUCKET;
  });

  it('resolves by class and by bean name (auto & explicit)', () => {
    @Service('explicitName')
    class A {}

    @Service()
    class PaymentGatewayClient {}

    const ctx = new Container();

    const a1 = ctx.get(A);
    const a2 = ctx.get(A);
    expect(a1).toBe(a2);

    const aByName = ctx.get('explicitName');
    expect(aByName).toBe(a1);

    const pgc = ctx.get('paymentGatewayClient');
    expect(pgc).toBeInstanceOf(PaymentGatewayClient);
  });

  it('supports prototype scope via @Component({ scope: "prototype" })', () => {
    @Component({ scope: 'prototype' })
    class Proto {}

    const ctx = new Container();
    const p1 = ctx.get(Proto);
    const p2 = ctx.get(Proto);
    expect(p1).not.toBe(p2);
  });

  it('injects via constructor and property', () => {
    @Service()
    class Logger {
      log(m: string) {
        return `[L] ${m}`;
      }
    }

    class TokenB {}

    @Service()
    class Target {
      constructor(private logger: Logger) {}
      @Inject(TokenB) prop!: TokenB;

      run() {
        return this.logger.log('ok');
      }
    }

    const ctx = new Container();
    const t = ctx.get(Target);
    expect(t.run()).toBe('[L] ok');
    expect((t as any).prop).toBeInstanceOf(TokenB);
  });

  it('@Value and @PostConstruct are applied on instance creation', () => {
    process.env.REPORT_BUCKET = 's3://bucket-x';

    @Service()
    class NeedsValue {
      @Value('REPORT_BUCKET') bucket!: string;
      ready = false;
      @PostConstruct() init() {
        this.ready = !!this.bucket;
      }
    }

    const ctx = new Container();
    const n = ctx.get(NeedsValue);

    expect(n.bucket).toBe('s3://bucket-x');
    expect(n.ready).toBe(true);
  });

  it('@Configuration + @Bean registers factory beans with default and custom names', () => {
    @Service()
    class Dep {}

    @Configuration()
    class AppConfig {
      @Bean() httpClient() {
        return { get: (u: string) => `GET ${u}` };
      }
      @Bean('auditor', 'prototype') makeAudit() {
        return { audit: (x: any) => x };
      }
      @Bean('withDep') withDepFactory(ctx: Container) {
        return { dep: ctx.get(Dep) };
      }
    }

    const ctx = new Container();

    const http = ctx.get('httpClient') as any;
    expect(http.get('/ping')).toBe('GET /ping');

    const a1 = ctx.get('auditor');
    const a2 = ctx.get('auditor');
    expect(a1).not.toBe(a2);

    const wd = ctx.get('withDep') as any;
    expect(wd.dep).toBeInstanceOf(Dep);
  });
});

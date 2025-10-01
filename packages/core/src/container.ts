import 'reflect-metadata';

import {
  META_BEAN_METHOD,
  META_CONFIGURATION,
  META_INJECT_TOKENS,
  META_POST_CONSTRUCT,
  META_VALUE_KEYS,
} from './metadata-keys';
import { GlobalRegistry } from './registry';
import { Newable, Provider, Scope, Token, ValueSource } from './types';

class DefaultEnvSource implements ValueSource {
  get(key: string) {
    return process.env[key];
  }
}
type InstanceCache = Map<Token, any>;

export class Container {
  private providers: Provider[] = [];
  private singletons: InstanceCache = new Map();
  private building: Set<Token> = new Set();
  private values: ValueSource;

  constructor(opts?: { providers?: Provider[]; valueSource?: ValueSource }) {
    this.values = opts?.valueSource ?? new DefaultEnvSource();
    this.providers = [...GlobalRegistry.instance.list(), ...(opts?.providers ?? [])];
    this.bootstrapConfigurations();
  }

  private bootstrapConfigurations() {
    const configs = this.providers.filter(
      (p) => p.useClass && Reflect.getMetadata(META_CONFIGURATION, p.useClass)
    );
    for (const cfgProv of configs) {
      const cfgInstance = this.get(cfgProv.token);
      const klass = cfgProv.useClass!;
      const beans: Array<{ method: string; name?: string; scope: Scope }> =
        Reflect.getMetadata(META_BEAN_METHOD, klass) ?? [];
      for (const { method, name, scope } of beans) {
        const factory = (cfgInstance as any)[method].bind(cfgInstance);
        this.providers.push({
          token: name ?? Symbol(String(method)),
          useFactory: (ctx: Container) => factory(ctx),
          scope,
          name,
        } as Provider);
      }
    }
  }

  get<T>(token: Token<T>, qualifiers?: string | string[]): T {
    const qset = new Set(Array.isArray(qualifiers) ? qualifiers : qualifiers ? [qualifiers] : []);
    const candidates = this.providers.filter((p) => p.token === token || p.useClass === token);
    let provider: Provider | undefined = candidates.find((p) => {
      if (!qset.size) return true;
      const quals = p.qualifiers ?? new Set();
      return Array.from(qset).every((q) => quals.has(q));
    });

    if (!provider && typeof token === 'string')
      provider = this.providers.find((p) => p.name === token);

    if (!provider && typeof token === 'function') {
      const typed = this.providers.filter(
        (p) => p.useClass && p.useClass.prototype instanceof (token as Newable)
      );
      provider = typed.find(
        (p) => !qset.size || Array.from(qset).every((q) => (p.qualifiers ?? new Set()).has(q))
      );
    }

    if (!provider) {
      if (typeof token === 'function') {
        provider = {
          token,
          useClass: token,
          scope: 'singleton',
          name: token.name ? token.name.charAt(0).toLowerCase() + token.name.slice(1) : undefined,
        };
        this.providers.push(provider);
      } else {
        throw new Error(
          `No provider for token: ${String(token)}${
            qset.size ? ` (qualifiers: ${Array.from(qset).join(',')})` : ''
          }`
        );
      }
    }
    return this.instantiate(provider);
  }

  private instantiate<T>(provider: Provider<T>): T {
    const scope = provider.scope ?? 'singleton';
    if (scope === 'singleton' && this.singletons.has(provider.token))
      return this.singletons.get(provider.token);
    if (this.building.has(provider.token)) {
      return new Proxy(
        {},
        {
          get: (_t, prop) => {
            const real = this.singletons.get(provider.token);
            if (!real) throw new Error(`Circular dependency: ${String(provider.token)} not ready`);
            return (real as any)[prop];
          },
        }
      ) as T;
    }

    this.building.add(provider.token);
    let instance: any;
    if (provider.useValue !== undefined) instance = provider.useValue;
    else if (provider.useFactory) instance = provider.useFactory(this);
    else if (provider.useClass) instance = this.constructClass(provider.useClass);
    else throw new Error(`Invalid provider for token: ${String(provider.token)}`);

    this.applyValueInjection(instance);
    this.callPostConstruct(instance, provider.useClass);
    if (scope === 'singleton') this.singletons.set(provider.token, instance);
    this.building.delete(provider.token);
    return instance;
  }

  private constructClass<T>(klass: Newable<T>): T {
    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', klass) || [];
    const explicit: (Token | undefined)[] =
      Reflect.getMetadata(META_INJECT_TOKENS, klass.prototype) || [];

    const args = paramTypes.map((pt, idx) => this.get(explicit[idx] ?? pt));
    const instance = new klass(...args);
    const injectMap: Record<string, Token> =
      Reflect.getMetadata(META_INJECT_TOKENS, klass.prototype) || {};
    for (const [prop, tok] of Object.entries(injectMap)) {
      if (!Number.isInteger(Number(prop))) (instance as any)[prop] = this.get(tok);
    }
    return instance;
  }

  private applyValueInjection(instance: any) {
    const proto = Object.getPrototypeOf(instance);
    const map: Record<string, string> = Reflect.getMetadata(META_VALUE_KEYS, proto) || {};
    for (const [prop, key] of Object.entries(map)) {
      const v = this.values.get(key);
      if (v === undefined) throw new Error(`@Value missing for key ${key}`);
      (instance as any)[prop] = v;
    }
  }

  private callPostConstruct(instance: any, klass?: Function) {
    if (!klass) return;
    const methodName: string | undefined = Reflect.getMetadata(META_POST_CONSTRUCT, klass);
    if (methodName && typeof instance[methodName] === 'function') instance[methodName]();
  }
}

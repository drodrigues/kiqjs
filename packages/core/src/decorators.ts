import 'reflect-metadata';

import {
  META_BEAN_METHOD,
  META_COMPONENT,
  META_CONFIGURATION,
  META_INJECT_TOKENS,
  META_POST_CONSTRUCT,
  META_PROFILE,
  META_QUALIFIERS,
  META_VALUE_KEYS,
} from './metadata-keys';
import { shouldActivateComponent } from './profile';
import { GlobalRegistry } from './registry';
import { ComponentOptions, Newable, Provider, Token } from './types';

function defaultBeanNameFromClass(target: Function): string {
  const raw = target.name || 'anonymous';
  return raw.charAt(0).toLowerCase() + raw.slice(1);
}

export function Component(nameOrOptions?: string | ComponentOptions) {
  return function <T extends Newable>(target: T) {
    const options: ComponentOptions | undefined =
      typeof nameOrOptions === 'object' ? nameOrOptions : undefined;
    Reflect.defineMetadata(META_COMPONENT, options ?? {}, target);

    // Check if component should be active based on @Profile
    const profileMetadata: string | string[] | undefined = Reflect.getMetadata(META_PROFILE, target);
    if (!shouldActivateComponent(profileMetadata)) {
      // Component not active in current profile, skip registration
      return;
    }

    const quals: Set<string> = Reflect.getMetadata(META_QUALIFIERS, target) ?? new Set();

    let name: string | undefined;
    let scope: 'singleton' | 'prototype' = 'singleton';
    if (typeof nameOrOptions === 'string') name = nameOrOptions;
    else if (options) {
      name = options.name;
      scope = options.scope ?? 'singleton';
    }

    const firstQualifier = quals.values().next().value as string | undefined;
    const resolvedName = name ?? firstQualifier ?? defaultBeanNameFromClass(target);

    GlobalRegistry.instance.register({
      token: target,
      useClass: target,
      scope,
      name: resolvedName,
      qualifiers: quals,
    } as Provider);
  };
}
export const Service = Component;
export const Repository = Component;
export const Controller = Component;

export function Named(name: string) {
  return function (target: any) {
    const existing: Set<string> = Reflect.getMetadata(META_QUALIFIERS, target) ?? new Set();
    existing.add(name);
    Reflect.defineMetadata(META_QUALIFIERS, existing, target);
  };
}
export const Qualifier = Named;

export function Inject(token?: Token) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      const existing: (Token | undefined)[] = Reflect.getMetadata(META_INJECT_TOKENS, target) ?? [];
      existing[parameterIndex] = token;
      Reflect.defineMetadata(META_INJECT_TOKENS, existing, target);
    } else if (propertyKey !== undefined) {
      const type = Reflect.getMetadata('design:type', target, propertyKey);
      Reflect.defineMetadata(
        META_INJECT_TOKENS,
        {
          ...(Reflect.getMetadata(META_INJECT_TOKENS, target) || {}),
          [String(propertyKey)]: token ?? type,
        },
        target
      );
    }
  };
}

export function Value(key: string) {
  return function (target: any, propertyKey: string) {
    const existing: Record<string, string> = Reflect.getMetadata(META_VALUE_KEYS, target) ?? {};
    existing[propertyKey] = key;
    Reflect.defineMetadata(META_VALUE_KEYS, existing, target);
  };
}

export function PostConstruct() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(META_POST_CONSTRUCT, propertyKey, target.constructor);
  };
}

export function Configuration() {
  return function <T extends Newable>(target: T) {
    Reflect.defineMetadata(META_CONFIGURATION, true, target);

    // Check if configuration should be active based on @Profile
    const profileMetadata: string | string[] | undefined = Reflect.getMetadata(META_PROFILE, target);
    if (!shouldActivateComponent(profileMetadata)) {
      // Configuration not active in current profile, skip registration
      return;
    }

    GlobalRegistry.instance.register({
      token: target,
      useClass: target,
      scope: 'singleton',
      name: defaultBeanNameFromClass(target),
    } as Provider);
  };
}

export function Bean(name?: string, scope: 'singleton' | 'prototype' = 'singleton') {
  return function (_target: any, propertyKey: string) {
    const ctor = _target.constructor;
    const beans: Array<{ method: string; name?: string; scope: 'singleton' | 'prototype' }> =
      Reflect.getMetadata(META_BEAN_METHOD, ctor) ?? [];
    beans.push({ method: propertyKey, name: name ?? propertyKey, scope });
    Reflect.defineMetadata(META_BEAN_METHOD, beans, ctor);
  };
}

/**
 * Profile decorator
 *
 * Marks a component to be active only in specific profiles.
 * The active profile is determined by:
 * 1. kiq.profiles.active in application.yml
 * 2. NODE_ENV environment variable
 * 3. 'development' (default)
 *
 * @param profiles Profile name(s) - string or array of strings
 *                 Supports negation with '!' prefix (e.g., '!prod' = all except prod)
 *
 * @example
 * // Active only in 'development' profile
 * @Profile('development')
 * @Service()
 * class DevService {}
 *
 * @example
 * // Active in 'development' or 'test' profiles
 * @Profile(['development', 'test'])
 * @Service()
 * class LocalService {}
 *
 * @example
 * // Active in all profiles except 'production'
 * @Profile('!production')
 * @Service()
 * class DebugService {}
 *
 * @example
 * // Configuration with profile
 * @Profile('production')
 * @Configuration()
 * class ProductionConfig {
 *   @Bean()
 *   database() {
 *     return new ProductionDatabase();
 *   }
 * }
 */
export function Profile(profiles: string | string[]) {
  return function (target: any) {
    Reflect.defineMetadata(META_PROFILE, profiles, target);
  };
}

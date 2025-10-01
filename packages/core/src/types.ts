export type Newable<T = any> = new (...args: any[]) => T;

export type Token<T = any> = string | symbol | Newable<T>;

export type Scope = 'singleton' | 'prototype';

export interface Container {
  get<T>(token: Token<T>, qualifiers?: string | string[]): T;
}

export interface Provider<T = any> {
  token: Token<T>;
  useClass?: Newable<T>;
  useValue?: T;
  useFactory?: (ctx: Container) => T;
  scope?: Scope;
  qualifiers?: Set<string>;
  name?: string;
}

export interface ComponentOptions {
  name?: string;
  scope?: Scope;
}

export interface ValueSource {
  get(key: string): string | undefined;
}

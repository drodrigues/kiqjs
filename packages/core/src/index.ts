import 'reflect-metadata';

export { Container } from './container';
export {
  Component,
  Service,
  Repository,
  Controller,
  Named,
  Qualifier,
  Inject,
  Value,
  PostConstruct,
  Configuration,
  Bean,
} from './decorators';
export type { Token, Scope, ComponentOptions, ValueSource, Newable } from './types';
export { scanAndRegister } from './scanner';
export { KiqApplication, runApplication } from './application';

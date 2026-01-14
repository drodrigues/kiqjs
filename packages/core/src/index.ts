import 'reflect-metadata';

export { ConfigurationLoader, getConfiguration, resetConfiguration } from './configuration';
export { ResourceLoader, getResourceLoader, resetResourceLoader } from './resource-loader';
export { Container } from './container';
export { GlobalRegistry } from './registry';
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

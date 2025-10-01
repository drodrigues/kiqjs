import 'reflect-metadata';

import { Container } from './container';
import { scanAndRegister } from './scanner';

const META_APP = Symbol('kiq:application');
export interface KiqApplicationOptions {
  scan?: string;
}

export function KiqApplication(options: KiqApplicationOptions = {}) {
  return function (target: Function) {
    Reflect.defineMetadata(META_APP, options, target);
  };
}

export async function runApplication<T>(appClass: new () => T): Promise<Container> {
  const opts: KiqApplicationOptions = Reflect.getMetadata(META_APP, appClass) ?? {};
  if (opts.scan) await scanAndRegister(opts.scan);
  return new Container();
}

import { Provider } from './types';

export class GlobalRegistry {
  private static _i = new GlobalRegistry();

  static get instance() {
    return this._i;
  }

  private providers: Provider[] = [];

  register(p: Provider) {
    this.providers.push(p);
  }

  list(): Provider[] {
    return this.providers.slice();
  }

  clear() {
    this.providers = [];
  }
}

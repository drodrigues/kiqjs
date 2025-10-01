import { GlobalRegistry } from '../src/registry';
import { Provider } from '../src/types';

describe('GlobalRegistry', () => {
  let registry: GlobalRegistry;

  beforeEach(() => {
    GlobalRegistry.instance.clear();
    registry = GlobalRegistry.instance;
  });

  it('should return the singleton instance', () => {
    const r1 = GlobalRegistry.instance;
    const r2 = GlobalRegistry.instance;
    expect(r1).toBe(r2);
  });

  it('should register and list providers', () => {
    const provider: Provider = {
      token: 'MyService',
      useValue: { hello: 'world' },
    };

    registry.register(provider);
    const list = registry.list();

    expect(list).toHaveLength(1);
    expect(list[0].token).toBe('MyService');
    expect((list[0].useValue as any).hello).toBe('world');
  });

  it('should return a shallow copy from list()', () => {
    const provider: Provider = { token: 'A', useValue: 123 };
    registry.register(provider);

    const list1 = registry.list();
    const list2 = registry.list();

    expect(list1).not.toBe(list2);
    expect(list1[0]).toEqual(list2[0]);
  });

  it('should clear providers', () => {
    const provider: Provider = { token: 'B', useValue: 456 };
    registry.register(provider);
    expect(registry.list()).toHaveLength(1);

    registry.clear();
    expect(registry.list()).toHaveLength(0);
  });
});

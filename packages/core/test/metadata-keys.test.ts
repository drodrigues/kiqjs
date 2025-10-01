import * as Keys from '../src/metadata-keys';

describe('metadata-keys', () => {
  const {
    META_COMPONENT,
    META_QUALIFIERS,
    META_INJECT_TOKENS,
    META_VALUE_KEYS,
    META_POST_CONSTRUCT,
    META_BEAN_METHOD,
    META_CONFIGURATION,
  } = Keys as Record<string, symbol>;

  it('should export symbols', () => {
    expect(typeof META_COMPONENT).toBe('symbol');
    expect(typeof META_QUALIFIERS).toBe('symbol');
    expect(typeof META_INJECT_TOKENS).toBe('symbol');
    expect(typeof META_VALUE_KEYS).toBe('symbol');
    expect(typeof META_POST_CONSTRUCT).toBe('symbol');
    expect(typeof META_BEAN_METHOD).toBe('symbol');
    expect(typeof META_CONFIGURATION).toBe('symbol');
  });

  it('should have correct descriptions', () => {
    expect(META_COMPONENT.description).toBe('component');
    expect(META_QUALIFIERS.description).toBe('qualifiers');
    expect(META_INJECT_TOKENS.description).toBe('inject:tokens');
    expect(META_VALUE_KEYS.description).toBe('value:keys');
    expect(META_POST_CONSTRUCT.description).toBe('postconstruct');
    expect(META_BEAN_METHOD.description).toBe('bean:method');
    expect(META_CONFIGURATION.description).toBe('configuration');
  });

  it('should be unique across all keys', () => {
    const all = [
      META_COMPONENT,
      META_QUALIFIERS,
      META_INJECT_TOKENS,
      META_VALUE_KEYS,
      META_POST_CONSTRUCT,
      META_BEAN_METHOD,
      META_CONFIGURATION,
    ];
    const set = new Set(all);
    expect(set.size).toBe(all.length);
  });

  it('should keep the same reference across imports (module cache)', () => {
    // @ts-ignore
    const again = require('../src/metadata-keys') as typeof Keys;

    expect(again.META_COMPONENT).toBe(META_COMPONENT);
    expect(again.META_QUALIFIERS).toBe(META_QUALIFIERS);
    expect(again.META_INJECT_TOKENS).toBe(META_INJECT_TOKENS);
    expect(again.META_VALUE_KEYS).toBe(META_VALUE_KEYS);
    expect(again.META_POST_CONSTRUCT).toBe(META_POST_CONSTRUCT);
    expect(again.META_BEAN_METHOD).toBe(META_BEAN_METHOD);
    expect(again.META_CONFIGURATION).toBe(META_CONFIGURATION);
  });
});

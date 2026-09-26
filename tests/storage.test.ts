import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { loadEra } from '../src/game/storage';

const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
const values = new Map<string, string>();
Object.defineProperty(globalThis, 'window', {
  configurable: true,
  value: {
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    },
  },
});

after(() => {
  if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
  else Reflect.deleteProperty(globalThis, 'window');
});

test('saved era validation rejects inherited object keys and accepts real eras', () => {
  values.set('broadside.era.v1', 'roman');
  assert.equal(loadEra(), 'roman');

  for (const invalid of ['toString', 'constructor', '__proto__', 'not-an-era']) {
    values.set('broadside.era.v1', invalid);
    assert.equal(loadEra(), null, `expected ${invalid} to be rejected`);
  }
});

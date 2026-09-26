import { test } from 'node:test';
import assert from 'node:assert/strict';
import i18n, { loadLocale, saveLocale, setLocale, fmt } from '../src/i18n/index.ts';

test('i18n initializes and changes language without browser globals', () => {
  assert.equal(typeof document, 'undefined');
  assert.equal(typeof window, 'undefined');
  assert.equal(i18n.isInitialized, true);
  assert.equal(loadLocale(), 'en');
  try {
    assert.doesNotThrow(() => saveLocale('nl'));
    assert.doesNotThrow(() => setLocale('nl'));
    assert.equal(i18n.language, 'nl');
    assert.equal(i18n.t('meta:language'), 'Taal');
    assert.equal(fmt(1234), (1234).toLocaleString('nl-NL'));
  } finally {
    setLocale('en');
  }
});

test('saving and selecting a locale still update browser storage and document language', () => {
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const previousDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const values = new Map<string, string>();
  const root = { lang: 'en-US' };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
      navigator: { language: 'en-US' },
    },
  });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { documentElement: root },
  });
  try {
    saveLocale('nl');
    assert.equal(root.lang, 'nl-NL');
    assert.equal(loadLocale(), 'nl');
    setLocale('ja');
    assert.equal(root.lang, 'ja-JP');
    assert.equal(loadLocale(), 'ja');
    assert.equal(i18n.language, 'ja');

    window.localStorage.setItem = () => { throw new Error('Storage blocked'); };
    assert.doesNotThrow(() => setLocale('fr'));
    assert.equal(root.lang, 'fr-FR');
    assert.equal(i18n.language, 'fr');
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, 'window', previousWindow);
    else Reflect.deleteProperty(globalThis, 'window');
    if (previousDocument) Object.defineProperty(globalThis, 'document', previousDocument);
    else Reflect.deleteProperty(globalThis, 'document');
    setLocale('en');
  }
});

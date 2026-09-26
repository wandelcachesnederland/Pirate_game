/** i18next setup: one namespace per dictionary, persisted locale, number helper. */
import i18n, { type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { meta, type LocaleId } from './dict/meta';
import { common } from './dict/common';
import { menu } from './dict/menu';
import { screens } from './dict/screens';
import { peril } from './dict/peril';
import { upgrades } from './dict/upgrades';
import { eras } from './dict/eras';
import { traits } from './dict/traits';
import { armaments } from './dict/armaments';
import { fittings } from './dict/fittings';
import { regions } from './dict/regions';
import { rosters } from './dict/rosters';
import { ships } from './dict/ships';
import { trade } from './dict/trade';
import { adventure } from './dict/adventure';
import { hud } from './dict/hud';
import { hero } from './dict/hero';

export type { LocaleId };
export const LOCALES: LocaleId[] = ['en', 'es', 'fr', 'de', 'nl', 'pt', 'ja'];

/** Each language's own name, for the picker. */
export const LOCALE_NAMES: Record<LocaleId, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  nl: 'Nederlands',
  pt: 'Português',
  ja: '日本語',
};

/** BCP-47 tags for locale-aware number formatting. */
export const LOCALE_BCP47: Record<LocaleId, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  nl: 'nl-NL',
  pt: 'pt-PT',
  ja: 'ja-JP',
  zh: 'zh-CN',
  id: 'id-ID',
  th: 'th-TH',
  vi: 'vi-VN',
};

const dicts = {
  meta, common, menu, screens, peril, upgrades, eras, traits,
  armaments, fittings, regions, rosters, ships, trade, adventure, hud, hero,
};

export const NAMESPACES = Object.keys(dicts);

const resources = Object.fromEntries(
  LOCALES.map((lng) => [
    lng,
    Object.fromEntries(Object.entries(dicts).map(([ns, d]) => [ns, (d as Record<LocaleId, unknown>)[lng]])),
  ]),
) as unknown as Resource;

const LANG_KEY = 'broadside.lang.v1';

export function loadLocale(): LocaleId {
  try {
    const raw = window.localStorage.getItem(LANG_KEY);
    if (raw && (LOCALES as string[]).includes(raw)) return raw as LocaleId;
    const nav = (window.navigator.language || 'en').slice(0, 2).toLowerCase();
    if ((LOCALES as string[]).includes(nav)) return nav as LocaleId;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function saveLocale(lng: LocaleId) {
  try {
    window.localStorage.setItem(LANG_KEY, lng);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = LOCALE_BCP47[lng];
}

void i18n.use(initReactI18next).init({
  resources,
  lng: loadLocale(),
  fallbackLng: 'en',
  ns: NAMESPACES,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

document.documentElement.lang = LOCALE_BCP47[i18n.language as LocaleId] ?? 'en-US';

export function setLocale(lng: LocaleId) {
  saveLocale(lng);
  void i18n.changeLanguage(lng);
}

/** Locale-aware thousands grouping for scores, gold, prices. */
export function fmt(n: number): string {
  const lng = (i18n.language as LocaleId) || 'en';
  return n.toLocaleString(LOCALE_BCP47[lng] ?? 'en-US');
}

export default i18n;

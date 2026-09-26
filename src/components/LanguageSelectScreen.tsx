import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { LOCALES, LOCALE_NAMES, setLocale, type LocaleId } from '../i18n';
import en from '../assets/flags/us.svg';
import es from '../assets/flags/es.svg';
import fr from '../assets/flags/fr.svg';
import de from '../assets/flags/de.svg';
import nl from '../assets/flags/nl.svg';
import pt from '../assets/flags/pt.svg';
import ja from '../assets/flags/jp.svg';
import zh from '../assets/flags/cn.svg';
import id from '../assets/flags/id.svg';
import th from '../assets/flags/th.svg';
import vi from '../assets/flags/vn.svg';
import ar from '../assets/flags/sa.svg';
import sw from '../assets/flags/tz.svg';
import ha from '../assets/flags/ne.svg';
import yo from '../assets/flags/ng.svg';

// Bundled SVGs keep flags visible offline and on platforms without flag emoji.
const FLAGS: Record<LocaleId, string> = { en, es, fr, de, nl, pt, ja, zh, id, th, vi, ar, sw, ha, yo };

export function LanguageSelectScreen({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const { t, i18n } = useTranslation('meta');
  const current = i18n.language as LocaleId;
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ready) selectedRef.current?.focus();
  }, [ready]);

  return (
    <section className="language-screen" aria-labelledby="language-heading" inert={!ready}>
      <div className="language-panel">
        <h1 id="language-heading" className="font-pirate text-4xl text-gold sm:text-5xl">
          {t('chooseLanguage')}
        </h1>
        <div className="language-grid">
          {LOCALES.map((lng) => (
            <button
              key={lng}
              ref={lng === current ? selectedRef : undefined}
              type="button"
              className="language-card"
              lang={lng}
              aria-pressed={lng === current}
              disabled={!ready}
              onClick={() => {
                setLocale(lng);
                onDone();
              }}
            >
              <img src={FLAGS[lng]} alt="" width="80" height="60" />
              <span>{LOCALE_NAMES[lng]}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

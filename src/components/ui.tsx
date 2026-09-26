import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bird,
  Bomb,
  ChevronsUpDown,
  Crosshair,
  Flame,
  Grape,
  Hammer,
  Swords,
  Triangle,
  LifeBuoy,
  Link,
  Music,
  Sailboat,
  Shield,
  ShipWheel,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { LOCALES, LOCALE_NAMES, fmt, setLocale, type LocaleId } from '../i18n';
import { skullsOf } from '../game/difficulty';
import type { ScoreEntry, Settings } from '../game/storage';
import type { UpgradeId } from '../game/types';

export const UPGRADE_ICONS: Record<UpgradeId, LucideIcon> = {
  cannons: Bomb,
  reload: Timer,
  damage: Flame,
  hull: Shield,
  sails: Sailboat,
  rudder: ShipWheel,
  range: Crosshair,
  magnet: Bird,
  carpenter: Hammer,
  swivel: Zap,
  chain: Link,
  grapeshot: Grape,
  chaser: ChevronsUpDown,
  ram: Triangle,
  spikes: Swords,
  fenders: LifeBuoy,
};

export function KeyCap({ children, className }: { children: ReactNode; className?: string }) {
  return <kbd className={cn('key-cap', className)}>{children}</kbd>;
}

export function SoundToggles({
  settings,
  onChange,
  dark = false,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  dark?: boolean;
}) {
  const { t } = useTranslation();
  const base =
    'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-pirate text-lg transition-colors cursor-pointer';
  const on = dark ? 'border-gold bg-gold/20 text-gold' : 'border-ink bg-ink text-parch';
  const off = dark ? 'border-parch/40 text-parch/50' : 'border-ink/40 text-ink/50 line-through';
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        tabIndex={-1}
        className={cn(base, settings.sfx ? on : off)}
        onClick={() => onChange({ ...settings, sfx: !settings.sfx })}
        aria-pressed={settings.sfx}
      >
        {settings.sfx ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {t('sound')}
      </button>
      <button
        type="button"
        tabIndex={-1}
        className={cn(base, settings.music ? on : off)}
        onClick={() => onChange({ ...settings, music: !settings.music })}
        aria-pressed={settings.music}
      >
        <Music className="h-4 w-4" />
        {t('shanty')}
      </button>
    </div>
  );
}

/** The ship's colours for language: a compact picker across all locales. */
export function LanguagePicker({ dark = false }: { dark?: boolean }) {
  const { t, i18n } = useTranslation('meta');
  const [open, setOpen] = useState(false);
  const current = (i18n.language as LocaleId) || 'en';
  return (
    <div className="relative inline-block">
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 font-pirate text-lg transition-colors cursor-pointer',
          dark ? 'border-parch/40 text-parch/85' : 'border-ink/40 text-ink/80',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={t('language')}
      >
        🌐 {LOCALE_NAMES[current] ?? current}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={t('language')}
          className={cn(
            'absolute bottom-full z-30 mb-2 max-h-64 w-52 overflow-y-auto rounded-lg border-2 p-1 text-left shadow-xl',
            dark ? 'border-gold/50 bg-[#0a1628]' : 'border-ink/40 bg-parch',
          )}
        >
          {LOCALES.map((lng) => (
            <li key={lng}>
              <button
                type="button"
                role="option"
                aria-selected={lng === current}
                tabIndex={-1}
                onClick={() => {
                  setLocale(lng);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded px-2 py-1 font-pirate text-lg cursor-pointer',
                  lng === current
                    ? dark
                      ? 'bg-gold/25 text-gold'
                      : 'bg-ink/15 text-ink'
                    : dark
                      ? 'text-parch/85 hover:bg-parch/10'
                      : 'text-ink/80 hover:bg-ink/10',
                )}
              >
                {LOCALE_NAMES[lng]}
                {lng === current && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const RANK_STYLE = [
  'bg-gradient-to-b from-[#ffe98a] to-[#d9a520] text-[#4a2c05] border-[#8a5a12]',
  'bg-gradient-to-b from-[#f2f2f2] to-[#a9a9a9] text-[#2c2c2c] border-[#6b6b6b]',
  'bg-gradient-to-b from-[#f0b27a] to-[#a0522d] text-[#3a1a05] border-[#6b3410]',
];

export function HighScoreTable({
  scores,
  highlight = -1,
  limit = 10,
  dark = false,
}: {
  scores: ScoreEntry[];
  highlight?: number;
  limit?: number;
  /** Painted for a cabinet-style dark panel instead of a parchment log. */
  dark?: boolean;
}) {
  const { t } = useTranslation('screens');
  const list = scores.slice(0, limit);
  return (
    <div>
      <div className="mb-2 flex items-center justify-center gap-2">
        <Trophy className={cn('h-5 w-5', dark ? 'text-gold' : 'text-gold-deep')} />
        <h3 className={cn('font-pirate text-2xl sm:text-3xl', dark && 'arcade-marquee')}>{t('scores.hall')}</h3>
        <Trophy className={cn('h-5 w-5', dark ? 'text-gold' : 'text-gold-deep')} />
      </div>
      {list.length === 0 ? (
        <p className="py-6 text-center italic opacity-70">{t('scores.empty')}</p>
      ) : (
        <ol className="space-y-1">
          {list.map((s, i) => (
            <li
              key={`${s.date}-${i}`}
              className={cn(
                'grid grid-cols-[1.9rem_1fr_auto_auto] items-center gap-2 rounded-md px-2 py-0.5',
                i % 2 === 0 && (dark ? 'bg-parch/[0.07]' : 'bg-ink/[0.06]'),
                i === highlight && 'bg-gold/70 ring-2 ring-blood anim-pulse',
              )}
            >
              <span
                className={cn(
                  'grid h-6 w-6 place-items-center rounded-full border font-pirate text-sm',
                  RANK_STYLE[i] ?? (dark ? 'border-parch/40 text-parch/75' : 'border-ink/30 text-ink/70'),
                )}
              >
                {i + 1}
              </span>
              <span className="truncate font-pirate text-lg leading-tight">{s.name}</span>
              <span className="text-xs italic opacity-70">
                {t('scores.waveShort', { wave: s.wave })} · {s.sunk}⚓
                {skullsOf(s.difficulty) > 0 && ` · ${'☠'.repeat(skullsOf(s.difficulty))}`}
              </span>
              <span className="min-w-[4.5rem] text-right font-pirate text-xl tabular-nums leading-tight">
                {fmt(s.score)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

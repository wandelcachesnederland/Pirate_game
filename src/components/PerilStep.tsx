import { Anchor, Crown, Flame, Skull, Swords, type LucideIcon } from 'lucide-react';
import type { DifficultyId } from '../game/types';
import { DIFFICULTIES, difficultyById, type DifficultyDef } from '../game/difficulty';
import { cn } from '../utils/cn';

interface Props {
  difficulty: DifficultyId;
  onDifficulty: (id: DifficultyId) => void;
}

interface PerilStyle {
  icon: LucideIcon;
  motto: string;
  bestFor: string;
  /** The badge's enamel. */
  gradient: string;
  ring: string;
  glow: string;
  ink: string;
  ribbon?: string;
}

/** Each peril sails under its own colours — the cabinet's five badges. */
const PERIL_STYLE: Record<DifficultyId, PerilStyle> = {
  landlubber: {
    icon: Anchor,
    motto: 'Calm waters',
    bestFor: 'First voyages',
    gradient: 'radial-gradient(circle at 35% 30%, #c8f5e4, #3aa88f 55%, #0e4a40)',
    ring: '#7de8c3',
    glow: 'rgba(80, 230, 190, 0.45)',
    ink: '#06231d',
  },
  swashbuckler: {
    icon: Swords,
    motto: 'A fair fight',
    bestFor: 'Warming up',
    gradient: 'radial-gradient(circle at 35% 30%, #e8f7b0, #7ab648 55%, #2c4d15)',
    ring: '#c4ec7a',
    glow: 'rgba(150, 220, 90, 0.45)',
    ink: '#1c2f08',
  },
  buccaneer: {
    icon: Skull,
    motto: 'No quarter',
    bestFor: 'The classic voyage',
    gradient: 'radial-gradient(circle at 35% 30%, #ff8a6a, #c22e1f 55%, #560d07)',
    ring: '#ffd863',
    glow: 'rgba(255, 150, 60, 0.55)',
    ink: '#fff3d6',
    ribbon: 'Classic',
  },
  dreadCaptain: {
    icon: Flame,
    motto: 'Hardened foes',
    bestFor: 'Veterans',
    gradient: 'radial-gradient(circle at 35% 30%, #dfaaff, #7a2fc0 55%, #280b4e)',
    ring: '#c98aff',
    glow: 'rgba(180, 110, 255, 0.55)',
    ink: '#f6e8ff',
  },
  kingOfTheSeas: {
    icon: Crown,
    motto: 'Iron & gold',
    bestFor: 'Legends only',
    gradient: 'radial-gradient(circle at 35% 30%, #fff6c0, #f5b542 48%, #8a4a12 82%)',
    ring: '#ffe98a',
    glow: 'rgba(255, 210, 80, 0.6)',
    ink: '#3a1c05',
    ribbon: 'Richest',
  },
};

/** One enamel badge: the peril's logo on the cabinet. */
function Emblem({ d, size = 'md' }: { d: DifficultyDef; size?: 'sm' | 'md' | 'lg' }) {
  const s = PERIL_STYLE[d.id];
  const Icon = s.icon;
  const box = size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : size === 'md' ? 'h-14 w-14' : 'h-11 w-11';
  const glyph = size === 'lg' ? 'h-10 w-10 sm:h-12 sm:w-12' : size === 'md' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <span
      className={cn('relative grid shrink-0 place-items-center rounded-full', box)}
      style={{
        background: s.gradient,
        border: `3px solid ${s.ring}`,
        boxShadow: `0 0 18px ${s.glow}, inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -4px 6px rgba(0,0,0,0.4)`,
      }}
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-1 rounded-full border opacity-50"
        style={{ borderColor: s.ring }}
      />
      <Icon className={glyph} style={{ color: s.ink, filter: 'drop-shadow(0 1px 0 rgba(255,255,255,0.35))' }} />
    </span>
  );
}

/** How one number of a peril compares across all five — an arcade meter. */
function Meter({ label, v, min, max, tint }: { label: string; v: number; min: number; max: number; tint: string }) {
  const k = max > min ? (v - min) / (max - min) : 1;
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-20 shrink-0 text-left text-[0.6rem] uppercase tracking-wider opacity-65 sm:w-24">
        {label}
      </span>
      <span className="h-2 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/45">
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${8 + k * 92}%`, background: tint }}
        />
      </span>
      <span className="w-10 shrink-0 text-right font-pirate text-sm leading-none tabular-nums">
        ×{v.toFixed(v < 1 ? 2 : v < 10 ? 2 : 1).replace(/0$/, '')}
      </span>
    </div>
  );
}

const minOf = (f: (d: DifficultyDef) => number) => Math.min(...DIFFICULTIES.map(f));
const maxOf = (f: (d: DifficultyDef) => number) => Math.max(...DIFFICULTIES.map(f));

/**
 * Step two after signing on: five degrees of peril, each under its own
 * colours. One screen, one decision — how dangerous the voyage sails.
 */
export function PerilStep({ difficulty, onDifficulty }: Props) {
  const sel = difficultyById(difficulty);
  const selStyle = PERIL_STYLE[sel.id];
  const SelIcon = selStyle.icon;
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto no-scrollbar p-2 sm:gap-3 sm:p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 2 of 4 · Peril</div>
          <h2 className="arcade-marquee text-2xl sm:text-4xl">Choose Your Peril</h2>
        </div>
        <span className="text-[0.7rem] italic opacity-75 sm:text-[0.8rem]">
          Deeper peril pays richer plunder · ← → or 1–5, then Enter
        </span>
      </div>

      <div
        className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 xl:grid-cols-5"
        role="radiogroup"
        aria-label="Peril"
      >
        {DIFFICULTIES.map((d, i) => {
          const s = PERIL_STYLE[d.id];
          const active = d.id === difficulty;
          return (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${d.name} — ${s.motto}`}
              onClick={() => onDifficulty(d.id)}
              data-on={active}
              className={cn(
                'diff-card relative flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-2.5 sm:py-3',
                active
                  ? 'border-gold bg-blood/70 text-parch'
                  : 'cursor-pointer border-parch/25 bg-black/30 text-parch/75 hover:border-parch/50',
              )}
              style={active ? { boxShadow: `0 0 18px ${s.glow}, 0 0 34px rgba(255,190,60,0.25)` } : undefined}
            >
              {s.ribbon && (
                <span
                  className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 font-pirate text-[0.65rem] leading-tight tracking-widest uppercase"
                  style={{ background: s.ring, color: s.ink }}
                >
                  {s.ribbon}
                </span>
              )}
              <span className="pointer-events-none absolute left-1.5 top-1 font-pirate text-xs opacity-40">
                {i + 1}
              </span>
              <Emblem d={d} />
              <span className="font-pirate text-lg leading-tight sm:text-xl">{d.name}</span>
              <span className={cn('text-[0.7rem] tracking-[0.2em]', active ? 'text-gold' : 'text-parch/45')}>
                {'☠'.repeat(d.skulls)}
              </span>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 font-pirate text-sm leading-none',
                  active ? 'border-gold/70 text-gold' : 'border-parch/25 text-parch/60',
                )}
              >
                ×{d.plunder} gold
              </span>
              <span className="text-[0.68rem] italic leading-tight opacity-75">{s.motto}</span>
            </button>
          );
        })}
      </div>

      <section
        className="arcade-panel mt-auto flex flex-col gap-2 p-2.5 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
        aria-live="polite"
      >
        <div className="flex items-center gap-2.5 sm:flex-col sm:text-center">
          <Emblem d={sel} size="lg" />
          <div>
            <div className="font-pirate text-2xl leading-none sm:text-3xl">{sel.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 sm:justify-center">
              <SelIcon className="h-3.5 w-3.5" style={{ color: selStyle.ring }} />
              <span className="text-[0.7rem] uppercase tracking-[0.18em] opacity-80">{selStyle.bestFor}</span>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[0.82rem] italic leading-snug opacity-90 sm:text-[0.9rem]">{sel.tagline}</p>
          <div className="mt-2 grid gap-1 sm:grid-cols-2 sm:gap-x-4">
            <Meter label="Foe guns" v={sel.enemyDamage} min={minOf((d) => d.enemyDamage)} max={maxOf((d) => d.enemyDamage)} tint="linear-gradient(90deg,#ff9a6a,#c22e1f)" />
            <Meter label="Foe hull" v={sel.enemyHp} min={minOf((d) => d.enemyHp)} max={maxOf((d) => d.enemyHp)} tint="linear-gradient(90deg,#ffd863,#c8912a)" />
            <Meter label="Foe numbers" v={sel.waveBudget} min={minOf((d) => d.waveBudget)} max={maxOf((d) => d.waveBudget)} tint="linear-gradient(90deg,#c98aff,#5a1fa0)" />
            <Meter label="Plunder" v={sel.plunder} min={minOf((d) => d.plunder)} max={maxOf((d) => d.plunder)} tint="linear-gradient(90deg,#a8e6c8,#2f9e44)" />
          </div>
        </div>
      </section>
    </div>
  );
}

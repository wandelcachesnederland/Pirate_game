import { Gamepad2, Map, Coins, Lock, Swords, Skull, Anchor } from 'lucide-react';
import { cn } from '../utils/cn';

export type GameModeId = 'arcade' | 'adventure' | 'trade';

interface Props {
  onSelect: (mode: GameModeId) => void;
  isTouch: boolean;
}

interface ModeDef {
  id: GameModeId;
  name: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  icon: React.ElementType;
  accent: string;
  gradient: string;
  ring: string;
  glow: string;
  enabled: boolean;
  badge?: string;
}

const MODES: ModeDef[] = [
  {
    id: 'arcade',
    name: 'Arcade',
    subtitle: 'Broadside Mayhem',
    desc: 'Fast waves, quick plunder',
    longDesc: 'The classic cabinet brawl — sink, board, upgrade, survive. 26 eras, 5 perils, endless waves.',
    icon: Gamepad2,
    accent: '#ffd863',
    gradient: 'radial-gradient(circle at 35% 30%, #ff8a6a, #c22e1f 55%, #560d07)',
    ring: '#ffd863',
    glow: 'rgba(255, 150, 60, 0.55)',
    enabled: true,
    badge: 'Play Now',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    subtitle: 'Chart the Unknown',
    desc: 'Story & exploration',
    longDesc: 'Sail a living world, take on quests, meet legends, and write your own saga on the map.',
    icon: Map,
    accent: '#7de8c3',
    gradient: 'radial-gradient(circle at 35% 30%, #a8e6cf, #3aa88f 55%, #0e4a40)',
    ring: '#7de8c3',
    glow: 'rgba(80, 230, 190, 0.35)',
    enabled: false,
    badge: 'Coming Soon',
  },
  {
    id: 'trade',
    name: 'Trade',
    subtitle: 'Fortune & Rum',
    desc: 'Buy low, sell high',
    longDesc:
      'Sail a living world map, run cargo between real ports, dodge pirates and corner the markets of the globe.',
    icon: Coins,
    accent: '#c98aff',
    gradient: 'radial-gradient(circle at 35% 30%, #dfaaff, #7a2fc0 55%, #280b4e)',
    ring: '#c98aff',
    glow: 'rgba(180, 110, 255, 0.35)',
    enabled: true,
    badge: 'Play Now',
  },
];

function ModeEmblem({ mode, size = 'lg', disabled = false }: { mode: ModeDef; size?: 'sm' | 'lg'; disabled?: boolean }) {
  const Icon = mode.icon;
  const box = size === 'lg' ? 'h-20 w-20 sm:h-24 sm:w-24' : 'h-14 w-14';
  const glyph = size === 'lg' ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-7 w-7';
  return (
    <span
      className={cn('relative grid shrink-0 place-items-center rounded-full transition-all', box)}
      style={{
        background: mode.gradient,
        border: `3px solid ${mode.ring}`,
        boxShadow: disabled
          ? 'inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -4px 6px rgba(0,0,0,0.4)'
          : `0 0 18px ${mode.glow}, inset 0 2px 3px rgba(255,255,255,0.5), inset 0 -4px 6px rgba(0,0,0,0.4)`,
        filter: disabled ? 'grayscale(0.85) brightness(0.7)' : undefined,
        opacity: disabled ? 0.7 : 1,
      }}
      aria-hidden
    >
      <Icon className={glyph} style={{ color: disabled ? '#d0c8b8' : '#fff3d6', filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.4))' }} />
      {disabled && (
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-parch/40 bg-black/70">
          <Lock className="h-3.5 w-3.5 text-parch/70" />
        </span>
      )}
    </span>
  );
}

export function ModeSelectScreen({ onSelect, isTouch }: Props) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto no-scrollbar p-2 sm:gap-3 sm:p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 1 of 7 · Game Mode</div>
          <h2 className="arcade-marquee text-2xl sm:text-4xl">Choose Your Mode</h2>
        </div>
        <span className="text-[0.7rem] italic opacity-75 sm:text-[0.8rem]">
          {isTouch ? 'Tap a mode to weigh anchor' : 'Enter — sail Arcade · Adventure charting its course'}
        </span>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4 sm:content-center">
        {MODES.map((m) => {
          const enabled = m.enabled;
          return (
            <button
              key={m.id}
              type="button"
              disabled={!enabled}
              onClick={() => enabled && onSelect(m.id)}
              aria-disabled={!enabled}
              aria-label={enabled ? `${m.name} — ${m.subtitle}` : `${m.name} — Coming Soon`}
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all sm:px-4 sm:py-6',
                enabled
                  ? 'cursor-pointer border-gold bg-blood/70 text-parch hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
                  : 'cursor-not-allowed border-parch/20 bg-black/40 text-parch/50',
              )}
              style={
                enabled
                  ? { boxShadow: `0 0 18px ${m.glow}, 0 0 34px rgba(255,190,60,0.25)` }
                  : undefined
              }
            >
              {m.badge && (
                <span
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 font-pirate text-[0.65rem] uppercase tracking-widest sm:text-[0.7rem]"
                  style={{
                    background: enabled ? m.ring : '#3a3a3a',
                    color: enabled ? '#4a1a05' : '#a8a29a',
                    boxShadow: enabled ? `0 0 10px ${m.glow}` : undefined,
                  }}
                >
                  {enabled ? (
                    <span className="flex items-center gap-1">
                      <Swords className="h-3 w-3" /> {m.badge}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Lock className="h-3 w-3" /> {m.badge}
                    </span>
                  )}
                </span>
              )}

              <ModeEmblem mode={m} disabled={!enabled} />

              <div className="mt-1">
                <div className={cn('font-pirate text-2xl leading-none sm:text-3xl', enabled ? 'text-parch' : 'text-parch/40')}>
                  {m.name}
                </div>
                <div
                  className={cn(
                    'mt-1 font-pirate text-sm uppercase tracking-[0.18em] sm:text-base',
                    enabled ? 'text-gold' : 'text-parch/30',
                  )}
                >
                  {m.subtitle}
                </div>
              </div>

              <div className={cn('mt-1 text-[0.78rem] italic leading-snug sm:text-[0.85rem]', enabled ? 'opacity-90' : 'opacity-50')}>
                {m.longDesc}
              </div>

              <div className="mt-auto pt-3">
                {enabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-black/30 px-3 py-1 font-pirate text-sm text-gold">
                    <Anchor className="h-4 w-4" /> Set Sail
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-parch/15 bg-black/20 px-3 py-1 font-pirate text-sm text-parch/30">
                    <Lock className="h-3.5 w-3.5" /> Locked
                  </span>
                )}
              </div>

              {!enabled && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-[10px] bg-black/40 backdrop-blur-[0.5px]">
                  <span className="rotate-[-12deg] rounded-md border-2 border-parch/20 bg-black/70 px-3 py-1 font-pirate text-lg tracking-widest text-parch/40">
                    COMING SOON
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="arcade-panel mt-auto flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-gold/50 bg-blood/60">
            <Gamepad2 className="h-5 w-5 text-gold" />
          </span>
          <div className="text-left">
            <div className="font-pirate text-lg leading-none text-parch sm:text-xl">Arcade & Trade are ready</div>
            <div className="text-[0.7rem] italic opacity-75">Adventure is still charting its course — not yet boardable.</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] italic opacity-60">
          <Skull className="h-4 w-4" />
          <span>Choose Arcade to continue to Sign On</span>
        </div>
      </div>
    </div>
  );
}

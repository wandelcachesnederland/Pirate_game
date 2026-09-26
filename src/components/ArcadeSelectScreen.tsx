import { Gamepad2, Hourglass, Map, Lock, Swords, Skull, Anchor, Target } from 'lucide-react';
import { cn } from '../utils/cn';

export type ArcadeModeId = 'practice' | 'era' | 'campaign';

interface Props {
  onSelect: (mode: ArcadeModeId) => void;
  isTouch: boolean;
}

interface ModeDef {
  id: ArcadeModeId;
  name: string;
  subtitle: string;
  desc: string;
  longDesc: string;
  icon: React.ElementType;
  gradient: string;
  ring: string;
  glow: string;
  enabled: boolean;
  badge?: string;
}

const MODES: ModeDef[] = [
  {
    id: 'practice',
    name: 'Practice',
    subtitle: 'Learn the Ropes',
    desc: 'Tutorial & drills',
    longDesc: 'Learn to sail, aim and board with no pressure — perfect for landlubbers.',
    icon: Target,
    gradient: 'radial-gradient(circle at 35% 30%, #d0c8b8, #8a867e 55%, #4a4840)',
    ring: '#8a867e',
    glow: 'rgba(160,160,160,0.25)',
    enabled: false,
    badge: 'Coming Soon',
  },
  {
    id: 'era',
    name: 'Era',
    subtitle: 'Pick Your Age',
    desc: 'Single era brawl',
    longDesc: 'Choose any of the 26 eras, pick your peril and hero ship — endless waves in one age.',
    icon: Hourglass,
    gradient: 'radial-gradient(circle at 35% 30%, #ff8a6a, #c22e1f 55%, #560d07)',
    ring: '#ffd863',
    glow: 'rgba(255, 150, 60, 0.55)',
    enabled: true,
    badge: 'Play Now',
  },
  {
    id: 'campaign',
    name: 'Campaign',
    subtitle: 'Sail Through Time',
    desc: 'All eras, in order',
    longDesc: 'Start at 1178 BC and fight through history — 5 waves per era, every age in chronological order.',
    icon: Map,
    gradient: 'radial-gradient(circle at 35% 30%, #a8e6cf, #3aa88f 55%, #0e4a40)',
    ring: '#7de8c3',
    glow: 'rgba(80, 230, 190, 0.45)',
    enabled: true,
    badge: 'Epic',
  },
];

function ModeEmblem({ mode, disabled = false }: { mode: ModeDef; disabled?: boolean }) {
  const Icon = mode.icon;
  return (
    <span
      className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full sm:h-24 sm:w-24"
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
      <Icon className="h-10 w-10 sm:h-12 sm:w-12" style={{ color: disabled ? '#d0c8b8' : '#fff3d6' }} />
      {disabled && (
        <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-parch/40 bg-black/70">
          <Lock className="h-3.5 w-3.5 text-parch/70" />
        </span>
      )}
    </span>
  );
}

export function ArcadeSelectScreen({ onSelect, isTouch }: Props) {
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto no-scrollbar p-2 sm:gap-3 sm:p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 2 of 7 · Arcade Mode</div>
          <h2 className="arcade-marquee text-2xl sm:text-4xl">Choose Arcade Mode</h2>
        </div>
        <span className="text-[0.7rem] italic opacity-75 sm:text-[0.8rem]">
          {isTouch ? 'Tap Era or Campaign to continue' : 'Enter — choose Era or Campaign · Practice soon'}
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
              className={cn(
                'group relative flex flex-col items-center gap-2 rounded-xl border-2 px-3 py-4 text-center transition-all sm:px-4 sm:py-6',
                enabled
                  ? 'cursor-pointer border-gold bg-blood/70 text-parch hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'
                  : 'cursor-not-allowed border-parch/20 bg-black/40 text-parch/50',
              )}
              style={enabled ? { boxShadow: `0 0 18px ${m.glow}, 0 0 34px rgba(255,190,60,0.25)` } : undefined}
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
                      {m.id === 'campaign' ? <Map className="h-3 w-3" /> : <Swords className="h-3 w-3" />} {m.badge}
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
                <div className={cn('mt-1 font-pirate text-sm uppercase tracking-[0.18em] sm:text-base', enabled ? 'text-gold' : 'text-parch/30')}>
                  {m.subtitle}
                </div>
              </div>

              <div className={cn('mt-1 text-[0.78rem] italic leading-snug sm:text-[0.85rem]', enabled ? 'opacity-90' : 'opacity-50')}>
                {m.longDesc}
              </div>

              <div className="mt-auto pt-3">
                {enabled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-black/30 px-3 py-1 font-pirate text-sm text-gold">
                    <Anchor className="h-4 w-4" /> {m.id === 'era' ? 'Pick Era' : 'Start Campaign'}
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
            <div className="font-pirate text-lg leading-none text-parch sm:text-xl">Arcade ready</div>
            <div className="text-[0.7rem] italic opacity-75">Era = single age brawl · Campaign = all 26 eras in order, 5 waves each.</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] italic opacity-60">
          <Skull className="h-4 w-4" />
          <span>Practice is charting — Era & Campaign are boardable.</span>
        </div>
      </div>
    </div>
  );
}

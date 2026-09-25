import type { EraId } from '../game/types';
import { ERA_REGION, ERA_SHIPS, type EraShip } from '../game/ships/era';
import { regionById } from '../game/worlds';

interface Props {
  era: EraId;
  onEra: (id: EraId) => void;
}

function Bar({ label, v, max }: { label: string; v: number; max: number }) {
  const pct = Math.max(4, Math.min(100, (v / max) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 shrink-0 text-[0.62rem] uppercase tracking-wider opacity-60">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/15">
        <span className="block h-full rounded-full bg-blood/75" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

function EraCard({
  e,
  on,
  onEra,
  maxHp,
  maxSpd,
  maxGuns,
}: {
  e: EraShip;
  on: boolean;
  onEra: (id: EraId) => void;
  maxHp: number;
  maxSpd: number;
  maxGuns: number;
}) {
  const sea = regionById(ERA_REGION[e.id]);
  return (
    <button
      key={e.id}
      type="button"
      onClick={() => onEra(e.id)}
      aria-pressed={on}
      className={`rounded-lg border-2 px-2 py-1.5 text-left transition-colors ${
        on
          ? 'border-blood bg-blood/10 shadow-[0_0_0_2px_rgba(158,31,31,0.25)]'
          : 'border-ink/25 bg-ink/[0.04] hover:border-ink/50 hover:bg-ink/[0.08]'
      }`}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-pirate text-base leading-tight">{e.def.name}</span>
        <span className="flex shrink-0 overflow-hidden rounded-full border border-ink/40" title={sea.name}>
          {sea.swatch.map((c) => (
            <span key={c} className="h-2.5 w-2.5" style={{ background: c }} />
          ))}
        </span>
      </div>
      <div className="text-[0.62rem] uppercase tracking-wider opacity-60">
        {e.era} · {e.year}
      </div>
      <div className="mt-1 space-y-0.5">
        <Bar label="hull" v={e.def.hp} max={maxHp} />
        <Bar label="speed" v={e.def.speed} max={maxSpd} />
        <Bar label="guns" v={e.def.cannons} max={maxGuns} />
      </div>
      {on && (
        <div className="mt-1 text-[0.68rem] italic leading-tight opacity-80">
          {e.blurb}
          <span className="mt-0.5 block font-bold not-italic">
            Waters: {e.homeWaters ? `${e.homeWaters} — ${sea.name}` : sea.name}
          </span>
        </div>
      )}
    </button>
  );
}

/**
 * Step one of setting sail: the era. It is the only choice that matters before
 * you leave port — it decides the flagship you command *and* the waters you
 * fight in, so every age is played in its proper sea.
 */
export function EraPicker({ era, onEra }: Props) {
  const sea = regionById(ERA_REGION[era]);
  const maxHp = Math.max(...ERA_SHIPS.map((e) => e.def.hp));
  const maxSpd = Math.max(...ERA_SHIPS.map((e) => e.def.speed));
  const maxGuns = Math.max(...ERA_SHIPS.map((e) => e.def.cannons));
  const groups: string[] = [];
  for (const e of ERA_SHIPS) {
    if (!groups.includes(e.group)) groups.push(e.group);
  }
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-pirate text-2xl sm:text-3xl">Step 1 · Choose Your Era</h2>
        <span className="text-[0.72rem] italic opacity-70">
          Your flagship and your waters follow your choice
        </span>
      </div>
      {groups.map((g) => (
        <div key={g} className={g === groups[0] ? undefined : 'mt-3'}>
          <div className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-60">{g}</div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
            {ERA_SHIPS.filter((e) => e.group === g).map((e) => (
              <EraCard key={e.id} e={e} on={e.id === era} onEra={onEra} maxHp={maxHp} maxSpd={maxSpd} maxGuns={maxGuns} />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-3 rounded-lg border border-ink/20 bg-ink/[0.05] p-2.5 text-[0.85rem] leading-snug">
        <span className="flex items-center gap-2">
          <span className="flex shrink-0 overflow-hidden rounded-full border border-ink/40">
            {sea.swatch.map((c) => (
              <span key={c} className="h-4 w-4" style={{ background: c }} />
            ))}
          </span>
          <span className="font-pirate text-lg">Your waters — {sea.name}</span>
        </span>
        <div className="mt-0.5 text-[0.7rem] uppercase tracking-wider opacity-60">{sea.subtitle}</div>
        <div className="mt-0.5 italic opacity-80">{sea.blurb}</div>
      </div>
    </div>
  );
}

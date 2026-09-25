import type { EraId } from '../game/types';
import { ERA_SHIPS, type EraShip } from '../game/ships/era';

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
      <div className="font-pirate text-base leading-tight">{e.def.name}</div>
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
          {e.homeWaters && <span className="mt-0.5 block">Home waters: {e.homeWaters}.</span>}
        </div>
      )}
    </button>
  );
}

/** Choose your flagship: the Age of Sail squadron and the Heritage Seas squadron. */
export function HullPicker({ era, onEra }: Props) {
  const maxHp = Math.max(...ERA_SHIPS.map((e) => e.def.hp));
  const maxSpd = Math.max(...ERA_SHIPS.map((e) => e.def.speed));
  const maxGuns = Math.max(...ERA_SHIPS.map((e) => e.def.cannons));
  const groups: string[] = [];
  for (const e of ERA_SHIPS) {
    if (!groups.includes(e.group)) groups.push(e.group);
  }
  return (
    <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3">
      <h3 className="mb-1.5 font-pirate text-xl">Choose Your Ship</h3>
      {groups.map((g) => (
        <div key={g} className={g === groups[0] ? undefined : 'mt-2'}>
          <div className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.2em] opacity-60">{g}</div>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
            {ERA_SHIPS.filter((e) => e.group === g).map((e) => (
              <EraCard key={e.id} e={e} on={e.id === era} onEra={onEra} maxHp={maxHp} maxSpd={maxSpd} maxGuns={maxGuns} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

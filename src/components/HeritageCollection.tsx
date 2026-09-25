import { Lock } from 'lucide-react';
import { HERITAGE_SHIPS } from '../game/ships/heritage';

function Bar({ label, v, max }: { label: string; v: number; max: number }) {
  const pct = Math.max(4, Math.min(100, (v / max) * 100));
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 shrink-0 text-[0.62rem] uppercase tracking-wider opacity-60">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/15">
        <span className="block h-full rounded-full bg-ink/40" style={{ width: `${pct}%` }} />
      </span>
    </div>
  );
}

/**
 * The shipwright's collection: Roman, Greek, Arab, Chinese and Japanese hulls.
 * Museum pieces for now — admired, not sailed. They take no part in gameplay yet.
 */
export function HeritageCollection() {
  const maxHp = Math.max(...HERITAGE_SHIPS.map((e) => e.def.hp));
  const maxSpd = Math.max(...HERITAGE_SHIPS.map((e) => e.def.speed));
  const maxGuns = Math.max(...HERITAGE_SHIPS.map((e) => e.def.cannons));
  return (
    <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3">
      <h3 className="mb-0.5 flex items-center gap-1.5 font-pirate text-xl">
        <Lock className="h-4 w-4 opacity-60" />
        Shipwright&apos;s Collection
      </h3>
      <p className="mb-1.5 text-[0.72rem] italic leading-tight opacity-70">
        Distant waters, distant hulls — not yet playable, but already legendary.
      </p>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
        {HERITAGE_SHIPS.map((e) => (
          <div
            key={e.id}
            className="rounded-lg border-2 border-dashed border-ink/25 bg-ink/[0.03] px-2 py-1.5 opacity-80"
            title={`${e.culture} — ${e.blurb} (not yet playable)`}
          >
            <div className="font-pirate text-base leading-tight">{e.def.name}</div>
            <div className="text-[0.62rem] uppercase tracking-wider opacity-60">
              {e.culture} · {e.waters} · {e.year}
            </div>
            <div className="mt-1 space-y-0.5">
              <Bar label="hull" v={e.def.hp} max={maxHp} />
              <Bar label="speed" v={e.def.speed} max={maxSpd} />
              <Bar label="guns" v={e.def.cannons} max={maxGuns} />
            </div>
            <div className="mt-1 text-[0.68rem] italic leading-tight opacity-80">{e.blurb}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

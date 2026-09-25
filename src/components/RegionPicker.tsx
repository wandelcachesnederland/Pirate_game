import type { RegionId } from '../game/types';
import { REGIONS } from '../game/worlds';

interface Props {
  region: RegionId;
  onRegion: (id: RegionId) => void;
}

/** Choose your waters: four seas, one hunt. Scenery only — same game everywhere. */
export function RegionPicker({ region, onRegion }: Props) {
  return (
    <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3">
      <h3 className="mb-1.5 font-pirate text-xl">Choose Your Waters</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {REGIONS.map((r) => {
          const on = r.id === region;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onRegion(r.id)}
              aria-pressed={on}
              className={`rounded-lg border-2 px-2 py-1.5 text-left transition-colors ${
                on
                  ? 'border-blood bg-blood/10 shadow-[0_0_0_2px_rgba(158,31,31,0.25)]'
                  : 'border-ink/25 bg-ink/[0.04] hover:border-ink/50 hover:bg-ink/[0.08]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="flex shrink-0 overflow-hidden rounded-full border border-ink/40">
                  {r.swatch.map((c) => (
                    <span key={c} className="h-4 w-4" style={{ background: c }} />
                  ))}
                </span>
                <span className="font-pirate text-base leading-tight">{r.name}</span>
              </div>
              <div className="mt-0.5 text-[0.62rem] uppercase tracking-wider opacity-60">{r.subtitle}</div>
              {on && <div className="mt-1 text-[0.68rem] italic leading-tight opacity-80">{r.blurb}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

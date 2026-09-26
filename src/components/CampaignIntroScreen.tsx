import { Map, Anchor, Clock, Skull, Sailboat } from 'lucide-react';
import { eraShip } from '../game/ships/era';
import { chronologicalEras, CAMPAIGN_WAVES_PER_ERA } from '../game/campaign';
import type { EraId, DifficultyId } from '../game/types';
import { difficultyById } from '../game/difficulty';

interface Props {
  era: EraId;
  difficulty: DifficultyId;
  name: string;
  onJump: (step: number) => void;
}

export function CampaignIntroScreen({ era, difficulty, name, onJump }: Props) {
  const allEras = chronologicalEras();
  const first = allEras[0];
  const current = eraShip(era);
  const peril = difficultyById(difficulty);
  const totalWaves = allEras.length * CAMPAIGN_WAVES_PER_ERA;

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto no-scrollbar p-2 sm:gap-3 sm:p-3">
      <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 5 of 7 · Campaign · First Era</div>
          <h2 className="arcade-marquee text-xl leading-none sm:text-3xl">Campaign: Sail Through Time</h2>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onJump(3)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/50 bg-black/40 px-2.5 py-1 font-pirate text-base leading-none text-gold hover:brightness-125"
          >
            {name || 'Nameless'} ✎
          </button>
          <button
            type="button"
            onClick={() => onJump(4)}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/50 bg-black/40 px-2.5 py-1 font-pirate text-base leading-none text-gold hover:brightness-125"
          >
            {'☠'.repeat(peril.skulls)} {peril.name} ✎
          </button>
        </div>
      </div>

      <div className="grid flex-1 gap-3 sm:grid-cols-[1.1fr_0.9fr] sm:gap-4">
        {/* First era card */}
        <div className="arcade-panel flex flex-col gap-3 p-3 sm:p-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-gold/50 bg-blood/60">
              <Anchor className="h-5 w-5 text-gold" />
            </span>
            <div>
              <div className="arcade-tag text-[0.6rem]">Campaign starts here — oldest waters</div>
              <div className="font-pirate text-2xl leading-none text-parch sm:text-3xl">{first.era}</div>
              <div className="font-pirate text-sm text-gold">{first.year} · {first.region}</div>
            </div>
          </div>

          <div className="rounded-lg border border-parch/25 bg-black/30 p-2.5 text-sm leading-snug text-parch/90">
            <p className="italic">{first.blurb}</p>
            <p className="mt-2 text-[0.8rem] opacity-80">
              You begin at the dawn of recorded sea battle. Survive {CAMPAIGN_WAVES_PER_ERA} waves here, then sail forward in time — era by era — until the modern seas.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-gold/30 bg-black/40 p-2">
              <div className="font-pirate text-2xl leading-none text-gold">{allEras.length}</div>
              <div className="text-[0.65rem] uppercase tracking-wider opacity-70">Eras</div>
            </div>
            <div className="rounded-md border border-gold/30 bg-black/40 p-2">
              <div className="font-pirate text-2xl leading-none text-gold">{CAMPAIGN_WAVES_PER_ERA}</div>
              <div className="text-[0.65rem] uppercase tracking-wider opacity-70">Waves / Era</div>
            </div>
            <div className="rounded-md border border-gold/30 bg-black/40 p-2">
              <div className="font-pirate text-2xl leading-none text-gold">{totalWaves}</div>
              <div className="text-[0.65rem] uppercase tracking-wider opacity-70">Total Waves</div>
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 text-[0.72rem] italic opacity-70">
            <Clock className="h-4 w-4" />
            <span>Current pick locked to {current.era} ({current.year}) — your hero ship for the first age waits next.</span>
          </div>
        </div>

        {/* Timeline preview */}
        <div className="flex flex-col gap-2">
          <div className="arcade-panel p-2.5 sm:p-3">
            <div className="mb-2 flex items-center gap-2">
              <Map className="h-4 w-4 text-gold" />
              <span className="font-pirate text-lg leading-none">Chronological Route</span>
              <span className="arcade-tag ml-auto text-[0.6rem] opacity-70">{allEras.length} stops</span>
            </div>
            <ol className="max-h-[22rem] space-y-1 overflow-y-auto no-scrollbar pr-1 sm:max-h-[26rem]">
              {allEras.map((e, idx) => {
                const isFirst = idx === 0;
                const isActive = e.id === era;
                return (
                  <li
                    key={e.id}
                    className={`flex items-center gap-2 rounded-md border px-2 py-1 text-left transition-colors ${
                      isActive
                        ? 'border-gold bg-blood/60 text-parch'
                        : isFirst
                          ? 'border-gold/60 bg-black/40 text-gold'
                          : 'border-parch/15 bg-black/20 text-parch/60'
                    }`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-full border border-current font-pirate text-xs">
                      {idx + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-pirate text-sm leading-tight">{e.era}</span>
                    <span className="shrink-0 text-[0.65rem] italic opacity-70">{e.year}</span>
                    {isFirst && <Sailboat className="h-3.5 w-3.5 shrink-0 text-gold" />}
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="arcade-panel p-2.5 text-[0.78rem] italic leading-snug opacity-85">
            <p className="flex items-start gap-2">
              <Skull className="h-4 w-4 shrink-0 text-gold" />
              <span>
                In campaign you keep your upgrades, gold and crew across eras. Each era brings its own waters, foes and music. Fail in any age and the campaign ends — conquer all {allEras.length} to become legend.
              </span>
            </p>
          </div>
        </div>
      </div>

      <p className="shrink-0 text-center text-[0.64rem] italic leading-snug opacity-60">
        Next: pick your hero ship for {first.era} — she will carry you through time, or you can choose any hull and keep her through the ages.
      </p>
    </div>
  );
}

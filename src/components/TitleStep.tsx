import { Anchor, Play, Sailboat, Skull, Trophy, Waves } from 'lucide-react';
import type { ScoreEntry } from '../game/storage';

interface Props {
  hiScore: number;
  scores: ScoreEntry[];
  isTouch: boolean;
  onStart: () => void;
}

/**
 * The cabinet's attract mode: a big glowing logo, the legends so far, and a
 * single coin slot. One decision only — to play.
 */
export function TitleStep({ hiScore, scores, isTouch, onStart }: Props) {
  const legends = scores.slice(0, 3);
  return (
    <div className="relative grid h-full place-items-center overflow-y-auto no-scrollbar p-3 sm:p-6">
      {/* faint rigging behind the glass */}
      <Anchor className="anim-bob pointer-events-none absolute left-[6%] top-[12%] h-16 w-16 text-gold/10 sm:h-24 sm:w-24" />
      <Sailboat
        className="anim-bob pointer-events-none absolute bottom-[14%] right-[7%] h-20 w-20 text-gold/10 sm:h-28 sm:w-28"
        style={{ animationDelay: '0.9s' }}
      />
      <Waves
        className="anim-bob pointer-events-none absolute bottom-[10%] left-[10%] h-14 w-14 text-sea/20 sm:h-20 sm:w-20"
        style={{ animationDelay: '1.7s' }}
      />

      <div className="anim-pop relative w-full max-w-3xl text-center">
        <div className="marquee-bulbs mx-auto max-w-md opacity-90" aria-hidden />
        <div className="arcade-tag mt-2 text-[0.6rem] sm:text-xs">★ An arcade voyage in 26 eras ★</div>

        <h1 className="title-gold anim-shimmer title-arcade mt-1">Broadside!</h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-parch/90 sm:gap-3">
          <Skull className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="font-fell text-[0.65rem] uppercase italic tracking-[0.28em] sm:text-sm">
            Scourge of the Spanish Main
          </span>
          <Skull className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-[0.62rem] sm:text-xs">
          <span className="arcade-tag rounded-full border border-gold/40 bg-black/40 px-2.5 py-0.5">
            26 eras
          </span>
          <span className="arcade-tag rounded-full border border-gold/40 bg-black/40 px-2.5 py-0.5">
            5 perils
          </span>
          <span className="arcade-tag rounded-full border border-gold/40 bg-black/40 px-2.5 py-0.5">
            1 ship — yours
          </span>
        </div>

        <div className="arcade-panel mt-3 p-3 text-center sm:mt-4 sm:p-5">
          <div className="marquee-bulbs opacity-70" aria-hidden />
          <div className="mt-2 flex items-center justify-center gap-2">
            <Trophy className="h-4 w-4 text-gold sm:h-5 sm:w-5" />
            <span className="arcade-tag text-sm sm:text-base">
              Hi-Score {hiScore.toLocaleString('en-US')}
            </span>
            <Trophy className="h-4 w-4 text-gold sm:h-5 sm:w-5" />
          </div>

          {legends.length > 0 ? (
            <ol className="mx-auto mt-2 max-w-sm space-y-1">
              {legends.map((s, i) => (
                <li
                  key={`${s.date}-${i}`}
                  className="grid grid-cols-[1.6rem_1fr_auto] items-center gap-2 rounded-md bg-parch/[0.07] px-2 py-0.5"
                >
                  <span className="font-pirate text-lg text-gold">{i + 1}</span>
                  <span className="truncate text-left font-pirate text-xl leading-tight">{s.name}</span>
                  <span className="font-pirate text-xl tabular-nums leading-tight text-gold">
                    {s.score.toLocaleString('en-US')}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-2 text-sm italic opacity-70">
              No legends yet — the sea is waiting for its first.
            </p>
          )}

          <div className="press-start arcade-tag mt-3 text-base sm:text-lg">★ Insert coin ★</div>
          <button
            type="button"
            onClick={onStart}
            className="btn-seal anim-pulse mt-2 inline-flex items-center gap-2 px-8 py-2.5 text-3xl sm:gap-3 sm:px-12 sm:text-4xl"
          >
            <Play className="h-7 w-7 sm:h-8 sm:w-8" />
            Start Game
          </button>
          <p className="mt-2 text-[0.74rem] italic leading-snug opacity-80">
            {isTouch
              ? 'Tap START, pick Arcade mode, sign the book, your peril, era and hero ship — then sail.'
              : 'Press Enter (or START) — then pick Arcade mode, sign on, peril, era and hero ship.'}
          </p>
          <div className="marquee-bulbs mt-2 opacity-70" aria-hidden />
        </div>

        <p className="mt-2 text-[0.68rem] italic opacity-60">
          New hand aboard? <b>Orders &amp; Legends</b> below has the controls.
        </p>
      </div>
    </div>
  );
}

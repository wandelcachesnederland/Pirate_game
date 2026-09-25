import type { ReactNode } from 'react';
import { Flag, Hand, Keyboard, Sailboat, Skull, Wind } from 'lucide-react';
import type { EraId, RegionId } from '../game/types';
import type { ScoreEntry, Settings } from '../game/storage';
import { HighScoreTable, HullPicker, KeyCap, SoundToggles } from './ui';
import { RegionPicker } from './RegionPicker';
import { ERA_FLAGSHIPS } from '../game/ships/era';

interface Props {
  name: string;
  onName: (s: string) => void;
  onStart: () => void;
  scores: ScoreEntry[];
  settings: Settings;
  onSettings: (s: Settings) => void;
  isTouch: boolean;
  era: EraId;
  onEra: (id: EraId) => void;
  region: RegionId;
  onRegion: (id: RegionId) => void;
}

function Row({ keys, label }: { keys: ReactNode; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex shrink-0 items-center gap-1">{keys}</span>
      <span className="text-right text-[0.95rem] leading-tight">{label}</span>
    </li>
  );
}

export function StartScreen({
  name,
  onName,
  onStart,
  scores,
  settings,
  onSettings,
  isTouch,
  era,
  onEra,
  region,
  onRegion,
}: Props) {
  return (
    <div className="absolute inset-0 overflow-y-auto no-scrollbar anim-fade">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,rgba(4,24,44,0.05)_0%,rgba(3,16,32,0.55)_60%,rgba(2,10,22,0.85)_100%)] p-3 sm:gap-5 sm:p-6">
        {/* Title */}
        <header className="anim-bob text-center">
          <div className="flex items-center justify-center gap-2 text-parch/90 sm:gap-3">
            <Skull className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-fell text-xs uppercase italic tracking-[0.3em] sm:text-sm">
              Scourge of the Spanish Main
            </span>
            <Skull className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <h1 className="title-gold text-[4.2rem] leading-[0.95] sm:text-8xl md:text-[8.5rem]">Broadside!</h1>
        </header>

        <div className="grid w-full max-w-4xl gap-3 sm:gap-5 md:grid-cols-[1.1fr_1fr]">
          {/* Orders */}
          <section className="parchment p-4 sm:p-6">
            <label htmlFor="captain" className="mb-1 block font-pirate text-xl">
              Captain&apos;s Name
            </label>
            <input
              id="captain"
              value={name}
              maxLength={14}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="go"
              placeholder="Calico Jack"
              onChange={(e) => onName(e.target.value)}
              className="w-full rounded-lg border-2 border-ink/60 bg-[#fff8e3]/70 px-3 py-1.5 font-pirate text-2xl text-ink shadow-inner placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-blood"
            />
            <button
              type="button"
              onClick={onStart}
              className="btn-seal anim-pulse mt-4 flex w-full items-center justify-center gap-3 py-3 text-3xl sm:text-4xl"
            >
              <Sailboat className="h-8 w-8" />
              Set Sail!
            </button>
            <p className="mt-1.5 text-center text-sm italic opacity-70">
              {isTouch ? 'Tap to hoist the Jolly Roger' : 'or press Enter to hoist the Jolly Roger'}
            </p>

            <HullPicker era={era} onEra={onEra} />

            <RegionPicker region={region} onRegion={onRegion} />

            <div className="mt-3 border-t-2 border-dashed border-ink/30 pt-3">
              <h3 className="mb-1.5 flex items-center gap-2 font-pirate text-xl">
                {isTouch ? <Hand className="h-5 w-5" /> : <Keyboard className="h-5 w-5" />}
                Ship&apos;s Orders
              </h3>
              {isTouch ? (
                <ul className="space-y-1 text-[0.95rem] leading-snug">
                  <li>
                    <b className="font-pirate text-lg">Left thumb:</b> drag anywhere on the left half to steer —
                    push further for full sail.
                  </li>
                  <li>
                    <b className="font-pirate text-lg">Right thumb:</b> tap or hold <b>FIRE</b> for a broadside at
                    the nearest foe.
                  </li>
                  <li>Cannons fire from the ship&apos;s <b>sides</b> — turn broadside to the enemy!</li>
                  <li>
                    Mauled foes may <b>strike their colours</b> — close in and tap <b>BOARD</b> for the full prize,
                    her crew and her flag!
                  </li>
                </ul>
              ) : (
                <ul className="divide-y divide-ink/10">
                  <Row
                    keys={
                      <>
                        <KeyCap>A</KeyCap>
                        <KeyCap>D</KeyCap>
                        <span className="px-0.5 text-xs opacity-60">or</span>
                        <KeyCap>←</KeyCap>
                        <KeyCap>→</KeyCap>
                      </>
                    }
                    label="Steer the ship"
                  />
                  <Row
                    keys={
                      <>
                        <KeyCap>W</KeyCap>
                        <KeyCap>S</KeyCap>
                        <span className="px-0.5 text-xs opacity-60">or</span>
                        <KeyCap>↑</KeyCap>
                        <KeyCap>↓</KeyCap>
                      </>
                    }
                    label="Raise / trim sails"
                  />
                  <Row
                    keys={
                      <>
                        <KeyCap>Q</KeyCap>
                        <KeyCap>E</KeyCap>
                      </>
                    }
                    label="Fire port / starboard broadside"
                  />
                  <Row
                    keys={
                      <>
                        <KeyCap className="px-3">Space</KeyCap>
                        <span className="px-0.5 text-xs opacity-60">or</span>
                        <KeyCap>Click</KeyCap>
                      </>
                    }
                    label="Smart broadside (auto-aim)"
                  />
                  <Row
                    keys={
                      <>
                        <KeyCap>F</KeyCap>
                      </>
                    }
                    label="Board a surrendered ship"
                  />
                  <Row
                    keys={
                      <>
                        <KeyCap>P</KeyCap>
                        <KeyCap>Esc</KeyCap>
                        <KeyCap>M</KeyCap>
                      </>
                    }
                    label="Pause · Mute"
                  />
                </ul>
              )}
            </div>
          </section>

          {/* Legends */}
          <section className="parchment flex flex-col p-4 sm:p-6">
            <HighScoreTable scores={scores} limit={isTouch ? 5 : 10} />
            <div className="mt-3 rounded-lg border border-ink/20 bg-ink/[0.06] p-2.5 text-[0.9rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Wind className="mt-0.5 h-4 w-4 shrink-0" />
                {ERA_FLAGSHIPS[era].hullStyle === 'ironclad' ? (
                  <span>
                    A <b>steam ironclad</b> — she burns coal, so the wind means nothing to her. Sink ships in
                    quick succession to build a <b>plunder streak</b> multiplier!
                  </span>
                ) : ERA_FLAGSHIPS[era].oared ? (
                  <span>
                    An <b>oared hull</b> — the wind means nothing to her. Row straight at them and sink ships in
                    quick succession to build a <b>plunder streak</b> multiplier!
                  </span>
                ) : (
                  <span>
                    Sail <b>with the wind</b> for top speed — watch the compass. Sink ships in quick succession to
                    build a <b>plunder streak</b> multiplier!
                  </span>
                )}
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-ink/20 bg-ink/[0.06] p-2.5 text-[0.9rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  A sinking takes most of her treasure down — but a <b>boarded prize</b> pays her full cargo, her
                  stores, her crew and her <b>colours</b>. Mind treachery, scuttling and fever!
                </span>
              </p>
            </div>
            <div className="mt-auto pt-3">
              <SoundToggles settings={settings} onChange={onSettings} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

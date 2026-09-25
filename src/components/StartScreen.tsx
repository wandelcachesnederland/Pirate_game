import type { ReactNode } from 'react';
import { Flag, Hand, Keyboard, Sailboat, Skull, Wind } from 'lucide-react';
import type { EraId } from '../game/types';
import type { ScoreEntry, Settings } from '../game/storage';
import { HighScoreTable, KeyCap, SoundToggles } from './ui';
import { EraCarousel } from './EraCarousel';
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
}: Props) {
  const hiScore = scores[0]?.score ?? 0;
  return (
    <div className="absolute inset-0 overflow-y-auto no-scrollbar anim-fade">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-[radial-gradient(ellipse_at_center,rgba(4,24,44,0.05)_0%,rgba(3,16,32,0.55)_60%,rgba(2,10,22,0.85)_100%)] p-3 sm:gap-4 sm:p-6">
        {/* ---- marquee ---- */}
        <header className="arcade-panel anim-bob w-full max-w-5xl px-3 py-2 text-center sm:py-3">
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[0.58rem] sm:text-[0.66rem]">
            <span className="arcade-tag">1 Player</span>
            <span className="opacity-35">·</span>
            <span className="arcade-tag">Hi-Score {hiScore.toLocaleString()}</span>
            <span className="opacity-35">·</span>
            <span className="arcade-tag anim-blink">Insert Coin</span>
          </div>
          <h1 className="title-gold text-[3.4rem] leading-[0.95] sm:text-7xl md:text-8xl">Broadside!</h1>
          <div className="flex items-center justify-center gap-2 text-parch/90 sm:gap-3">
            <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="font-fell text-[0.62rem] uppercase italic tracking-[0.28em] sm:text-xs">
              Scourge of the Spanish Main
            </span>
            <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </header>

        <div className="grid w-full max-w-5xl gap-3 sm:gap-4 lg:grid-cols-[1fr_1.3fr]">
          {/* ---- Step 1: sign on ---- */}
          <section className="arcade-panel p-2.5 sm:p-4 lg:col-start-1 lg:row-start-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <h2 className="arcade-marquee text-2xl sm:text-3xl">Step 1 · Sign On</h2>
              <span className="arcade-tag text-[0.58rem] opacity-90">
                {name.trim() ? 'Name logged' : 'Type your name'}
              </span>
            </div>
            <p className="mb-2 text-[0.72rem] italic opacity-70">The book of legends wants your mark.</p>
            <label htmlFor="captain" className="arcade-tag mb-1 block text-[0.58rem] opacity-90">
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
              className="w-full rounded-lg border-2 border-gold/55 bg-[#04101c]/85 px-3 py-2 font-pirate text-2xl text-parch shadow-[inset_0_0_18px_rgba(0,0,0,0.8)] placeholder:text-parch/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/60"
            />
            <p className="mt-1.5 text-[0.72rem] italic leading-snug opacity-75">
              {isTouch
                ? 'Then scroll to your era below and hit Set Sail!'
                : 'Press Enter to sail · ← → scroll the charts.'}
            </p>
          </section>

          {/* ---- Step 2: the era, its waters and its hero hull ---- */}
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-3">
            <EraCarousel era={era} onEra={onEra} />
          </div>


          {/* ---- Orders ---- */}
          <section className="arcade-panel arcade-noscan p-2.5 sm:p-4 lg:col-start-1 lg:row-start-2">
            <h2 className="arcade-marquee mb-1.5 flex items-center gap-2 text-2xl sm:text-3xl">
              {isTouch ? <Hand className="h-5 w-5" /> : <Keyboard className="h-5 w-5" />}
              Ship&apos;s Orders
            </h2>
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
                <li>
                  Buy <b>Grape &amp; Canister</b> and a <b>GRAPE</b> button appears — one tap sweeps canoes and boarding parties
                  off your hull. Island war canoes only fight near their own beach, so sail clear of their waters to
                  shake them off.
                </li>
              </ul>
            ) : (
              <ul className="divide-y divide-parch/15">
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
                      <KeyCap>R</KeyCap>
                    </>
                  }
                  label="Grape & Canister — sweep the deck (once fitted)"
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
          </section>

          {/* ---- Legends ---- */}
          <section className="arcade-panel arcade-noscan flex flex-col p-2.5 sm:p-4 lg:col-start-1 lg:row-start-3">
            <HighScoreTable scores={scores} limit={isTouch ? 5 : 10} dark />
            <div className="mt-3 rounded-lg border border-parch/25 bg-black/30 p-2.5 text-[0.9rem] italic leading-snug">
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
            <div className="mt-2 rounded-lg border border-parch/25 bg-black/30 p-2.5 text-[0.9rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  A sinking takes most of her treasure down — but a <b>boarded prize</b> pays her full cargo, her
                  stores, her crew and her <b>colours</b>. Mind treachery, scuttling and fever!
                </span>
              </p>
            </div>
            <div className="mt-auto pt-3">
              <SoundToggles settings={settings} onChange={onSettings} dark />
            </div>
          </section>
        </div>

        {/* ---- the big red button ---- */}
        <div className="w-full max-w-5xl">
          <button
            type="button"
            onClick={onStart}
            className="btn-seal anim-pulse flex w-full items-center justify-center gap-3 py-3 text-3xl sm:text-4xl"
          >
            <Sailboat className="h-8 w-8" />
            Set Sail!
          </button>
          <p className="mt-1.5 text-center text-sm italic opacity-75">
            {isTouch ? 'Tap to hoist the Jolly Roger' : 'or press Enter to hoist the Jolly Roger'}
          </p>
        </div>
      </div>
    </div>
  );
}

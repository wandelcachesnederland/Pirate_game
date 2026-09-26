import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  BookOpen,
  Dices,
  Flag,
  Hand,
  Keyboard,
  Music,
  Pencil,
  Sailboat,
  Skull,
  Wind,
  X,
} from 'lucide-react';
import type { DifficultyId, EraId } from '../game/types';
import { DIFFICULTIES, difficultyById } from '../game/difficulty';
import type { ScoreEntry, Settings } from '../game/storage';
import { isTypingTarget } from '../game/input';
import { HighScoreTable, KeyCap, SoundToggles } from './ui';
import { EraCarousel } from './EraCarousel';
import { HeroShipPicker } from './HeroShipPicker';
import { TitleStep } from './TitleStep';
import { PerilStep } from './PerilStep';
import { ERA_FLAGSHIPS, ERA_SHIPS, eraShip } from '../game/ships/era';
import { isSteelHull } from '../game/types';

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
  difficulty: DifficultyId;
  onDifficulty: (id: DifficultyId) => void;
  /** What the menu's deck is playing — named on the attract screen. */
  nowPlaying?: string;
}

/**
 * The screens of putting to sea: the attract-mode title, then sign on, then the
 * peril, then the era — and the hero hull she sails in, on her own screen so
 * the chart can breathe.
 */
type Step = 0 | 1 | 2 | 3 | 4;

function Row({ keys, label }: { keys: ReactNode; label: string }) {
  return (
    <li className="flex items-center justify-between gap-3 py-0.5">
      <span className="flex shrink-0 items-center gap-1">{keys}</span>
      <span className="text-right text-[0.95rem] leading-tight">{label}</span>
    </li>
  );
}

/** One lamp on the step ladder: done, current, or still ahead. */
function StepPlate({
  n,
  label,
  state,
  onClick,
}: {
  n: number;
  label: string;
  state: 'todo' | 'active' | 'done';
  onClick?: () => void;
}) {
  const cls =
    state === 'active'
      ? 'border-gold bg-blood/70 text-parch shadow-[0_0_14px_rgba(255,190,60,0.35)]'
      : state === 'done'
        ? 'border-gold/60 bg-black/40 text-gold'
        : 'border-parch/25 bg-black/30 text-parch/45';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`flex items-center gap-1.5 rounded-md border-2 px-1.5 py-0.5 font-pirate text-sm transition-colors sm:px-2 sm:py-1 sm:text-base ${cls} ${
        onClick ? 'cursor-pointer hover:brightness-125' : 'cursor-default'
      }`}
    >
      <span className="grid h-5 w-5 place-items-center rounded-sm border border-current text-[0.7rem] leading-none">
        {state === 'done' ? '✓' : n}
      </span>
      <span className="hidden tracking-wide sm:inline">{label}</span>
    </button>
  );
}

// ------------------------------------------------------------------ step one

const PIRATE_NAMES = [
  'Calico Jack',
  'Black Bart',
  'Anne Bonny',
  'Mary Read',
  'Blackbeard',
  'Captain Kidd',
  'Long John',
  'Ching Shih',
  'Henry Morgan',
  'Stede Bonnet',
  'Grace O’Malley',
  'Black Sam',
  'Captain Flint',
  'Mary Orm',
  'Red Legs',
];

/** Step one, filling the screen: the captain signs the book. */
export function SignOnStep({ name, onName, isTouch }: { name: string; onName: (s: string) => void; isTouch: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    // a keyboard player can type straight away; a phone keyboard would just
    // cover the screen, so wait for a tap there
    if (!isTouch) inputRef.current?.focus();
  }, [isTouch]);

  const rollName = () => {
    const pool = PIRATE_NAMES.filter((n) => n !== name);
    onName(pool[Math.floor(Math.random() * pool.length)]);
    inputRef.current?.focus();
  };

  return (
    <div className="grid h-full place-items-center overflow-y-auto no-scrollbar p-2 sm:p-4">
      <div className="anim-pop w-full max-w-xl text-center">
        <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 1 of 4 · Sign On</div>
        <h1 className="title-gold mt-1 text-[3.2rem] leading-[0.9] sm:text-7xl">Broadside!</h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-parch/90 sm:gap-3">
          <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-fell text-[0.6rem] uppercase italic tracking-[0.28em] sm:text-xs">
            Scourge of the Spanish Main
          </span>
          <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="arcade-panel mt-4 p-3 text-left sm:mt-6 sm:p-5">
          <div className="marquee-bulbs opacity-70" aria-hidden />
          <h2 className="arcade-marquee mt-2 text-2xl sm:text-3xl">Sign On</h2>
          <p className="mb-2 text-[0.72rem] italic opacity-70">The book of legends wants your mark.</p>
          <label htmlFor="captain" className="arcade-tag mb-1 block text-[0.58rem] opacity-90">
            Captain&apos;s Name
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="captain"
              value={name}
              maxLength={14}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="next"
              placeholder="Calico Jack"
              onChange={(e) => onName(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border-2 border-gold/55 bg-[#04101c]/85 px-3 py-2 text-center font-pirate text-3xl text-parch shadow-[inset_0_0_18px_rgba(0,0,0,0.8)] placeholder:text-parch/30 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/60 sm:text-4xl"
            />
            <button
              type="button"
              onClick={rollName}
              title="A name from the legends"
              aria-label="Pick a pirate name"
              className="arcade-arrow grid w-12 shrink-0 place-items-center sm:w-14"
            >
              <Dices className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-center text-[0.74rem] italic leading-snug opacity-80">
            {isTouch ? 'Then tap Next to choose your peril.' : 'Press Enter (or Next below) when the name suits.'}
          </p>
          <div className="mt-3 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.72rem] italic leading-snug opacity-85">
            Next: your peril — five flags of danger, from a calm cruise to a sea of hunters.
          </div>
        </div>
        <p className="mt-3 text-[0.7rem] italic opacity-60">
          New hand aboard? <b>Orders &amp; Legends</b> at the bottom has the controls.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------- steps three and four

/** What the two picker steps need: the choices, and the ladder to walk back. */
interface PickStepProps {
  era: EraId;
  onEra: (id: EraId) => void;
  name: string;
  difficulty: DifficultyId;
  onJump: (step: Step) => void;
}

const CHIP =
  'flex cursor-pointer items-center gap-1.5 rounded-full border border-gold/50 bg-black/40 px-2.5 py-1 font-pirate text-base leading-none text-gold transition-colors hover:brightness-125';

/** Everything already settled, as chips: tap one to row back to that step. */
function ChoiceChips({
  name,
  difficulty,
  era,
  showEra,
  onJump,
}: {
  name: string;
  difficulty: DifficultyId;
  era: EraId;
  /** The hero-ship step shows the era too — the two steps must agree. */
  showEra?: boolean;
  onJump: (step: Step) => void;
}) {
  const peril = difficultyById(difficulty);
  const ship = eraShip(era);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={() => onJump(1)} title="Change captain" className={CHIP}>
        {name.trim() || 'Nameless'}
        <Pencil className="h-3.5 w-3.5 opacity-70" />
      </button>
      <button type="button" onClick={() => onJump(2)} title="Change peril" className={CHIP}>
        {'☠'.repeat(peril.skulls)} {peril.name}
        <Pencil className="h-3.5 w-3.5 opacity-70" />
      </button>
      {showEra && (
        <button type="button" onClick={() => onJump(3)} title="Change era" className={CHIP}>
          {ship.era} · {ship.year}
          <Pencil className="h-3.5 w-3.5 opacity-70" />
        </button>
      )}
    </div>
  );
}

/** Step three, filling the screen: the age and the waters it is fought in. */
export function EraStep({ era, onEra, name, difficulty, onJump }: PickStepProps) {
  return (
    // the era step fills the cabinet: on a desktop-sized screen nothing scrolls,
    // the card simply takes the height that is left; a phone scrolls the step
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto no-scrollbar p-2 sm:gap-2 sm:p-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 3 of 4 · Era &amp; Waters</div>
          <h2 className="arcade-marquee text-xl leading-none sm:text-3xl">Choose Your Era</h2>
        </div>
        <ChoiceChips name={name} difficulty={difficulty} era={era} onJump={onJump} />
      </div>
      <EraCarousel era={era} onEra={onEra} />
      <p className="shrink-0 text-center text-[0.64rem] italic leading-snug opacity-60">
        Drag the card, tap a plate or use ← → — the age sets the waters you fight in, the foes you meet and the
        tapes that play. Her hero hull waits on the next screen.
      </p>
    </div>
  );
}

/** Step four, filling the screen: the hero hull you take into those waters. */
export function ShipStep({ era, onEra, name, difficulty, onJump }: PickStepProps) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto no-scrollbar p-2 sm:gap-2 sm:p-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">Step 4 of 4 · Hero Ship</div>
          <h2 className="arcade-marquee text-xl leading-none sm:text-3xl">Choose Your Hero Ship</h2>
        </div>
        <ChoiceChips name={name} difficulty={difficulty} era={era} showEra onJump={onJump} />
      </div>
      <HeroShipPicker era={era} onEra={onEra} />
      <p className="shrink-0 text-center text-[0.64rem] italic leading-snug opacity-60">
        Drag the portrait, tap a hull or use ← → — every number is measured against the whole fleet of heroes,
        and each hull sails only her own age. Set Sail when she suits.
      </p>
    </div>
  );
}

// ------------------------------------------------------------------ the log

/** Ship's orders and the hall of legends: the cabinet's attract-mode pages. */
function HelpOverlay({
  era,
  scores,
  isTouch,
  settings,
  onSettings,
  onClose,
}: {
  era: EraId;
  scores: ScoreEntry[];
  isTouch: boolean;
  settings: Settings;
  onSettings: (s: Settings) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="anim-fade absolute inset-0 z-20 flex items-center justify-center bg-black/75 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="arcade-panel arcade-noscan max-h-full w-full max-w-3xl overflow-y-auto scroll-thin p-3 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <h2 className="arcade-marquee text-2xl sm:text-4xl">Ship&apos;s Orders</h2>
            <p className="text-[0.7rem] italic opacity-70">Controls, and the legends of the Spanish Main.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="arcade-arrow grid h-10 w-10 shrink-0 place-items-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 text-sm leading-snug text-parch/90">
          Before naval cannon your weapons are bows, winch-drawn bolt launchers and sling stones — and,
          in the Byzantine and Arab seas, Greek fire from bronze siphons and fire arrows. Same controls,
          no cannonballs. Nothing goes off on impact in those waters: fire is what kills, so a burning
          hull takes damage over time, and burning naphtha spread by a shot that fell short keeps
          burning on the water. Boarding takes prisoners. Inhabited islands may share a people or a defence
          pact: anger one enough to start a fight, and all its kin and allies attack when you approach.
          Island labels identify their people, alliance and hostility. Leave them alone and tempers cool.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-pirate text-xl">
              {isTouch ? <Hand className="h-5 w-5" /> : <Keyboard className="h-5 w-5" />}
              At the Helm
            </h3>
            {isTouch ? (
              <ul className="space-y-1 text-[0.95rem] leading-snug">
                <li>
                  <b className="font-pirate text-lg">Left thumb:</b> drag anywhere on the left half to steer — push
                  further for full sail.
                </li>
                <li>
                  <b className="font-pirate text-lg">Right thumb:</b> tap or hold <b>FIRE</b> for a broadside at the
                  nearest foe.
                </li>
                <li>Weapons fire from the ship&apos;s <b>sides</b> — turn broadside to the enemy!</li>
                <li>
                  Mauled foes may <b>strike their colours</b> — close in and tap <b>BOARD</b> for the full prize, her
                  crew and her flag!
                </li>
                <li>
                  Buy <b>Grape &amp; Canister</b> (in early eras <b>Arrow Storm</b>, or a <b>Fire Pot Volley</b> where the siphons are) and a special-fire button appears — one tap sweeps canoes and
                  boarding parties off your hull. Island war canoes only fight near their own beach, so sail clear of
                  their waters to shake them off.
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
                  label="Grapeshot / Arrow Storm / Fire Pot Volley — sweep the deck (once fitted)"
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

          <section className="flex flex-col">
            <HighScoreTable scores={scores} limit={isTouch ? 5 : 8} dark />
            <div className="mt-3 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.85rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Wind className="mt-0.5 h-4 w-4 shrink-0" />
                {isSteelHull(ERA_FLAGSHIPS[era].hullStyle) ? (
                  <span>
                    A <b>powered warship</b> — she burns coal and oil, so the wind means nothing to her. Sink ships in
                    quick succession to build a <b>plunder streak</b> multiplier!
                  </span>
                ) : ERA_FLAGSHIPS[era].oared ? (
                  <span>
                    An <b>oared hull</b> — the wind means nothing to her. Row straight at them and sink ships in quick
                    succession to build a <b>plunder streak</b> multiplier!
                  </span>
                ) : (
                  <span>
                    Sail <b>with the wind</b> for top speed — watch the compass. Sink ships in quick succession to
                    build a <b>plunder streak</b> multiplier!
                  </span>
                )}
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.85rem] italic leading-snug">
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
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ the flow

const STEP_LABEL: Record<Step, string> = {
  0: 'Attract Mode',
  1: 'Sign On',
  2: 'Peril',
  3: 'Era & Waters',
  4: 'Hero Ship',
};

/** The ladder on the cabinet face: one plate per decision after the title. */
const STEP_PLATES: { n: 1 | 2 | 3 | 4; label: string }[] = [
  { n: 1, label: 'Sign On' },
  { n: 2, label: 'Peril' },
  { n: 3, label: 'Era' },
  { n: 4, label: 'Hero Ship' },
];

/**
 * The port, arcade style: one screen per decision. A title marquee with the
 * big logo, then sign on, then peril under its own colours, then the era — the
 * chart you scroll through — and finally the hero hull and her scouting report.
 * Orders and the hall of legends sit behind one button so the steps stay
 * uncluttered.
 */
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
  difficulty,
  onDifficulty,
  nowPlaying,
}: Props) {
  const [step, setStep] = useState<Step>(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [stage, setStage] = useState<'in' | 'out'>('in');
  const [help, setHelp] = useState(false);
  const timer = useRef<number | null>(null);

  const go = (next: Step) => {
    if (next === step) return;
    setDir(next > step ? 'fwd' : 'back');
    setStage('out');
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setStep(next);
      setStage('in');
      timer.current = null;
    }, 170);
  };
  useEffect(() => () => {
    if (timer.current !== null) window.clearTimeout(timer.current);
  }, []);

  const launch = () => (step === 4 ? onStart() : go((step + 1) as Step));
  const back = () => {
    if (step > 0) go((step - 1) as Step);
  };

  // the cabinet's own keys: Enter/Space walk the steps, arrows and 1-5 work
  // the peril badges, the era chart and the hero roster, Esc steps back
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (help) {
        if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
          e.preventDefault();
          setHelp(false);
        }
        return;
      }
      if (e.code === 'Escape') {
        e.preventDefault();
        back();
        return;
      }
      const typing = isTypingTarget(e.target);
      if (step === 2 && !typing) {
        const idx = DIFFICULTIES.findIndex((d) => d.id === difficulty);
        if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
          e.preventDefault();
          onDifficulty(DIFFICULTIES[(idx - 1 + DIFFICULTIES.length) % DIFFICULTIES.length].id);
          return;
        }
        if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
          e.preventDefault();
          onDifficulty(DIFFICULTIES[(idx + 1) % DIFFICULTIES.length].id);
          return;
        }
        const num: Record<string, number> = {
          Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3, Digit5: 4,
          Numpad1: 0, Numpad2: 1, Numpad3: 2, Numpad4: 3, Numpad5: 4,
        };
        if (e.code in num && DIFFICULTIES[num[e.code]]) {
          e.preventDefault();
          onDifficulty(DIFFICULTIES[num[e.code]].id);
          return;
        }
      }
      // the chart and the hero roster are the same choice seen twice, so the
      // arrows cycle the age on both screens
      if ((step === 3 || step === 4) && !typing && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        e.preventDefault();
        const idx = Math.max(
          0,
          ERA_SHIPS.findIndex((s) => s.id === era),
        );
        const d = e.code === 'ArrowLeft' ? -1 : 1;
        onEra(ERA_SHIPS[(idx + d + ERA_SHIPS.length) % ERA_SHIPS.length].id);
        return;
      }
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        launch();
      } else if (e.code === 'Space' && !typing) {
        e.preventDefault();
        launch();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, help, onStart, difficulty, onDifficulty, era, onEra]);

  const hiScore = scores[0]?.score ?? 0;
  const anim = stage === 'out' ? (dir === 'fwd' ? 'screen-fwd-out' : 'screen-back-out') : dir === 'fwd' ? 'screen-fwd-in' : 'screen-back-in';
  const plate = (n: 1 | 2 | 3 | 4): 'todo' | 'active' | 'done' =>
    step === n ? 'active' : step > n ? 'done' : 'todo';

  return (
    <div className="absolute inset-0 overflow-hidden anim-fade">
      <div className="flex h-full flex-col">
        {/* ---- marquee ---- */}
        <header className="arcade-panel mx-2 mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-2.5 py-1.5 sm:mx-3 sm:mt-3 sm:px-4">
          <div className="flex items-center gap-2">
            <Skull className="h-4 w-4 text-gold sm:h-5 sm:w-5" />
            <span className="arcade-marquee text-xl leading-none sm:text-2xl">Broadside!</span>
          </div>
          {step === 0 ? (
            <div className="order-last flex w-full items-center justify-center gap-1.5 sm:order-none sm:w-auto">
              <span className="arcade-tag text-[0.6rem] opacity-70 sm:text-xs">{STEP_LABEL[0]}</span>
              {settings.music && nowPlaying && (
                <span
                  className="flex items-center gap-1 rounded-full border border-gold/40 bg-black/40 px-2 py-0.5 text-[0.56rem] italic text-gold/85 sm:text-[0.62rem]"
                  title="On the menu's deck"
                >
                  <Music className="h-3 w-3 shrink-0" />
                  <span className="max-w-[12rem] truncate">{nowPlaying}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:gap-1.5">
              {STEP_PLATES.map(({ n, label }, i) => (
                <span key={n} className="flex items-center gap-1 sm:gap-1.5">
                  {i > 0 && <span className="font-pirate text-lg text-gold/70">›</span>}
                  <StepPlate
                    n={n}
                    label={label}
                    state={plate(n)}
                    onClick={step > n ? () => go(n) : undefined}
                  />
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-[0.56rem] sm:text-[0.64rem]">
            <span className="arcade-tag">Hi-Score {hiScore.toLocaleString()}</span>
            <span className="arcade-tag anim-blink hidden sm:inline">Insert Coin</span>
          </div>
        </header>

        {/* ---- the step, filling everything left ---- */}
        <div className="relative min-h-0 flex-1">
          <div className={`h-full ${anim}`} key={step}>
            {step === 0 ? (
              <TitleStep hiScore={hiScore} scores={scores} isTouch={isTouch} onStart={() => go(1)} />
            ) : step === 1 ? (
              <SignOnStep name={name} onName={onName} isTouch={isTouch} />
            ) : step === 2 ? (
              <PerilStep difficulty={difficulty} onDifficulty={onDifficulty} />
            ) : step === 3 ? (
              <EraStep era={era} onEra={onEra} name={name} difficulty={difficulty} onJump={go} />
            ) : (
              <ShipStep era={era} onEra={onEra} name={name} difficulty={difficulty} onJump={go} />
            )}
          </div>
        </div>

        {/* ---- cabinet controls ---- */}
        <footer className="flex flex-wrap items-center justify-between gap-2 px-2 py-2 sm:px-3 sm:py-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHelp(true)}
              className="btn-wood flex items-center gap-1.5 rounded-full px-3 py-1.5 font-pirate text-lg"
            >
              <BookOpen className="h-4 w-4" />
              Orders &amp; Legends
            </button>
          </div>
          {step === 0 ? (
            <div className="arcade-tag text-[0.6rem] opacity-70 sm:text-xs">
              {isTouch ? '1 coin · 1 play' : 'Enter — start · M — mute'}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
              <button
                type="button"
                onClick={back}
                className="arcade-arrow px-3 py-1.5 font-pirate text-lg sm:px-4"
              >
                ◂ Back
              </button>
              <button
                type="button"
                onClick={launch}
                className="btn-seal anim-pulse flex flex-1 items-center justify-center gap-2 px-5 py-2 text-2xl sm:flex-none sm:gap-3 sm:px-8 sm:text-3xl"
              >
                <Sailboat className="h-6 w-6 sm:h-7 sm:w-7" />
                {step === 1
                  ? 'Next: Peril ▸'
                  : step === 2
                    ? 'Next: Era ▸'
                    : step === 3
                      ? 'Next: Hero Ship ▸'
                      : 'Set Sail!'}
              </button>
            </div>
          )}
        </footer>
      </div>

      {/* the glass over the cabinet: scanlines and a soft vignette */}
      <div className="crt-overlay" aria-hidden />

      {help && (
        <HelpOverlay
          era={era}
          scores={scores}
          isTouch={isTouch}
          settings={settings}
          onSettings={onSettings}
          onClose={() => setHelp(false)}
        />
      )}
    </div>
  );
}

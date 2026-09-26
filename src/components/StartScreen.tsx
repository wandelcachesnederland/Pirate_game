import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
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
import { fmt } from '../i18n';
import { HighScoreTable, KeyCap, LanguagePicker, SoundToggles } from './ui';
import { EraCarousel } from './EraCarousel';
import { HeroShipPicker } from './HeroShipPicker';
import { TitleStep } from './TitleStep';
import { PerilStep } from './PerilStep';
import { ModeSelectScreen, type GameModeId } from './ModeSelectScreen';
import { ArcadeSelectScreen, type ArcadeModeId } from './ArcadeSelectScreen';
import { CampaignIntroScreen } from './CampaignIntroScreen';
import { ERA_FLAGSHIPS, ERA_SHIPS, eraShip } from '../game/ships/era';
import { isSteelHull } from '../game/types';
import { oldestEra } from '../game/campaign';

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
  arcadeMode: ArcadeModeId;
  onArcadeMode: (id: ArcadeModeId) => void;
  /** Sent when the player picks a mode that leaves the arcade flow (Trade). */
  onMode?: (mode: GameModeId) => void;
  /** What the menu's deck is playing — named on the attract screen. */
  nowPlaying?: string;
}

/**
 * The screens of putting to sea:
 * 0 title, 1 game mode (arcade/adventure/trade), 2 arcade sub-mode (practice/era/campaign),
 * 3 sign on, 4 peril, 5 era (or campaign intro), 6 hero ship
 */
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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

/** Step three, filling the screen: the captain signs the book. */
export function SignOnStep({ name, onName, isTouch }: { name: string; onName: (s: string) => void; isTouch: boolean }) {
  const { t } = useTranslation('menu');
  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
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
        <div className="arcade-tag text-[0.6rem] sm:text-xs">{t('signon.stepTag')}</div>
        <h1 className="title-gold mt-1 text-[3.2rem] leading-[0.9] sm:text-7xl">{t('brand')}</h1>
        <div className="mt-1 flex items-center justify-center gap-2 text-parch/90 sm:gap-3">
          <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="font-fell text-[0.6rem] uppercase italic tracking-[0.28em] sm:text-xs">
            {t('tagline')}
          </span>
          <Skull className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>

        <div className="arcade-panel mt-4 p-3 text-left sm:mt-6 sm:p-5">
          <div className="marquee-bulbs opacity-70" aria-hidden />
          <h2 className="arcade-marquee mt-2 text-2xl sm:text-3xl">{t('signon.heading')}</h2>
          <p className="mb-2 text-[0.72rem] italic opacity-70">{t('signon.bookLine')}</p>
          <label htmlFor="captain" className="arcade-tag mb-1 block text-[0.58rem] opacity-90">
            {t('signon.captainLabel')}
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
              title={t('signon.diceTitle')}
              aria-label={t('signon.diceAria')}
              className="arcade-arrow grid w-12 shrink-0 place-items-center sm:w-14"
            >
              <Dices className="h-6 w-6" />
            </button>
          </div>
          <p className="mt-2 text-center text-[0.74rem] italic leading-snug opacity-80">
            {isTouch ? t('signon.hintTouch') : t('signon.hintKeys')}
          </p>
          <div className="mt-3 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.72rem] italic leading-snug opacity-85">
            {t('signon.nextBox')}
          </div>
        </div>
        <p className="mt-3 text-[0.7rem] italic opacity-60">{t('newHandBottom')}</p>
      </div>
    </div>
  );
}

// ------------------------------------------------------- steps era & ship

/** What the two picker steps need: the choices, and the ladder to walk back. */
interface PickStepProps {
  era: EraId;
  onEra: (id: EraId) => void;
  name: string;
  difficulty: DifficultyId;
  arcadeMode: ArcadeModeId;
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
  showEra?: boolean;
  onJump: (step: Step) => void;
}) {
  const { t } = useTranslation(['common', 'peril', 'eras']);
  const peril = difficultyById(difficulty);
  const ship = eraShip(era);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={() => onJump(3)} title={t('common:changeCaptain')} className={CHIP}>
        {name.trim() || t('common:nameless')}
        <Pencil className="h-3.5 w-3.5 opacity-70" />
      </button>
      <button type="button" onClick={() => onJump(4)} title={t('common:changePeril')} className={CHIP}>
        {'☠'.repeat(peril.skulls)} {t(`peril:${difficulty}.name`)}
        <Pencil className="h-3.5 w-3.5 opacity-70" />
      </button>
      {showEra && (
        <button type="button" onClick={() => onJump(5)} title={t('common:changeEra')} className={CHIP}>
          {t(`eras:${era}.name`)} · {ship.year}
          <Pencil className="h-3.5 w-3.5 opacity-70" />
        </button>
      )}
    </div>
  );
}

/** Step five, filling the screen: the age and the waters it is fought in. */
export function EraStep({ era, onEra, name, difficulty, onJump }: PickStepProps) {
  const { t } = useTranslation('eras');
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto no-scrollbar p-2 sm:gap-2 sm:p-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">{t('ui.stepTag')}</div>
          <h2 className="arcade-marquee text-xl leading-none sm:text-3xl">{t('ui.heading')}</h2>
        </div>
        <ChoiceChips name={name} difficulty={difficulty} era={era} onJump={onJump} />
      </div>
      <EraCarousel era={era} onEra={onEra} />
      <p className="shrink-0 text-center text-[0.64rem] italic leading-snug opacity-60">{t('ui.hint')}</p>
    </div>
  );
}

/** Step six, filling the screen: the hero hull you take into those waters. */
export function ShipStep({ era, onEra, name, difficulty, arcadeMode, onJump }: PickStepProps) {
  const { t } = useTranslation('eras');
  const isCampaign = arcadeMode === 'campaign';
  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto no-scrollbar p-2 sm:gap-2 sm:p-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-2 gap-y-1">
        <div>
          <div className="arcade-tag text-[0.6rem] sm:text-xs">
            {isCampaign ? t('shipStep.stepTagCampaign') : t('shipStep.stepTag')}
          </div>
          <h2 className="arcade-marquee text-xl leading-none sm:text-3xl">
            {isCampaign ? t('shipStep.headingCampaign') : t('shipStep.heading')}
          </h2>
        </div>
        <ChoiceChips name={name} difficulty={difficulty} era={era} showEra={!isCampaign} onJump={onJump} />
      </div>
      <HeroShipPicker era={era} onEra={onEra} />
      <p className="shrink-0 text-center text-[0.64rem] italic leading-snug opacity-60">
        {isCampaign ? t('shipStep.hintCampaign') : t('shipStep.hint')}
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
  const { t } = useTranslation('screens');
  const flagship = ERA_FLAGSHIPS[era];
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
            <h2 className="arcade-marquee text-2xl sm:text-4xl">{t('help.title')}</h2>
            <p className="text-[0.7rem] italic opacity-70">{t('help.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('help.close')}
            className="arcade-arrow grid h-10 w-10 shrink-0 place-items-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-3 text-sm leading-snug text-parch/90">{t('help.intro')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <section>
            <h3 className="mb-1 flex items-center gap-2 font-pirate text-xl">
              {isTouch ? <Hand className="h-5 w-5" /> : <Keyboard className="h-5 w-5" />}
              {t('help.atHelm')}
            </h3>
            {isTouch ? (
              <ul className="space-y-1 text-[0.95rem] leading-snug">
                <li>{t('help.touchSteer')}</li>
                <li>{t('help.touchFire')}</li>
                <li>{t('help.touchSides')}</li>
                <li>{t('help.touchBoard')}</li>
                <li>{t('help.touchGrape')}</li>
              </ul>
            ) : (
              <ul className="divide-y divide-parch/15">
                <Row
                  keys={
                    <>
                      <KeyCap>A</KeyCap>
                      <KeyCap>D</KeyCap>
                      <span className="px-0.5 text-xs opacity-60">{t('help.or')}</span>
                      <KeyCap>←</KeyCap>
                      <KeyCap>→</KeyCap>
                    </>
                  }
                  label={t('help.steer')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap>W</KeyCap>
                      <KeyCap>S</KeyCap>
                      <span className="px-0.5 text-xs opacity-60">{t('help.or')}</span>
                      <KeyCap>↑</KeyCap>
                      <KeyCap>↓</KeyCap>
                    </>
                  }
                  label={t('help.sails')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap>Q</KeyCap>
                      <KeyCap>E</KeyCap>
                    </>
                  }
                  label={t('help.broadsides')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap className="px-3">Space</KeyCap>
                      <span className="px-0.5 text-xs opacity-60">{t('help.or')}</span>
                      <KeyCap>{t('help.click')}</KeyCap>
                    </>
                  }
                  label={t('help.smart')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap>F</KeyCap>
                    </>
                  }
                  label={t('help.board')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap>R</KeyCap>
                    </>
                  }
                  label={t('help.grape')}
                />
                <Row
                  keys={
                    <>
                      <KeyCap>P</KeyCap>
                      <KeyCap>Esc</KeyCap>
                      <KeyCap>M</KeyCap>
                    </>
                  }
                  label={t('help.pauseMute')}
                />
              </ul>
            )}
          </section>

          <section className="flex flex-col">
            <HighScoreTable scores={scores} limit={isTouch ? 5 : 8} dark />
            <div className="mt-3 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.85rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Wind className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  {isSteelHull(flagship.hullStyle)
                    ? t('help.poweredNote')
                    : flagship.oared
                      ? t('help.oaredNote')
                      : t('help.sailNote')}{' '}
                  {t('help.streakNote')}
                </span>
              </p>
            </div>
            <div className="mt-2 rounded-lg border border-parch/25 bg-black/30 p-2 text-[0.85rem] italic leading-snug">
              <p className="flex items-start gap-2">
                <Flag className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{t('help.prizeNote')}</span>
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

/** The ladder on the cabinet face: one plate per decision after the title. */
const STEP_PLATES: { n: 1 | 2 | 3 | 4 | 5 | 6; key: string }[] = [
  { n: 1, key: 'mode' },
  { n: 2, key: 'arcade' },
  { n: 3, key: 'signOn' },
  { n: 4, key: 'peril' },
  { n: 5, key: 'era' },
  { n: 6, key: 'heroShip' },
];

/**
 * The port, arcade style: one screen per decision.
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
  arcadeMode,
  onArcadeMode,
  onMode,
  nowPlaying,
}: Props) {
  const { t } = useTranslation(['menu', 'common', 'screens']);
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

  const launch = () => (step === 6 ? onStart() : go((step + 1) as Step));
  const back = () => {
    if (step > 0) go((step - 1) as Step);
  };

  // arcade sub-mode selection helpers
  const selectArcadeMode = (m: ArcadeModeId) => {
    if (m === 'practice') return;
    onArcadeMode(m);
    if (m === 'campaign') {
      // lock to oldest era for campaign start
      const oldest = oldestEra();
      if (era !== oldest.id) onEra(oldest.id);
    }
    go(3);
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
      if (step === 4 && !typing) {
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
          Digit1: 0,
          Digit2: 1,
          Digit3: 2,
          Digit4: 3,
          Digit5: 4,
          Numpad1: 0,
          Numpad2: 1,
          Numpad3: 2,
          Numpad4: 3,
          Numpad5: 4,
        };
        if (e.code in num && DIFFICULTIES[num[e.code]]) {
          e.preventDefault();
          onDifficulty(DIFFICULTIES[num[e.code]].id);
          return;
        }
      }
      // the chart and the hero roster are the same choice seen twice, so the
      // arrows cycle the age on both screens — but not in campaign (locked)
      if ((step === 5 || step === 6) && !typing && (e.code === 'ArrowLeft' || e.code === 'ArrowRight')) {
        if (arcadeMode === 'campaign' && step === 5) return; // locked
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
  }, [step, help, onStart, difficulty, onDifficulty, era, onEra, arcadeMode]);

  const hiScore = scores[0]?.score ?? 0;
  const anim =
    stage === 'out' ? (dir === 'fwd' ? 'screen-fwd-out' : 'screen-back-out') : dir === 'fwd' ? 'screen-fwd-in' : 'screen-back-in';
  const plate = (n: 1 | 2 | 3 | 4 | 5 | 6): 'todo' | 'active' | 'done' =>
    step === n ? 'active' : step > n ? 'done' : 'todo';

  return (
    <div className="absolute inset-0 overflow-hidden anim-fade">
      <div className="flex h-full flex-col">
        {/* ---- marquee ---- */}
        <header className="arcade-panel mx-2 mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-2.5 py-1.5 sm:mx-3 sm:mt-3 sm:px-4">
          <div className="flex items-center gap-2">
            <Skull className="h-4 w-4 text-gold sm:h-5 sm:w-5" />
            <span className="arcade-marquee text-xl leading-none sm:text-2xl">{t('menu:brand')}</span>
          </div>
          {step === 0 ? (
            <div className="order-last flex w-full items-center justify-center gap-1.5 sm:order-none sm:w-auto">
              <span className="arcade-tag text-[0.6rem] opacity-70 sm:text-xs">{t('menu:stepLabel0')}</span>
              {settings.music && nowPlaying && (
                <span
                  className="flex items-center gap-1 rounded-full border border-gold/40 bg-black/40 px-2 py-0.5 text-[0.56rem] italic text-gold/85 sm:text-[0.62rem]"
                  title={t('menu:deckTitle')}
                >
                  <Music className="h-3 w-3 shrink-0" />
                  <span className="max-w-[12rem] truncate">{nowPlaying}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="order-last flex w-full items-center justify-center gap-1 sm:order-none sm:w-auto sm:gap-1.5">
              {STEP_PLATES.map(({ n, key }, i) => (
                <span key={n} className="flex items-center gap-1 sm:gap-1.5">
                  {i > 0 && <span className="font-pirate text-lg text-gold/70">›</span>}
                  <StepPlate n={n} label={t(`menu:plates.${key}`)} state={plate(n)} onClick={step > n ? () => go(n) : undefined} />
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-[0.56rem] sm:text-[0.64rem]">
            <span className="arcade-tag">{t('common:hiScore', { score: fmt(hiScore) })}</span>
            <span className="arcade-tag anim-blink hidden sm:inline">{t('common:insertCoin')}</span>
          </div>
        </header>

        {/* ---- the step, filling everything left ---- */}
        <div className="relative min-h-0 flex-1">
          <div className={`h-full ${anim}`} key={step}>
            {step === 0 ? (
              <TitleStep hiScore={hiScore} scores={scores} isTouch={isTouch} onStart={() => go(1)} />
            ) : step === 1 ? (
              <ModeSelectScreen
                isTouch={isTouch}
                onSelect={(m) => {
                  if (m === 'trade' || m === 'adventure') onMode?.(m);
                  else go(2);
                }}
              />
            ) : step === 2 ? (
              <ArcadeSelectScreen isTouch={isTouch} onSelect={selectArcadeMode} />
            ) : step === 3 ? (
              <SignOnStep name={name} onName={onName} isTouch={isTouch} />
            ) : step === 4 ? (
              <PerilStep difficulty={difficulty} onDifficulty={onDifficulty} />
            ) : step === 5 ? (
              arcadeMode === 'campaign' ? (
                <CampaignIntroScreen era={era} difficulty={difficulty} name={name} onJump={go as any} />
              ) : (
                <EraStep era={era} onEra={onEra} name={name} difficulty={difficulty} arcadeMode={arcadeMode} onJump={go} />
              )
            ) : (
              <ShipStep era={era} onEra={onEra} name={name} difficulty={difficulty} arcadeMode={arcadeMode} onJump={go} />
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
              {t('screens:help.button')}
            </button>
            <LanguagePicker dark />
          </div>
          {step === 0 ? (
            <div className="arcade-tag text-[0.6rem] opacity-70 sm:text-xs">
              {isTouch ? t('menu:footer.coinTouch') : t('menu:footer.coinKeys')}
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
              <button
                type="button"
                onClick={back}
                className="arcade-arrow px-3 py-1.5 font-pirate text-lg sm:px-4"
              >
                {t('common:back')}
              </button>
              <button
                type="button"
                onClick={launch}
                className="btn-seal anim-pulse flex flex-1 items-center justify-center gap-2 px-5 py-2 text-2xl sm:flex-none sm:gap-3 sm:px-8 sm:text-3xl"
              >
                <Sailboat className="h-6 w-6 sm:h-7 sm:w-7" />
                {step === 1
                  ? t('menu:launch.arcade')
                  : step === 2
                    ? arcadeMode === 'campaign'
                      ? t('menu:launch.campaign')
                      : arcadeMode === 'era'
                        ? t('menu:launch.era')
                        : t('menu:launch.next')
                    : step === 3
                      ? t('menu:launch.nextPeril')
                      : step === 4
                        ? t('menu:launch.nextEra')
                        : step === 5
                          ? t('menu:launch.nextHeroShip')
                          : t('menu:launch.sail')}
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

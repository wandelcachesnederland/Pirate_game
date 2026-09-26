import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { paintSplashFrame, restFrame, splashFrame, type SplashFrame } from '../game/splash/anim';
import { FANFARE_HIT, SplashFanfare } from '../game/splash/fanfare';

/** How long the card runs (from the first note) before it starts to fade. */
const HOLD_MS = 5000;
/** Logo and music fade out together over this long. */
const FADE_MS = 1400;
/** A skipped sting still fades, just quicker. */
const SKIP_FADE_MS = 500;

interface Props {
  /** Whether the player wants music at all (saved setting). */
  music: boolean;
  /** The logo has begun to fade: the next screen may appear beneath it. */
  onFadeStart: () => void;
  /** The logo is gone. */
  onDone: () => void;
}

type Phase = 'waiting' | 'playing' | 'fading';

/** The plate is drawn in blocks, so most frames repeat: only paint a change. */
function signature(f: SplashFrame): string {
  let s = `${f.dx}|${f.dy}|${f.tail}|${f.blink ? 1 : 0}|${f.letters.join('')}|${f.fx.length}`;
  for (const x of f.fx) s += `${x.x},${x.y};`;
  return s;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * The studio card shown at start-up: the Bit Squirrel mascot trots onto an
 * empty plate, flicks its tail and blinks, and the studio name stamps down one
 * letter per beat of the sting — ending on the still logo. Then logo and music
 * fade out together onto the title screen. Any key or tap skips it.
 *
 * Browsers only let sound start after a gesture. If autoplay is blocked the
 * mascot waits on its own plate with a blinking "press any key" — that press
 * starts the sting and the whole card with it.
 */
export function SplashScreen({ music, onFadeStart, onDone }: Props) {
  const { t } = useTranslation('screens');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [fadeMs, setFadeMs] = useState(FADE_MS);
  const [hit, setHit] = useState(false);
  const phaseRef = useRef<Phase>('waiting');
  const beganAt = useRef(0);
  const reduced = useRef(prefersReducedMotion());
  const cb = useRef({ onFadeStart, onDone });
  cb.current = { onFadeStart, onDone };

  // ---- the animation itself: a clock in, a plate out
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    if (reduced.current || phase === 'fading') {
      paintSplashFrame(cv, restFrame());
      return;
    }
    // waiting: the mascot alone on its plate, alive; playing: the whole card
    const from = phase === 'playing' ? beganAt.current : performance.now();
    let raf = 0;
    let last = '';
    let painted = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      if (now - painted < 16) return;
      painted = now;
      const frame = splashFrame(now - from, phase === 'playing');
      const sig = signature(frame);
      if (sig === last) return;
      last = sig;
      paintSplashFrame(cv, frame);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // ---- the sting, and the hand that fades both away
  useEffect(() => {
    const fanfare = music ? new SplashFanfare() : null;
    const timers: number[] = [];
    let disposed = false;

    const setP = (p: Phase) => {
      phaseRef.current = p;
      setPhase(p);
    };

    const fade = (ms: number) => {
      if (phaseRef.current === 'fading') return;
      timers.forEach((id) => window.clearTimeout(id));
      timers.length = 0;
      setFadeMs(ms);
      setP('fading');
      fanfare?.fadeOut(ms / 1000);
      cb.current.onFadeStart();
      timers.push(window.setTimeout(() => cb.current.onDone(), ms));
    };

    const begin = () => {
      if (disposed || phaseRef.current !== 'waiting') return;
      beganAt.current = performance.now();
      fanfare?.play();
      setP('playing');
      timers.push(window.setTimeout(() => setHit(true), FANFARE_HIT * 1000 + 60));
      timers.push(window.setTimeout(() => fade(FADE_MS), HOLD_MS));
    };

    // try to autoplay; if the browser blocks it, wait for the first gesture
    if (!fanfare || !fanfare.available) begin();
    else
      fanfare.resume().then((ok) => {
        if (ok) begin();
      });

    const onGesture = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        // the splash owns the keyboard: nothing reaches the menu or the engine
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.repeat) return;
      }
      if (phaseRef.current === 'waiting') {
        if (!fanfare) return begin();
        // resume() must be called inside the gesture for the browser to allow it
        fanfare.resume().then((ok) => {
          if (ok) begin();
        });
        // play even if resume is slow to report: the timeline starts now
        window.setTimeout(begin, 300);
      } else if (phaseRef.current === 'playing' && performance.now() - beganAt.current > 450) {
        // (a single tap fires pointerup AND touchend — don't let it start and skip at once)
        fade(SKIP_FADE_MS);
      }
    };
    window.addEventListener('keydown', onGesture, true);
    window.addEventListener('pointerup', onGesture, true);
    window.addEventListener('touchend', onGesture, true);

    return () => {
      disposed = true;
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('keydown', onGesture, true);
      window.removeEventListener('pointerup', onGesture, true);
      window.removeEventListener('touchend', onGesture, true);
      fanfare?.dispose();
    };
  }, [music]);

  return (
    <div
      className="bitsq-splash fixed inset-0 z-50 grid place-items-center bg-black"
      style={{
        opacity: phase === 'fading' ? 0 : 1,
        transition: `opacity ${fadeMs}ms ease-in`,
        pointerEvents: phase === 'fading' ? 'none' : 'auto',
      }}
      role="img"
      aria-label={t('splash.presents')}
    >
      <div className="bitsq-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div className={`bitsq-card-in flex flex-col items-center gap-6 ${phase === 'waiting' ? 'bitsq-card-wait' : ''}`}>
        <canvas ref={canvasRef} className={`bitsq-logo ${hit && !reduced.current ? 'bitsq-logo-hit' : ''}`} />
        <div className="bitsq-caption h-6">
          {phase === 'waiting' ? (
            <span className="bitsq-blink">{t('splash.pressAnyKey')}</span>
          ) : (
            <span className={hit ? 'bitsq-presents bitsq-presents-on' : 'bitsq-presents'}>{t('splash.presentsShort')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

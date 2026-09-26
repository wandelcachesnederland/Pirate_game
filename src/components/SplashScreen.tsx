import { useEffect, useRef, useState } from 'react';
import { FONT, SQUIRREL, SQUIRREL_PALETTE, textWidth } from '../game/splash/pixels';
import { FANFARE_HIT, SplashFanfare } from '../game/splash/fanfare';

/** How long the logo holds (from the first note) before it starts to fade. */
const HOLD_MS = 4400;
/** Logo and music fade out together over this long. */
const FADE_MS = 1400;
/** A skipped sting still fades, just quicker. */
const SKIP_FADE_MS = 500;

const TITLE = 'BIT SQUIRREL';
/** Banded 8-bit title colours, top row to bottom row of the 7-pixel glyphs. */
const TITLE_BANDS = ['#fff6d0', '#ffe39a', '#ffc85a', '#ffa23a', '#f5782c', '#dc5220', '#b0341a'];

interface Props {
  /** Whether the player wants music at all (saved setting). */
  music: boolean;
  /** The logo has begun to fade: the next screen may appear beneath it. */
  onFadeStart: () => void;
  /** The logo is gone. */
  onDone: () => void;
}

type Phase = 'waiting' | 'playing' | 'fading';

/** Draw title + squirrel into a tiny canvas; CSS scales it up with crisp pixels. */
function drawLogo(canvas: HTMLCanvasElement) {
  const tw = textWidth(TITLE);
  // the mascot is drawn with chunkier pixels than the lettering, arcade-marquee style
  const k = 2;
  const sw = SQUIRREL[0].length * k;
  const pad = 3;
  const gap = 6;
  const w = Math.max(tw, sw) + pad * 2 + 1;
  const h = pad + 7 + gap + SQUIRREL.length * k + pad;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);

  // title: drop shadow first, then the colour bands
  const tx = Math.floor((w - tw) / 2);
  const ty = pad;
  const glyphs = (dx: number, dy: number, color: (row: number) => string) => {
    let x = tx + dx;
    for (const ch of TITLE) {
      const g = FONT[ch] ?? FONT[' '];
      g.forEach((row, ry) => {
        for (let rx = 0; rx < row.length; rx++) {
          if (row[rx] !== 'X') continue;
          ctx.fillStyle = color(ry);
          ctx.fillRect(x + rx, ty + dy + ry, 1, 1);
        }
      });
      x += g[0].length + 1;
    }
  };
  glyphs(1, 1, () => '#5a1408');
  glyphs(0, 0, (ry) => TITLE_BANDS[ry]);

  // the squirrel
  const sx = Math.floor((w - sw) / 2);
  const sy = pad + 7 + gap;
  SQUIRREL.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const c = SQUIRREL_PALETTE[row[x]];
      if (!c) continue;
      ctx.fillStyle = c;
      ctx.fillRect(sx + x * k, sy + y * k, k, k);
    }
  });
}

/**
 * The studio card shown at start-up: the Bit Squirrel logo with its
 * wall-of-sound sting. Plays for a few seconds, then logo and music fade out
 * together onto the title screen. Any key or tap skips it.
 *
 * Browsers only let sound start after a gesture. If autoplay is blocked the
 * logo waits with a blinking "press any key" — that press starts the sting.
 */
export function SplashScreen({ music, onFadeStart, onDone }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>('waiting');
  const [fadeMs, setFadeMs] = useState(FADE_MS);
  const [hit, setHit] = useState(false);
  const phaseRef = useRef<Phase>('waiting');
  const cb = useRef({ onFadeStart, onDone });
  cb.current = { onFadeStart, onDone };

  useEffect(() => {
    if (canvasRef.current) drawLogo(canvasRef.current);
  }, []);

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

    let beganAt = 0;
    const begin = () => {
      if (disposed || phaseRef.current !== 'waiting') return;
      beganAt = performance.now();
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
      } else if (phaseRef.current === 'playing' && performance.now() - beganAt > 450) {
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
      aria-label="Bit Squirrel presents"
    >
      <div className="bitsq-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div className="flex flex-col items-center gap-6">
        <canvas
          ref={canvasRef}
          className={`bitsq-logo ${phase !== 'waiting' ? 'bitsq-logo-in' : ''} ${hit ? 'bitsq-logo-hit' : ''}`}
        />
        <div className="bitsq-caption h-6">
          {phase === 'waiting' ? (
            <span className="bitsq-blink">Press any key or tap</span>
          ) : (
            <span className={hit ? 'bitsq-presents bitsq-presents-on' : 'bitsq-presents'}>presents</span>
          )}
        </div>
      </div>
    </div>
  );
}

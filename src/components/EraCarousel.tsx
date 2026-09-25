import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import type { EraId } from '../game/types';
import { ERA_SHIPS, type EraShip } from '../game/ships/era';
import { shipScores, shipTraits } from '../game/ships/traits';
import { regionById } from '../game/worlds';
import { makeCanvas } from '../game/canvas';
import { drawPortraitShip, paintWater, paintWatersPostcard } from '../game/portrait';

interface Props {
  era: EraId;
  onEra: (id: EraId) => void;
}

// backing-store sizes: the canvases are drawn fixed-size and scaled down by CSS,
// so they stay sharp on high-DPI phones without a resize observer
const SEA_W = 1040;
const SEA_H = 468;
const HULL_W = 420;
const HULL_H = 560;

const PIRATA = '"Pirata One", Georgia, serif';

/** Stable per-era seed so each chart always shows the same islands. */
function seedOf(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h) % 100000;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Run `draw` on a canvas once fonts (Pirata One) are ready to be painted. */
function useCanvasPaint(
  draw: (ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement) => void,
  deps: unknown[],
) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let alive = true;
    draw(ctx, cv);
    // canvas text in the webfont: repaint once the font actually lands
    document.fonts?.ready.then(() => {
      if (alive && ref.current === cv) draw(ctx, cv);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ref;
}

/** The postcard of one era's waters: its own islands on its own sea. */
function WatersArt({ e }: { e: EraShip }) {
  const ref = useCanvasPaint(
    (ctx, cv) => {
      cv.width = SEA_W;
      cv.height = SEA_H;
      paintWatersPostcard(ctx, regionById(e.region), SEA_W, SEA_H, seedOf(e.id, 17));
    },
    [e],
  );
  return <canvas ref={ref} className="block w-full" aria-hidden />;
}

/** The era's hero hull, alive on the water: portrait art from the game itself. */
function HeroPortrait({ e }: { e: EraShip }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const region = regionById(e.region);
    cv.width = HULL_W;
    cv.height = HULL_H;
    const [bg, bctx] = makeCanvas(HULL_W, HULL_H);
    paintWater(bctx, region, HULL_W, HULL_H, seedOf(e.id, 91), 18);
    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < 45) return; // ~22 fps: rigging only, keep it cheap
      last = now;
      ctx.clearRect(0, 0, HULL_W, HULL_H);
      ctx.drawImage(bg, 0, 0);
      drawPortraitShip(ctx, e.def, HULL_W, HULL_H, now / 1000, 0.85);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [e]);
  return <canvas ref={ref} className="block w-full" aria-hidden />;
}

/** One numbered plate on the transport strip — the arcade era selector. */
function Slot({
  e,
  i,
  on,
  onPick,
}: {
  e: EraShip;
  i: number;
  on: boolean;
  onPick: (id: EraId) => void;
}) {
  const ref = useCanvasPaint(
    (ctx, cv) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = 74;
      const h = 56;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, 0, h);
      if (on) {
        g.addColorStop(0, '#d2452f');
        g.addColorStop(0.55, '#8e1c14');
        g.addColorStop(1, '#560d07');
      } else {
        g.addColorStop(0, '#31496b');
        g.addColorStop(0.55, '#1a2a44');
        g.addColorStop(1, '#0a1322');
      }
      rr(ctx, 1.5, 1.5, w - 3, h - 3, 8);
      ctx.fillStyle = g;
      ctx.fill();
      const sw = regionById(e.region).swatch;
      const bw = 13;
      let sx = (w - sw.length * bw) / 2;
      for (const c of sw) {
        ctx.fillStyle = c;
        ctx.fillRect(sx, h - 10, bw - 1.5, 4.5);
        sx += bw;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `32px ${PIRATA}`;
      ctx.fillStyle = on ? '#fff5dc' : '#ffd15e';
      if (on) {
        ctx.shadowColor = 'rgba(255,140,70,0.95)';
        ctx.shadowBlur = 12;
      }
      ctx.fillText(String(i + 1).padStart(2, '0'), w / 2, h / 2 - 6);
      ctx.shadowBlur = 0;
      ctx.font = `12px ${PIRATA}`;
      ctx.fillStyle = on ? 'rgba(255,242,212,0.95)' : 'rgba(238,222,180,0.72)';
      ctx.fillText(e.year, w / 2, h / 2 + 14);
      rr(ctx, 1.5, 1.5, w - 3, h - 3, 8);
      ctx.strokeStyle = on ? '#ffd863' : 'rgba(169,126,51,0.7)';
      ctx.lineWidth = on ? 2.5 : 1.5;
      ctx.stroke();
    },
    [e, i, on],
  );
  return (
    <button
      type="button"
      data-slot={i}
      aria-pressed={on}
      aria-label={`${e.era}, ${e.year}`}
      title={`${e.era} — ${e.year}`}
      onClick={() => onPick(e.id)}
      className="arcade-slot shrink-0 rounded-lg"
    >
      <canvas ref={ref} className="block h-14 w-[4.625rem]" />
    </button>
  );
}

function StatBar({ label, v, tint }: { label: string; v: number; tint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-9 shrink-0 text-[0.6rem] uppercase tracking-wider opacity-65">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/45">
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(6, Math.min(100, v * 100))}%`, background: tint }}
        />
      </span>
    </div>
  );
}

/** The hero hull card: portrait art, her numbers, and what she is good and bad at. */
function HullCard({ e }: { e: EraShip }) {
  const { strengths, weaknesses } = shipTraits(e.def);
  const sc = shipScores(e.def);
  return (
    <div className="rounded-xl border-2 border-gold/45 bg-black/35 p-2 sm:p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="arcade-tag text-[0.58rem] sm:text-[0.65rem]">Hero Ship</span>
        <span className="text-[0.58rem] italic opacity-60">her numbers against the whole fleet</span>
      </div>
      <div className="mt-1.5 grid gap-2.5 sm:grid-cols-[10.5rem_1fr] lg:grid-cols-1 xl:grid-cols-[10.5rem_1fr]">
        <div>
          <div className="arcade-frame mx-auto w-[62%] max-w-[13rem] sm:w-full sm:max-w-none">
            <HeroPortrait e={e} />
          </div>
          <div className="mt-1.5 space-y-1">
            <StatBar label="Hull" v={sc.hull} tint="linear-gradient(90deg,#e07a4a,#b3261e)" />
            <StatBar label="Speed" v={sc.speed} tint="linear-gradient(90deg,#77e0c0,#1b7898)" />
            <StatBar label="Guns" v={sc.guns} tint="linear-gradient(90deg,#ffd863,#c8912a)" />
            <StatBar label="Helm" v={sc.helm} tint="linear-gradient(90deg,#b9c7f0,#3d55a8)" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="font-pirate text-2xl leading-none sm:text-3xl">{e.def.name}</div>
            <div className="text-[0.62rem] uppercase tracking-[0.16em] opacity-65">
              {e.era} · {e.year}
            </div>
          </div>
          <div>
            <div className="arcade-tag mb-1 text-[0.58rem] opacity-90">Strengths</div>
            <div className="flex flex-col gap-1">
              {strengths.map((s) => (
                <span key={s} className="trait-chip trait-good">
                  <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="arcade-tag mb-1 text-[0.58rem] opacity-90">Weaknesses</div>
            <div className="flex flex-col gap-1">
              {weaknesses.map((s) => (
                <span key={s} className="trait-chip trait-bad">
                  <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{s}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Step two of putting to sea, arcade style: scroll the charts to a stretch of
 * water and see exactly what waits there — the era's own islands, its hero
 * hull, and that hull's strengths and weaknesses. The era decides both the
 * flagship and the sea she fights in.
 */
export function EraCarousel({ era, onEra }: Props) {
  const eraIdx = Math.max(
    0,
    ERA_SHIPS.findIndex((s) => s.id === era),
  );
  const [idx, setIdx] = useState(eraIdx);
  // the screen swaps on a beat: slide the old chart out, then the new one in
  const [stage, setStage] = useState<'in' | 'out'>('in');
  const stripRef = useRef<HTMLDivElement | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (eraIdx === idx) return;
    setStage('out');
    const t = window.setTimeout(() => {
      setIdx(eraIdx);
      setStage('in');
    }, 170);
    return () => window.clearTimeout(t);
  }, [eraIdx, idx]);

  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector<HTMLElement>(`[data-slot="${idx}"]`);
    if (!strip || !el) return;
    // scroll the strip itself: the page must not jump when the menu loads
    strip.scrollTo({
      left: Math.max(0, el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2),
      behavior: firstRun.current ? 'auto' : 'smooth',
    });
    firstRun.current = false;
  }, [idx]);

  // dragging the chart sideways scrolls to the next era, arcade-style
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [dragX, setDragX] = useState(0);

  const shown = ERA_SHIPS[idx];
  const sea = regionById(shown.region);
  const step = (d: number) =>
    onEra(ERA_SHIPS[(idx + d + ERA_SHIPS.length) % ERA_SHIPS.length].id);

  return (
    <section
      className="arcade-panel select-none p-2.5 sm:p-4"
      onKeyDown={(ev) => {
        if (ev.key === 'ArrowLeft') {
          ev.preventDefault();
          step(-1);
        } else if (ev.key === 'ArrowRight') {
          ev.preventDefault();
          step(1);
        }
      }}
    >
      <div className="grid gap-3 lg:grid-cols-[1.32fr_1fr]">
      {/* ---- the chart screen ---- */}
      <div>
      <div
        className="arcade-frame cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={(ev) => {
          if (ev.pointerType === 'mouse' && ev.button !== 0) return;
          // never let the drag steal the arrow buttons' click
          if ((ev.target as HTMLElement).closest('button')) return;
          drag.current = { x: ev.clientX, id: ev.pointerId };
          ev.currentTarget.setPointerCapture(ev.pointerId);
        }}
        onPointerMove={(ev) => {
          const d = drag.current;
          if (!d || d.id !== ev.pointerId) return;
          setDragX(Math.max(-70, Math.min(70, ev.clientX - d.x)));
        }}
        onPointerUp={(ev) => {
          const d = drag.current;
          drag.current = null;
          setDragX(0);
          if (!d || d.id !== ev.pointerId) return;
          const dx = ev.clientX - d.x;
          if (Math.abs(dx) > 38) step(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragX(0);
        }}
      >
        <div
          className={dragX !== 0 ? '' : stage === 'out' ? 'anim-swap-out' : 'anim-swap-in'}
          style={dragX !== 0 ? { transform: `translateX(${dragX}px)` } : undefined}
        >
          <WatersArt e={shown} />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-1.5 sm:p-2.5">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous era"
            className="arcade-arrow pointer-events-auto grid h-11 w-8 place-items-center sm:h-14 sm:w-11"
          >
            <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next era"
            className="arcade-arrow pointer-events-auto grid h-11 w-8 place-items-center sm:h-14 sm:w-11"
          >
            <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2 sm:p-3">
          <div>
            <div className="font-pirate text-lg leading-none text-parch drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] sm:text-3xl">
              {shown.era}
            </div>
            <div className="font-pirate text-xs text-gold sm:text-base">{shown.year}</div>
          </div>
          <div className="rounded-md border border-gold/60 bg-black/55 px-1.5 py-0.5 text-right sm:px-2 sm:py-1">
            <div className="arcade-tag text-[0.45rem] sm:text-[0.55rem]">Your waters</div>
            <div className="font-pirate text-sm leading-tight sm:text-lg">{sea.name}</div>
            <div className="hidden text-[0.55rem] uppercase tracking-wider opacity-70 sm:block">
              {sea.subtitle}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-[0.78rem] italic leading-snug opacity-85">
        {shown.blurb}
        {shown.homeWaters ? ` — the ${shown.homeWaters}.` : ''}
      </p>

      {/* ---- transport strip: every era as a numbered plate ---- */}
      <div
        ref={stripRef}
        className="scroll-thin relative mt-2 flex gap-1.5 overflow-x-auto pb-1.5"
        role="tablist"
        aria-label="Era"
      >
        {ERA_SHIPS.map((e, i) => (
          <Slot key={e.id} e={e} i={i} on={e.id === era} onPick={onEra} />
        ))}
      </div>
      </div>

      <HullCard e={shown} />
      </div>
    </section>
  );
}

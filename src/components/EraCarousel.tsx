import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EraId } from '../game/types';
import { ERA_SHIPS, type EraShip } from '../game/ships/era';
import { regionById } from '../game/worlds';
import { bossCassette, cassettesForEra } from '../game/music';
import { stableSeed } from '../game/portrait';
import { paintEraScene } from '../game/eraArt';
import { traitDef } from '../game/eraTraits';

// Import the photographic era stills as data URLs so the single-file build
// remains self-contained. Eras without a commissioned still keep their
// procedural scene until that art is added.
const ERA_STILLS = import.meta.glob('../assets/era-stills/*.jpg', {
  eager: true,
  query: '?inline',
  import: 'default',
}) as Record<string, string>;

interface Props {
  era: EraId;
  onEra: (id: EraId) => void;
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

/**
 * Animated hand-painted fallback for eras awaiting a photographic still.
 * Painted to the frame at ~30fps and paused while the tab is hidden.
 */
function ProceduralEraSceneArt({ e }: { e: EraShip }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = cvRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const region = regionById(e.region);
    const seed = stableSeed(e.id, 17);
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const box = wrap.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(200, Math.round(box.width));
      h = Math.max(140, Math.round(box.height));
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || w < 2) return;
      if (now - last < 33) return; // ~30 fps is plenty for a menu card
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintEraScene(ctx, w, h, e, region, now / 1000, seed, dpr);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [e]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={cvRef} className="block h-full w-full" aria-hidden />
    </div>
  );
}

/** Use a cinematic still when it exists; retain the hand-painted scene fallback. */
function EraSceneArt({ e }: { e: EraShip }) {
  const still = ERA_STILLS[`../assets/era-stills/${e.id}.jpg`];
  if (!still) return <ProceduralEraSceneArt e={e} />;

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      <img
        src={still}
        alt=""
        aria-hidden="true"
        draggable={false}
        decoding="async"
        className="h-full w-full select-none object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_44px_rgba(0,0,0,0.48)]" />
    </div>
  );
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
  const still = ERA_STILLS[`../assets/era-stills/${e.id}.jpg`];
  const ref = useCanvasPaint(
    (ctx, cv) => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = 66;
      const h = 48;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      rr(ctx, 1.5, 1.5, w - 3, h - 3, 8);
      if (still) {
        ctx.fillStyle = on ? 'rgba(84,24,12,0.34)' : 'rgba(3,10,18,0.48)';
      } else {
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
        ctx.fillStyle = g;
      }
      ctx.fill();
      const sw = regionById(e.region).swatch;
      const bw = 11;
      let sx = (w - sw.length * bw) / 2;
      for (const c of sw) {
        ctx.fillStyle = c;
        ctx.fillRect(sx, h - 9, bw - 1.5, 4);
        sx += bw;
      }
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '27px "Pirata One", Georgia, serif';
      ctx.fillStyle = on ? '#fff5dc' : '#ffd15e';
      if (on) {
        ctx.shadowColor = 'rgba(255,140,70,0.95)';
        ctx.shadowBlur = 10;
      }
      ctx.fillText(String(i + 1).padStart(2, '0'), w / 2, h / 2 - 6);
      ctx.shadowBlur = 0;
      ctx.font = '10px "Pirata One", Georgia, serif';
      ctx.fillStyle = on ? 'rgba(255,242,212,0.95)' : 'rgba(238,222,180,0.72)';
      ctx.fillText(e.year, w / 2, h / 2 + 12);
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
      className="arcade-slot relative shrink-0 overflow-hidden rounded-lg"
    >
      {still && (
        <img
          src={still}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      <canvas ref={ref} className="relative z-10 block h-12 w-[4.125rem]" />
    </button>
  );
}

/**
 * The era selector, arcade style: scroll the chart to an age and see exactly
 * what waits there — the fight on its own waters, the tapes that play there and
 * the numbered plates of every age in the squadron. The hero hull is not shown
 * here any more: she has a screen of her own straight after this one (see
 * `HeroShipPicker`). The whole screen fits the cabinet: the card takes whatever
 * height is left, and on a phone the step scrolls.
 */
export function EraCarousel({ era, onEra }: Props) {
  const eraIdx = Math.max(
    0,
    ERA_SHIPS.findIndex((s) => s.id === era),
  );
  const [idx, setIdx] = useState(eraIdx);
  // the screen swaps on a beat: slide the old card out, then the new one in
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

  // dragging the card sideways scrolls to the next era, arcade-style
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [dragX, setDragX] = useState(0);

  const shown = ERA_SHIPS[idx];
  const sea = regionById(shown.region);
  const step = (d: number) =>
    onEra(ERA_SHIPS[(idx + d + ERA_SHIPS.length) % ERA_SHIPS.length].id);

  return (
    // NOTE: ← → for the card are handled globally by the start screen so the
    // arrows work without focus; nothing here binds keys anymore.
    <section className="arcade-panel flex min-h-0 select-none flex-col gap-1.5 p-2 sm:gap-2 sm:p-2.5 lg:flex-1">
      {/* ---- the era card: that age's own fight, on its own waters ---- */}
      <div
        className="arcade-frame relative aspect-[16/10] w-full cursor-grab active:cursor-grabbing sm:aspect-[16/8] lg:aspect-auto lg:min-h-[10rem] lg:flex-1"
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
          className={`absolute inset-0 ${dragX !== 0 ? '' : stage === 'out' ? 'anim-swap-out' : 'anim-swap-in'}`}
          style={dragX !== 0 ? { transform: `translateX(${dragX}px)` } : undefined}
        >
          <EraSceneArt e={shown} />
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
        <span className="sr-only" aria-live="polite">
          {shown.era}, {shown.year}. {sea.name}. {shown.blurb}
        </span>
      </div>

      {/* ---- one line of briefing: the age, its waters, and what plays there ---- */}
      <div className="shrink-0 truncate rounded-md border border-gold/30 bg-black/30 px-2 py-1 text-[0.68rem] leading-snug">
        <span className="italic opacity-85">
          {shown.blurb}
          {shown.homeWaters ? ` — the ${shown.homeWaters}.` : ''}
        </span>
        <span className="opacity-40"> · </span>
        <span className="text-gold/90">{sea.name}</span>
        <span className="opacity-40"> · </span>
        <span className="text-sky-200/90">
          {traitDef(shown.id).name}: {traitDef(shown.id).pitch}
        </span>
        <span className="hidden opacity-40 md:inline"> · </span>
        <span className="hidden opacity-70 md:inline">
          {cassettesForEra(shown.id)
            .map((c) => c.title)
            .join(' · ')}
          {' — warship: '}
          {bossCassette(shown.id).title}
        </span>
      </div>

      {/* ---- transport strip: every era as a numbered plate ---- */}
      <div
        ref={stripRef}
        className="scroll-thin relative flex shrink-0 gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Era"
      >
        {ERA_SHIPS.map((e, i) => (
          <Slot key={e.id} e={e} i={i} on={e.id === era} onPick={onEra} />
        ))}
      </div>
    </section>
  );
}

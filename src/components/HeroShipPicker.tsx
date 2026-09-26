// The hero-ship picker: the screen that follows the era selector. The era step
// chooses the age and its waters; this one puts a captain on a hull in it.
//
// Every age sails exactly one flagship (see `game/ships/era`), so the roster at
// the bottom is the whole fleet of heroes: choose another hull and you choose
// her age too. Both screens read and write the same `era` state, so the chart
// and the report can never disagree.

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { isSteelHull, type EraId } from '../game/types';
import { ERA_SHIPS, type EraShip } from '../game/ships/era';
import { shipScores, shipTraits, type ShipScores, type TraitChip } from '../game/ships/traits';
import { armamentFor, armHeavyNameL, armSummaryL, usesGunpowder } from '../game/weapons';
import { regionById } from '../game/worlds';
import { makeCanvas } from '../game/canvas';
import { drawPortraitShip, paintWater, stableSeed } from '../game/portrait';
import { cn } from '../utils/cn';

interface Props {
  era: EraId;
  onEra: (id: EraId) => void;
}

const BARS: [keyof ShipScores, string][] = [
  ['hull', 'linear-gradient(90deg,#e07a4a,#b3261e)'],
  ['speed', 'linear-gradient(90deg,#77e0c0,#1b7898)'],
  ['guns', 'linear-gradient(90deg,#ffd863,#c8912a)'],
  ['helm', 'linear-gradient(90deg,#b9c7f0,#3d55a8)'],
];

const BAR_LABEL: Record<keyof ShipScores, string> = {
  hull: 'barHull',
  speed: 'barSpeed',
  guns: 'barGuns',
  helm: 'barHelm',
};

const GROUP_KEY: Record<string, string> = {
  'Age of Sail': 'groupSail',
  'Steel Navies': 'groupSteel',
  'Heritage Seas': 'groupHeritage',
};

/** The hull herself, alive on her own water: the game's own portrait painter. */
function HeroPortrait({ e }: { e: EraShip }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cvRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = cvRef.current;
    if (!wrap || !cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const region = regionById(e.region);
    let w = 0;
    let h = 0;
    let dpr = 1;
    let water: HTMLCanvasElement | null = null;

    // the frame is sized by the layout, so the portrait is painted to fit it:
    // one water layer, cached until the box or the pixel ratio changes
    const resize = () => {
      const box = wrap.getBoundingClientRect();
      const nw = Math.max(160, Math.round(box.width));
      const nh = Math.max(140, Math.round(box.height));
      const ndpr = Math.min(2, window.devicePixelRatio || 1);
      if (water && nw === w && nh === h && ndpr === dpr) return;
      w = nw;
      h = nh;
      dpr = ndpr;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      // the water is a cached layer, painted at device resolution so a phone
      // still sees crisp swell under the hull
      const [sheet, sctx] = makeCanvas(cv.width, cv.height);
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paintWater(sctx, region, w, h, stableSeed(e.id, 91), 18);
      water = sheet;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf = 0;
    let last = -1;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (document.hidden || !water || w < 2) return;
      if (now - last < 45) return; // ~22 fps: rigging only, keep it cheap
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(water, 0, 0, w, h);
      drawPortraitShip(ctx, e.def, w, h, now / 1000, 0.9);
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

/** One of the four bars: the hull measured against every hero afloat. */
function StatBar({ label, v, tint }: { label: string; v: number; tint: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-11 shrink-0 text-[0.58rem] uppercase tracking-wider opacity-65">{label}</span>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full border border-black/50 bg-black/45">
        <span
          className="block h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.max(6, Math.min(100, v * 100))}%`, background: tint }}
        />
      </span>
    </div>
  );
}

/** A plain number off the ship definition, in the game's own units. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-parch/20 bg-black/30 px-1.5 py-1 text-center leading-tight">
      <div className="text-[0.52rem] uppercase tracking-[0.14em] opacity-60">{label}</div>
      <div className="font-pirate text-lg text-parch sm:text-xl">{value}</div>
    </div>
  );
}

/** One scout-report chip: a dictionary line, or the era's real armament name. */
function Chip({ chip, eraId, good }: { chip: TraitChip; eraId: EraId; good: boolean }) {
  const { t } = useTranslation('hero');
  const Icon = good ? Plus : Minus;
  const text = chip.key === 'armHeavy' ? armHeavyNameL(eraId) : t(`scout.${chip.key}`, chip.params);
  return (
    <span className={good ? 'trait-chip trait-good' : 'trait-chip trait-bad'}>
      <Icon className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{text}</span>
    </span>
  );
}

/** One plate on the hero roster: the hull, her year, and her four numbers. */
function HullPlate({
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
  const { t } = useTranslation(['eras']);
  const sc = shipScores(e.def);
  const eraName = t(`eras:${e.id}.name`);
  const groupName = GROUP_KEY[e.group] ? t(`eras:${GROUP_KEY[e.group]}`) : e.group;
  return (
    <button
      type="button"
      data-hull={i}
      aria-pressed={on}
      title={`${e.def.name} — ${eraName}, ${e.year}`}
      onClick={() => onPick(e.id)}
      className={cn(
        'shrink-0 rounded-lg border-2 px-2 py-1 text-left transition-colors',
        on
          ? 'border-gold bg-blood/70 text-parch shadow-[0_0_14px_rgba(255,190,60,0.3)]'
          : 'cursor-pointer border-parch/25 bg-black/35 text-parch/70 hover:border-gold/60 hover:brightness-125',
      )}
    >
      <span className="block w-[7rem] truncate font-pirate text-[0.98rem] leading-tight sm:w-[8.5rem]">
        {e.def.name}
      </span>
      <span className="block truncate text-[0.54rem] uppercase tracking-[0.14em] opacity-60">
        {e.year} · {groupName}
      </span>
      <span className="mt-1 flex gap-0.5">
        {BARS.map(([k, tint]) => (
          <span key={k} className="h-1 w-4 overflow-hidden rounded-full bg-black/55">
            <span
              className="block h-full rounded-full transition-[width] duration-500"
              style={{ width: `${Math.max(12, Math.min(100, sc[k] * 100))}%`, background: tint }}
            />
          </span>
        ))}
      </span>
    </button>
  );
}

/**
 * The screen after the era selector, arcade style: the hull you command, drawn
 * by the game's own portrait painter, with her numbers and her scouting report,
 * and the whole roster of heroes on one strip. Like the chart above her, the
 * screen fits the cabinet — the portrait takes whatever height is left, and a
 * phone scrolls the step.
 */
export function HeroShipPicker({ era, onEra }: Props) {
  const { t } = useTranslation(['hero', 'eras', 'traits']);
  const eraIdx = Math.max(
    0,
    ERA_SHIPS.findIndex((s) => s.id === era),
  );
  const [idx, setIdx] = useState(eraIdx);
  // the report swaps on a beat: slide the old hull out, then the new one in
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
    const el = strip?.querySelector<HTMLElement>(`[data-hull="${idx}"]`);
    if (!strip || !el) return;
    // scroll the strip itself: the page must not jump when the menu loads
    strip.scrollTo({
      left: Math.max(0, el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2),
      behavior: firstRun.current ? 'auto' : 'smooth',
    });
    firstRun.current = false;
  }, [idx]);

  // dragging the portrait sideways walks the roster, arcade-style
  const drag = useRef<{ x: number; id: number } | null>(null);
  const [dragX, setDragX] = useState(0);

  const shown = ERA_SHIPS[idx];
  const def = shown.def;
  const sc = shipScores(def);
  const { strengths, weaknesses } = shipTraits(def, shown.id);
  const arm = armamentFor(shown.id);
  const gunpowder = usesGunpowder(shown.id);
  const eraName = t(`eras:${shown.id}.name`);
  const eraBlurb = t(`eras:${shown.id}.blurb`);
  const groupName = GROUP_KEY[shown.group] ? t(`eras:${GROUP_KEY[shown.group]}`) : shown.group;
  const step = (d: number) =>
    onEra(ERA_SHIPS[(idx + d + ERA_SHIPS.length) % ERA_SHIPS.length].id);
  const hullKind = isSteelHull(def.hullStyle) ? 'powered' : def.oared ? 'oared' : 'sailing';

  return (
    // NOTE: ← → for the hull are handled globally by the start screen so the
    // arrows work without focus; nothing here binds keys anymore.
    <section className="arcade-panel flex min-h-0 select-none flex-col gap-2 p-2 sm:p-2.5 lg:flex-1">
      <div
        className={`grid min-h-0 gap-2 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-2.5 ${
          stage === 'out' ? 'anim-swap-out' : 'anim-swap-in'
        }`}
      >
        {/* ---- the portrait: the hero hull herself, on her own water ---- */}
        <div
          className="arcade-frame relative aspect-[5/4] w-full cursor-grab active:cursor-grabbing sm:aspect-[16/10] lg:aspect-auto lg:min-h-[12rem]"
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
          {/* the drag slides the portrait; the swap itself is animated on the
              whole grid, so only the offset lives here */}
          <div
            className="absolute inset-0"
            style={dragX !== 0 ? { transform: `translateX(${dragX}px)` } : undefined}
          >
            <HeroPortrait e={shown} />
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between p-1.5 sm:p-2.5">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label={t('hero:picker.prevShip')}
              className="arcade-arrow pointer-events-auto grid h-11 w-8 place-items-center sm:h-14 sm:w-11"
            >
              <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label={t('hero:picker.nextShip')}
              className="arcade-arrow pointer-events-auto grid h-11 w-8 place-items-center sm:h-14 sm:w-11"
            >
              <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
            </button>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-1.5 text-center">
            <span className="font-pirate text-lg leading-tight text-parch drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] sm:text-2xl">
              {def.name}
            </span>
          </div>
          <span className="sr-only" aria-live="polite">
            {t('hero:picker.srLine', {
              name: def.name,
              era: eraName,
              year: shown.year,
              hp: def.hp,
              speed: def.speed,
              guns: def.cannons,
              blurb: eraBlurb,
            })}
          </span>
        </div>

        {/* ---- the scouting report ---- */}
        <div className="scroll-thin flex min-w-0 flex-col gap-1.5 lg:min-h-0 lg:overflow-y-auto">
          <div>
            <div className="font-pirate text-2xl leading-none sm:text-3xl">{def.name}</div>
            <div className="mt-0.5 text-[0.72rem] text-gold">{armSummaryL(shown.id)}</div>
            <div className="text-[0.6rem] uppercase tracking-[0.16em] opacity-65">
              {eraName} · {shown.year} · {groupName}
            </div>
            <p className="mt-1 text-[0.66rem] italic leading-snug opacity-75">
              {eraBlurb}
              {shown.homeWaters ? t('hero:picker.homeWaters', { waters: t(`eras:${shown.id}.waters`) }) : '.'}
            </p>
            <p className="mt-1 text-[0.66rem] leading-snug text-sky-200/90">
              {t(`traits:${shown.id}.name`)}: {t(`traits:${shown.id}.pitch`)}
            </p>
          </div>

          <div className="space-y-1">
            {BARS.map(([k, tint]) => (
              <StatBar
                key={k}
                label={
                  k === 'guns'
                    ? gunpowder
                      ? t('hero:picker.barGuns')
                      : arm.heavy === 'greekFire'
                        ? t('hero:picker.barFire')
                        : arm.heavy === 'stone'
                          ? t('hero:picker.barStones')
                          : t('hero:picker.barBows')
                    : t(`hero:picker.${BAR_LABEL[k]}`)
                }
                v={sc[k]}
                tint={tint}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            <Figure label={t('hero:picker.figHull')} value={`${def.hp}`} />
            <Figure label={t('hero:picker.barSpeed')} value={t('hero:picker.figSpeedV', { v: def.speed })} />
            <Figure
              label={gunpowder ? t('hero:picker.figBroadside') : armHeavyNameL(shown.id)}
              value={t('hero:picker.figAside', { n: def.cannons })}
            />
            <Figure label={t('hero:picker.figReload')} value={t('hero:picker.figReloadV', { s: def.reload.toFixed(1) })} />
            <Figure label={t('hero:picker.figShot')} value={t('hero:picker.figShotV', { d: def.damage })} />
            <Figure
              label={t('hero:picker.figCrew')}
              value={def.crew == null ? '—' : t('hero:picker.figCrewV', { c: def.crew })}
            />
          </div>

          <div className="grid gap-1.5 sm:grid-cols-2">
            <div>
              <div className="arcade-tag mb-1 text-[0.56rem] opacity-90">{t('hero:picker.strengths')}</div>
              <div className="flex flex-col gap-1">
                {strengths.map((s, i) => (
                  <Chip key={`${s.key}-${i}`} chip={s} eraId={shown.id} good />
                ))}
              </div>
            </div>
            <div>
              <div className="arcade-tag mb-1 text-[0.56rem] opacity-90">{t('hero:picker.weaknesses')}</div>
              <div className="flex flex-col gap-1">
                {weaknesses.map((s, i) => (
                  <Chip key={`${s.key}-${i}`} chip={s} eraId={shown.id} good={false} />
                ))}
              </div>
            </div>
          </div>

          <p className="rounded-md border border-parch/25 bg-black/30 px-2 py-1 text-[0.66rem] italic leading-snug opacity-85">
            {t(`hero:picker.${hullKind}A`)} <b>{t(`hero:picker.${hullKind}Lead`)}</b>
            {': '}{t(`hero:picker.${hullKind}Rest`)}
            {!gunpowder && (
              <>
                {' '}
                {t('hero:picker.noPowder')}
              </>
            )}
          </p>
        </div>
      </div>

      {/* ---- the hero roster: every age's flagship on one strip ---- */}
      <div className="shrink-0">
        <div className="arcade-tag mb-1 text-[0.54rem] opacity-80">
          {t('hero:picker.roster', { n: ERA_SHIPS.length })}
        </div>
        <div
          ref={stripRef}
          className="scroll-thin flex gap-1.5 overflow-x-auto pb-1"
          role="tablist"
          aria-label={t('hero:picker.heroShipAria')}
        >
          {ERA_SHIPS.map((e, i) => (
            <HullPlate key={e.id} e={e} i={i} on={e.id === era} onPick={onEra} />
          ))}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Coins, Anchor, Ship, Skull, X, Pause, Play, Sailboat, ScrollText } from 'lucide-react';
import { TradeEngine, type TradeHud, type TradePhase, type LogMsg } from '../game/trade/engine';
import type { GoodId } from '../game/chart/goods';
import { type Settings } from '../game/storage';
import { fmt } from '../i18n';
import { VoyageTouchBar, setLiveInput } from './VoyageTouchBar';

interface Props {
  name: string;
  settings: Settings;
  onExit: () => void;
  isTouch: boolean;
}

const GOAL = 15000;

export function TradeScreen({ name, settings, onExit, isTouch }: Props) {
  const { t } = useTranslation('trade');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<TradeEngine | null>(null);
  const [hud, setHud] = useState<TradeHud | null>(null);
  const [phase, setPhase] = useState<TradePhase>('sailing');
  const [portId, setPortId] = useState<string | null>(null);
  const [, setRefresh] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // ---- mount the engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eng = new TradeEngine(canvas, {
      onPhase: (p) => {
        setPhase(p);
        setPortId(eng.activePortId);
        setRefresh((r) => r + 1);
      },
    });
    eng.setAudio(settings.sfx);
    engineRef.current = eng;
    setLiveInput(eng.input);

    const unlock = () => {
      eng.unlockAudio();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);

    const id = window.setInterval(() => setHud(eng.getHud()), 110);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      setLiveInput(null);
      eng.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep audio in sync with the settings toggle (e.g. the M key)
  useEffect(() => {
    engineRef.current?.setAudio(settings.sfx);
  }, [settings.sfx]);

  const buy = useCallback((g: GoodId, q: number) => {
    engineRef.current?.buy(g, q);
    setRefresh((r) => r + 1);
  }, []);
  const sell = useCallback((g: GoodId, q: number) => {
    engineRef.current?.sell(g, q);
    setRefresh((r) => r + 1);
  }, []);
  const repair = useCallback(() => {
    engineRef.current?.repair();
    setRefresh((r) => r + 1);
  }, []);
  const upgradeHold = useCallback(() => {
    engineRef.current?.upgradeHold();
    setRefresh((r) => r + 1);
  }, []);
  const upgradeHull = useCallback(() => {
    engineRef.current?.upgradeHull();
    setRefresh((r) => r + 1);
  }, []);
  const undock = useCallback(() => engineRef.current?.undock(), []);
  const dock = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    const h = eng.getHud();
    if (h.canDock && h.nearestPort) eng.dock(h.nearestPort.id);
  }, []);
  const togglePause = useCallback(() => engineRef.current?.togglePause(), []);
  const newVoyage = useCallback(() => engineRef.current?.resetVoyage(), []);

  const eng = engineRef.current;
  const market = portId && phase === 'docked' ? eng?.getMarket(portId) : null;

  return (
    <div className="absolute inset-0 z-40 select-none overflow-hidden bg-abyss font-fell text-parch">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* ---------------- HUD ---------------- */}
      {hud && (
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          {/* goal progress */}
          <div className="h-1.5 w-full bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-gold-deep via-gold to-parch transition-[width] duration-500"
              style={{ width: `${Math.min(100, (hud.gold / GOAL) * 100)}%` }}
            />
          </div>

          {/* top bar */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 bg-black/45 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-gold">
              <Coins className="h-4 w-4" />
              <span className="font-pirate text-xl leading-none">{fmt(hud.gold)}</span>
            </div>
            <Stat label={t('ui.day')} value={String(hud.day)} />
            <Stat label={t('ui.hold')} value={`${hud.holdUsed}/${hud.holdCap}`} />
            {/* hull bar */}
            <div className="flex items-center gap-1.5">
              <span className="text-[0.6rem] uppercase tracking-widest text-parch/70">{t('ui.hull')}</span>
              <div className="h-3 w-28 overflow-hidden rounded-full border border-parch/40 bg-black/40">
                <div
                  className="h-full transition-[width] duration-200"
                  style={{
                    width: `${(hud.hp / hud.maxHp) * 100}%`,
                    background:
                      hud.hp / hud.maxHp > 0.5
                        ? 'linear-gradient(90deg,#5fbf6a,#9be07a)'
                        : hud.hp / hud.maxHp > 0.25
                          ? 'linear-gradient(90deg,#e0b04a,#f5d76a)'
                          : 'linear-gradient(90deg,#c2382e,#ef6a4a)',
                  }}
                />
              </div>
              <span className="text-xs">{hud.hp}</span>
            </div>
            {hud.piratesNear > 0 && (
              <div className="flex items-center gap-1 text-red-300 anim-pulse">
                <Skull className="h-4 w-4" />
                <span className="text-sm font-pirate">
                  {t(hud.piratesNear === 1 ? 'ui.pirateOne' : 'ui.pirateOther', { n: hud.piratesNear })}
                </span>
              </div>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                aria-label={t('ui.ariaControls')}
                className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-black/40 text-gold hover:brightness-125"
              >
                <ScrollText className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={togglePause}
                aria-label={t('ui.ariaPause')}
                className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-black/40 text-gold hover:brightness-125"
              >
                <Pause className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onExit}
                aria-label={t('ui.ariaQuit')}
                className="grid h-9 w-9 place-items-center rounded-full border border-parch/30 bg-black/40 text-parch/80 hover:brightness-125"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* spacer */}
          <div className="flex-1" />

          {/* nearest-port / dock prompt */}
          {hud.nearestPort && phase === 'sailing' && (
            <div className="pointer-events-none mb-2 flex justify-center">
              <div className="rounded-full border border-gold/40 bg-black/55 px-4 py-1 text-center text-sm">
                {hud.canDock ? (
                  <button
                    type="button"
                    onClick={dock}
                    className="pointer-events-auto flex items-center gap-2 font-pirate text-lg text-gold"
                  >
                    <Anchor className="h-4 w-4" /> {t('ui.dock', { port: hud.nearestPort.name })}
                  </button>
                ) : (
                  <span className="italic opacity-80">
                    <Ship className="mr-1 inline h-3.5 w-3.5" />
                    {t('ui.toward', { port: hud.nearestPort.name })}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* message toasts */}
          <div className="pointer-events-none mb-24 flex flex-col items-center gap-1">
            {hud.messages.slice(-3).map((m, i) => (
              <Toast key={`${m.t}-${i}`} m={m} />
            ))}
          </div>

          {/* touch steering */}
          {isTouch && phase === 'sailing' && <VoyageTouchBar canDock={hud.canDock} onDock={dock} />}
        </div>
      )}

      {/* ---------------- Trade panel ---------------- */}
      {phase === 'docked' && market && (
        <TradePanel
          captain={name}
          hud={hud}
          market={market}
          onBuy={buy}
          onSell={sell}
          onRepair={repair}
          onUpgradeHold={upgradeHold}
          onUpgradeHull={upgradeHull}
          onSetSail={undock}
        />
      )}

      {/* ---------------- Pause ---------------- */}
      {phase === 'paused' && (
        <Overlay title={t('ui.hoveTo')}>
          <div className="flex flex-col gap-3">
            <p className="text-center italic opacity-80">
              {t('ui.rest', { name: name || t('ui.stranger') })}
            </p>
            <MenuButton onClick={togglePause} icon={<Play className="h-5 w-5" />} primary>
              {t('ui.resume')}
            </MenuButton>
            <MenuButton onClick={newVoyage} icon={<Sailboat className="h-5 w-5" />}>
              {t('ui.newVoyage')}
            </MenuButton>
            <MenuButton onClick={onExit} icon={<X className="h-5 w-5" />}>
              {t('ui.quitMenu')}
            </MenuButton>
          </div>
          <Controls />
        </Overlay>
      )}

      {/* ---------------- End ---------------- */}
      {(phase === 'over' || phase === 'victory') && hud && (
        <Overlay title={phase === 'victory' ? t('ui.winTitle') : t('ui.loseTitle')} win={phase === 'victory'}>
          <div className="mx-auto mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="opacity-70">{t('ui.goldAmassed')}</span>
            <span className="text-right font-pirate text-lg text-gold">{fmt(hud.stats.gold)}</span>
            <span className="opacity-70">{t('ui.daysAtSea')}</span>
            <span className="text-right">{hud.stats.days}</span>
            <span className="opacity-70">{t('ui.portsVisited')}</span>
            <span className="text-right">{hud.stats.ports}</span>
            <span className="opacity-70">{t('ui.piratesSunk')}</span>
            <span className="text-right">{hud.stats.sunk}</span>
          </div>
          <div className="flex flex-col gap-3">
            <MenuButton onClick={newVoyage} icon={<Sailboat className="h-5 w-5" />} primary>
              {t('ui.newVoyage')}
            </MenuButton>
            <MenuButton onClick={onExit} icon={<X className="h-5 w-5" />}>
              {t('ui.quitMenu')}
            </MenuButton>
          </div>
        </Overlay>
      )}

      {/* ---------------- Help ---------------- */}
      {showHelp && (
        <Overlay title={t('ui.orders')} onClose={() => setShowHelp(false)}>
          <Controls />
          <div className="mt-4 flex justify-center">
            <MenuButton onClick={() => setShowHelp(false)} icon={<X className="h-5 w-5" />}>
              {t('ui.closeBtn')}
            </MenuButton>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- small bits

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[0.6rem] uppercase tracking-widest text-parch/70">{label}</span>
      <span className="font-pirate text-lg leading-none text-parch">{value}</span>
    </div>
  );
}

function Toast({ m }: { m: LogMsg }) {
  const color =
    m.kind === 'good'
      ? 'border-emerald-400/50 text-emerald-100'
      : m.kind === 'fight'
        ? 'border-red-400/50 text-red-100'
        : m.kind === 'trade'
          ? 'border-gold/50 text-gold'
          : 'border-parch/40 text-parch';
  return (
    <div className={`rounded-full border bg-black/55 px-3 py-0.5 text-sm ${color}`}>{m.text}</div>
  );
}

function Controls() {
  const { t } = useTranslation('trade');
  return (
    <div className="max-w-md space-y-1 text-sm leading-snug opacity-90">
      <p className="mb-1 text-center font-pirate text-xl text-gold">{t('ui.helm')}</p>
      <Row k="A / D or ← →" v={t('ui.steer')} />
      <Row k="W / S or ↑ ↓" v={t('ui.sails')} />
      <Row k="Q / E" v={t('ui.broad')} />
      <Row k="Space" v={t('ui.space')} />
      <Row k="F" v={t('ui.anchor')} />
      <Row k="P / Esc" v={t('ui.pauseRow')} />
      <p className="pt-1 italic opacity-75">{t('ui.goal', { goal: fmt(GOAL) })}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-xs text-gold/90">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function Overlay({
  title,
  children,
  win,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  win?: boolean;
  onClose?: () => void;
}) {
  const { t } = useTranslation('trade');
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="arcade-panel anim-pop w-full max-w-md p-5 text-center">
        <h2
          className="arcade-marquee mb-4 text-3xl sm:text-4xl"
          style={win ? { color: '#ffd863' } : undefined}
        >
          {title}
        </h2>
        {children}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t('ui.ariaClose')}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-parch/30 text-parch/70 hover:brightness-125"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function MenuButton({
  children,
  onClick,
  icon,
  primary,
}: {
  children: React.ReactNode;
  onClick: () => void;
  icon?: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        primary
          ? 'btn-seal flex items-center justify-center gap-2 px-6 py-2.5 text-xl'
          : 'btn-wood flex items-center justify-center gap-2 px-6 py-2.5 text-xl'
      }
    >
      {icon}
      {children}
    </button>
  );
}

// ----------------------------------------------------------------- trade panel

interface MarketRow {
  good: { id: GoodId; name: string };
  buy: number;
  sell: number;
  have: number;
  factor: number;
}

function TradePanel({
  captain,
  hud,
  market,
  onBuy,
  onSell,
  onRepair,
  onUpgradeHold,
  onUpgradeHull,
  onSetSail,
}: {
  captain: string;
  hud: TradeHud | null;
  market: NonNullable<ReturnType<TradeEngine['getMarket']>>;
  onBuy: (g: GoodId, q: number) => void;
  onSell: (g: GoodId, q: number) => void;
  onRepair: () => void;
  onUpgradeHold: () => void;
  onUpgradeHull: () => void;
  onSetSail: () => void;
}) {
  const { t } = useTranslation(['trade', 'regions']);
  const holdUsed = hud?.holdUsed ?? 0;
  const holdCap = hud?.holdCap ?? 0;
  const gold = hud?.gold ?? 0;
  const space = holdCap - holdUsed;
  const goodName = (id: GoodId) => t(`trade:goods.${id}`);
  return (
    <div className="absolute inset-0 z-50 flex items-stretch justify-center bg-black/55 p-2 sm:p-4">
      <div className="parchment anim-pop flex w-full max-w-2xl flex-col overflow-hidden text-ink">
        {/* header */}
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#5b3a1a] px-4 py-3">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] opacity-70">{t('trade:ui.portOf')}</div>
            <h2 className="font-pirate text-3xl leading-none text-[#3b1d08]">{market.port.name}</h2>
            <div className="text-sm italic opacity-80">{t(`regions:chart.${market.port.region}`)}</div>
          </div>
          <button
            type="button"
            onClick={onSetSail}
            className="btn-seal flex shrink-0 items-center gap-2 px-4 py-2 text-lg"
          >
            <Sailboat className="h-4 w-4" /> {t('trade:ui.setSail')}
          </button>
        </div>

        <div className="grid gap-1 px-4 pt-2 text-sm sm:grid-cols-2">
          <p>
            <b>{t('trade:ui.produces')}</b>{' '}
            {market.port.produces.length ? market.port.produces.map(goodName).join(', ') : '—'}
          </p>
          <p>
            <b>{t('trade:ui.wants')}</b>{' '}
            {market.port.wants.length ? market.port.wants.map(goodName).join(', ') : '—'}
          </p>
        </div>

        {/* market table */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 scroll-thin">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-[#ecd49a] text-[0.62rem] uppercase tracking-wider text-[#5b3a1a]">
              <tr>
                <th className="text-left">{t('trade:ui.colGood')}</th>
                <th className="text-right">{t('trade:ui.colBuy')}</th>
                <th className="text-right">{t('trade:ui.colSell')}</th>
                <th className="text-center">{t('trade:ui.colHold')}</th>
                <th className="text-right">{t('trade:ui.colTrade')}</th>
              </tr>
            </thead>
            <tbody>
              {market.rows.map((r: MarketRow) => {
                const dear = r.factor > 1;
                const cheap = r.factor < 1;
                const tag = dear ? t('trade:ui.dear') : cheap ? t('trade:ui.cheap') : '';
                const tagColor = dear ? 'text-red-700' : cheap ? 'text-emerald-700' : 'text-[#7a5a32]';
                const canBuy = r.buy <= gold && space > 0;
                const canSell = r.have > 0;
                return (
                  <tr key={r.good.id} className="border-b border-[#c9a86a]/50">
                    <td className="py-1">
                      <div className="font-medium text-[#3b1d08]">{goodName(r.good.id)}</div>
                      <div className={`text-[0.62rem] uppercase tracking-wide ${tagColor}`}>{tag}</div>
                    </td>
                    <td className="text-right tabular-nums">{r.buy}</td>
                    <td className="text-right tabular-nums">{r.sell}</td>
                    <td className="text-center tabular-nums">{r.have}</td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          disabled={!canBuy}
                          onClick={() => onBuy(r.good.id, 1)}
                          className="rounded border border-[#5b3a1a] bg-[#3b6e4f] px-1.5 py-0.5 text-xs text-parch disabled:opacity-30"
                        >
                          {t('trade:ui.buyBtn')}
                        </button>
                        <button
                          type="button"
                          disabled={!canBuy}
                          onClick={() => onBuy(r.good.id, 10)}
                          className="rounded border border-[#5b3a1a] bg-[#3b6e4f] px-1.5 py-0.5 text-xs text-parch disabled:opacity-30"
                        >
                          {t('trade:ui.buyBtn')}×10
                        </button>
                        <button
                          type="button"
                          disabled={!canSell}
                          onClick={() => onSell(r.good.id, 1)}
                          className="rounded border border-[#5b3a1a] bg-[#a8231a] px-1.5 py-0.5 text-xs text-parch disabled:opacity-30"
                        >
                          {t('trade:ui.sellBtn')}
                        </button>
                        <button
                          type="button"
                          disabled={!canSell}
                          onClick={() => onSell(r.good.id, 10)}
                          className="rounded border border-[#5b3a1a] bg-[#a8231a] px-1.5 py-0.5 text-xs text-parch disabled:opacity-30"
                        >
                          {t('trade:ui.sellBtn')}×10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {market.port.shipyard && (
            <div className="mt-3 rounded-lg border border-[#5b3a1a] bg-[#ecd49a] p-2">
              <div className="mb-1 font-pirate text-lg text-[#3b1d08]">{t('trade:ui.shipyard')}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={market.repairCost <= 0 || gold < market.repairCost}
                  onClick={onRepair}
                  className="btn-wood px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  {t('trade:ui.repair', { cost: market.repairCost })}
                </button>
                <button
                  type="button"
                  disabled={gold < market.holdCost}
                  onClick={onUpgradeHold}
                  className="btn-wood px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  {t('trade:ui.holdUp', { cost: market.holdCost })}
                </button>
                <button
                  type="button"
                  disabled={gold < market.hullCost}
                  onClick={onUpgradeHull}
                  className="btn-wood px-3 py-1.5 text-sm disabled:opacity-30"
                >
                  {t('trade:ui.hullUp', { cost: market.hullCost })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 border-t-2 border-[#5b3a1a] px-4 py-2 text-sm">
          <div>
            {t('trade:ui.footerHold')} <b>{holdUsed}</b> / {holdCap} · {t('trade:ui.footerGold')}{' '}
            <b className="text-[#1d6e3a]">{fmt(gold)}</b>
          </div>
          <div className="italic opacity-70">{t('trade:ui.captain', { name: captain || t('trade:ui.stranger') })}</div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Skull,
  X,
  Pause,
  Play,
  Sailboat,
  Anchor,
  Ship,
  ScrollText,
  Swords,
  Scroll,
  Waves,
  Trophy,
} from 'lucide-react';
import {
  AdventureEngine,
  type AdventureHud,
  type AdventurePhase,
  type LogMsg,
} from '../game/adventure/engine';
import { FOES, REFIT_BY_ID, type RefitId } from '../game/adventure/beasts';
import { type Settings } from '../game/storage';
import { fmt } from '../i18n';
import { VoyageTouchBar, setLiveInput } from './VoyageTouchBar';
import { cn } from '../utils/cn';

interface Props {
  name: string;
  settings: Settings;
  onExit: () => void;
  isTouch: boolean;
}

const TOTAL = FOES.length;

export function AdventureScreen({ name, settings, onExit, isTouch }: Props) {
  const { t } = useTranslation('adventure');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<AdventureEngine | null>(null);
  const [hud, setHud] = useState<AdventureHud | null>(null);
  const [phase, setPhase] = useState<AdventurePhase>('sailing');
  const [portId, setPortId] = useState<string | null>(null);
  const [, setRefresh] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  // ---- mount the engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eng = new AdventureEngine(canvas, {
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

  useEffect(() => {
    engineRef.current?.setAudio(settings.sfx);
  }, [settings.sfx]);

  const repair = useCallback(() => {
    engineRef.current?.repair();
    setRefresh((r) => r + 1);
  }, []);
  const buyRefit = useCallback((id: RefitId) => {
    engineRef.current?.buyRefit(id);
    setRefresh((r) => r + 1);
  }, []);
  const takeContract = useCallback(() => {
    engineRef.current?.takeContract();
    setRefresh((r) => r + 1);
  }, []);
  const abandonContract = useCallback(() => {
    engineRef.current?.abandonContract();
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
  const port = phase === 'docked' && portId ? eng?.getPort() : null;

  return (
    <div className="absolute inset-0 z-40 select-none overflow-hidden bg-abyss font-fell text-parch">
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />

      {/* ---------------- HUD ---------------- */}
      {hud && (
        <div className="pointer-events-none absolute inset-0 flex flex-col">
          {/* quest progress: names crossed off the chart */}
          <div className="h-1.5 w-full bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-300 to-parch transition-[width] duration-500"
              style={{ width: `${(hud.felled / TOTAL) * 100}%` }}
            />
          </div>

          {/* top bar */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-x-4 gap-y-2 bg-black/50 px-3 py-2 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-emerald-200">
              <Trophy className="h-4 w-4" />
              <span className="font-pirate text-xl leading-none">{fmt(hud.renown)}</span>
              <span className="text-[0.6rem] uppercase tracking-widest text-parch/60">{hud.rank}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gold">
              <Ship className="h-4 w-4" />
              <span className="font-pirate text-xl leading-none">{fmt(hud.salvage)}</span>
              <span className="text-[0.6rem] uppercase tracking-widest text-parch/60">{t('ui.salvageLbl')}</span>
            </div>
            <Stat label={t('ui.day')} value={String(hud.day)} />
            <Stat label={t('ui.felled')} value={`${hud.felled}/${TOTAL}`} />
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
                        ? 'linear-gradient(90deg,#2f9f7a,#7ee0b0)'
                        : hud.hp / hud.maxHp > 0.25
                          ? 'linear-gradient(90deg,#e0b04a,#f5d76a)'
                          : 'linear-gradient(90deg,#c2382e,#ef6a4a)',
                  }}
                />
              </div>
              <span className="text-xs">{hud.hp}</span>
            </div>
            {hud.threats > 0 && (
              <div className="flex items-center gap-1 text-red-300 anim-pulse">
                <Skull className="h-4 w-4" />
                <span className="text-sm font-pirate">
                  {t(hud.threats === 1 ? 'ui.contactOne' : 'ui.contactOther', { n: hud.threats })}
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

          {/* the hunt: what is on you right now */}
          {hud.target && (
            <div className="pointer-events-none mt-2 flex justify-center">
              <div className="rounded-lg border border-red-400/40 bg-black/60 px-3 py-1.5 text-center">
                <div className="font-pirate text-lg leading-none text-red-200">{hud.target.name}</div>
                <div className="flex items-center justify-center gap-2 text-[0.7rem] italic opacity-80">
                  <span>{hud.target.title}</span>
                  <span>· {t('ui.leagues', { dist: hud.target.distance })}</span>
                  <span>· {t(hud.target.kind === 'beast' ? 'ui.beast' : 'ui.rival')}</span>
                </div>
                <div className="mt-1 h-2 w-52 overflow-hidden rounded-full border border-parch/30 bg-black/50">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-300"
                    style={{ width: `${(hud.target.hp / hud.target.maxHp) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* the contract you carry */}
          {hud.contract && !hud.target && (
            <div className="pointer-events-none mt-2 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-gold/50 bg-black/55 px-3 py-1 text-sm text-gold">
                <Scroll className="h-3.5 w-3.5" />
                <span>{t('ui.chip', { name: hud.contract.name, renown: hud.contract.renown })}</span>
              </div>
            </div>
          )}

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
                    <Anchor className="h-4 w-4" /> {t('ui.dockA', { port: hud.nearestPort.name })}
                  </button>
                ) : (
                  <span className="italic opacity-80">
                    <Ship className="mr-1 inline h-3.5 w-3.5" />
                    {t('ui.towardA', { port: hud.nearestPort.name })}
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

          {isTouch && phase === 'sailing' && <VoyageTouchBar canDock={hud.canDock} onDock={dock} />}
        </div>
      )}

      {/* ---------------- Port panel ---------------- */}
      {phase === 'docked' && port && hud && (
        <PortPanel
          captain={name}
          hud={hud}
          port={port}
          onRepair={repair}
          onRefit={buyRefit}
          onTake={takeContract}
          onAbandon={abandonContract}
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
              {t('ui.resumeHunt')}
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
        <Overlay title={phase === 'victory' ? t('ui.win') : t('ui.lose')} win={phase === 'victory'}>
          <p className="mb-3 text-center italic opacity-85">
            {phase === 'victory' ? t('ui.winLine') : t('ui.loseLine')}
          </p>
          <div className="mx-auto mb-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <span className="opacity-70">{t('ui.renownLbl')}</span>
            <span className="text-right font-pirate text-lg text-gold">{fmt(hud.stats.renown)}</span>
            <span className="opacity-70">{t('ui.rankLbl')}</span>
            <span className="text-right">{hud.rank}</span>
            <span className="opacity-70">{t('ui.crossed')}</span>
            <span className="text-right">
              {hud.stats.felled} / {TOTAL}
            </span>
            <span className="opacity-70">{t('ui.raidersLbl')}</span>
            <span className="text-right">{hud.stats.raiders}</span>
            <span className="opacity-70">{t('ui.portsCalled')}</span>
            <span className="text-right">{hud.stats.ports}</span>
            <span className="opacity-70">{t('ui.daysSea')}</span>
            <span className="text-right">{hud.stats.days}</span>
          </div>
          <div className="flex flex-col gap-3">
            <MenuButton onClick={newVoyage} icon={<Sailboat className="h-5 w-5" />} primary>
              {t('ui.newVoyage')}
            </MenuButton>
            <MenuButton onClick={onExit} icon={<X className="h-5 w-5" />} primary={false}>
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
              {t('ui.close')}
            </MenuButton>
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ----------------------------------------------------------------- port panel

type PortPanelData = NonNullable<ReturnType<AdventureEngine['getPort']>>;

function PortPanel({
  captain,
  hud,
  port,
  onRepair,
  onRefit,
  onTake,
  onAbandon,
  onSetSail,
}: {
  captain: string;
  hud: AdventureHud;
  port: PortPanelData;
  onRepair: () => void;
  onRefit: (id: RefitId) => void;
  onTake: () => void;
  onAbandon: () => void;
  onSetSail: () => void;
}) {
  const { t } = useTranslation(['adventure', 'regions']);
  const salvage = hud.salvage;
  return (
    <div className="absolute inset-0 z-50 flex items-stretch justify-center bg-black/55 p-2 sm:p-4">
      <div className="parchment anim-pop flex w-full max-w-2xl flex-col overflow-hidden text-ink">
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#5b3a1a] px-4 py-3">
          <div>
            <div className="text-[0.6rem] uppercase tracking-[0.2em] opacity-70">{t('adventure:ui.harbourOf')}</div>
            <h2 className="font-pirate text-3xl leading-none text-[#3b1d08]">{port.port.name}</h2>
            <div className="text-sm italic opacity-80">
              {t(`regions:chart.${port.port.region}`)} ·{' '}
              {t(port.remaining === 1 ? 'adventure:ui.lairsOne' : 'adventure:ui.lairsOther', { n: port.remaining })}
            </div>
          </div>
          <button type="button" onClick={onSetSail} className="btn-seal flex shrink-0 items-center gap-2 px-4 py-2 text-lg">
            <Sailboat className="h-4 w-4" /> {t('adventure:ui.setSail')}
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 scroll-thin">
          {/* bounty board */}
          <div className="rounded-lg border border-[#5b3a1a] bg-[#ecd49a] p-3">
            <div className="mb-1 flex items-center gap-2 font-pirate text-lg text-[#3b1d08]">
              <Scroll className="h-4 w-4" /> {t('adventure:ui.bounty')}
            </div>
            {hud.contract ? (
              <div>
                <p className="text-sm italic">
                  {t('adventure:ui.underContract', {
                    name: port.activeContract?.name ?? t('adventure:ui.aName'),
                    title: port.activeContract?.title ?? '',
                  })}
                </p>
                <button type="button" onClick={onAbandon} className="btn-wood mt-2 px-3 py-1.5 text-sm">
                  {t('adventure:ui.tearUpBtn')}
                </button>
              </div>
            ) : port.offer ? (
              <div>
                <p className="text-sm italic">
                  {t('adventure:ui.offerLine', {
                    name: port.offer.name,
                    title: port.offer.title,
                    renown: port.offer.renown,
                    salvage: port.offer.salvage,
                  })}
                </p>
                <button type="button" onClick={onTake} className="btn-seal mt-2 px-3 py-1.5 text-sm">
                  <Swords className="mr-1 inline h-3.5 w-3.5" /> {t('adventure:ui.sign')}
                </button>
              </div>
            ) : (
              <p className="text-sm italic opacity-80">{t('adventure:ui.bare')}</p>
            )}
          </div>

          {/* shipyard */}
          <div className="mt-3 rounded-lg border border-[#5b3a1a] bg-[#ecd49a] p-3">
            <div className="mb-2 flex items-center gap-2 font-pirate text-lg text-[#3b1d08]">
              <Waves className="h-4 w-4" /> {t('adventure:ui.shipyard')}
            </div>
            <div className="mb-2">
              <button
                type="button"
                disabled={port.repair <= 0 || salvage < port.repair}
                onClick={onRepair}
                className="btn-wood px-3 py-1.5 text-sm disabled:opacity-30"
              >
                {t('adventure:ui.caulk', { cost: port.repair })}
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {port.refits.map((r) => {
                const def = REFIT_BY_ID[r.id];
                const maxed = r.cost == null;
                const afford = typeof r.cost === 'number' && r.cost <= salvage;
                return (
                  <button
                    key={r.id}
                    type="button"
                    disabled={maxed || !afford}
                    onClick={() => onRefit(r.id)}
                    className="rounded border border-[#5b3a1a] bg-[#d9bd7e] px-2 py-1.5 text-left text-sm disabled:opacity-40"
                  >
                    <div className="font-pirate leading-tight text-[#3b1d08]">
                      {t(`adventure:refits.${r.id}.name`)} <span className="opacity-70">· {r.level}/{def.max}</span>
                    </div>
                    <div className="text-[0.7rem] opacity-80">{t(`adventure:refits.${r.id}.desc`)}</div>
                    <div className="text-[0.7rem] font-semibold text-[#1d6e3a]">
                      {maxed ? t('adventure:ui.noMore') : t('adventure:ui.costSalv', { cost: r.cost })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-[#5b3a1a] px-4 py-2 text-sm">
          <div>
            {t('adventure:ui.footerRenown')} <b>{fmt(hud.renown)}</b> · {t('adventure:ui.footerSalvage')}{' '}
            <b className="text-[#1d6e3a]">{fmt(salvage)}</b>
          </div>
          <div className="italic opacity-70">{t('adventure:ui.captain', { name: captain || t('adventure:ui.stranger') })}</div>
        </div>
      </div>
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
        : m.kind === 'port'
          ? 'border-gold/50 text-gold'
          : 'border-parch/40 text-parch';
  return <div className={cn('rounded-full border bg-black/55 px-3 py-0.5 text-sm', color)}>{m.text}</div>;
}

function Controls() {
  const { t } = useTranslation('adventure');
  return (
    <div className="max-w-md space-y-1 text-sm leading-snug opacity-90">
      <p className="mb-1 text-center font-pirate text-xl text-gold">{t('ui.helmHunt')}</p>
      <Row k="A / D or ← →" v={t('ui.steer')} />
      <Row k="W / S or ↑ ↓" v={t('ui.sails')} />
      <Row k="Q / E" v={t('ui.broad')} />
      <Row k="Space" v={t('ui.spaceA')} />
      <Row k="F" v={t('ui.anchorA')} />
      <Row k="P / Esc" v={t('ui.pauseRow')} />
      <p className="pt-1 italic opacity-75">{t('ui.goalA')}</p>
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
  const { t } = useTranslation('adventure');
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
      <div className="arcade-panel anim-pop w-full max-w-md p-5 text-center">
        <h2 className="arcade-marquee mb-4 text-3xl sm:text-4xl" style={win ? { color: '#ffd863' } : undefined}>
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

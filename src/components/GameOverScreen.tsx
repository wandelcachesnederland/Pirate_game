import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { fmt } from '../i18n';
import {
  Anchor,
  Coins,
  Crosshair,
  Flag,
  Flame,
  House,
  RotateCcw,
  Skull,
  Star,
  Timer,
  Users,
  WavesHorizontal,
} from 'lucide-react';
import type { GameStats } from '../game/types';
import type { ScoreEntry } from '../game/storage';
import { difficultyById } from '../game/difficulty';
import { HighScoreTable } from './ui';

interface Props {
  stats: GameStats;
  scores: ScoreEntry[];
  rank: number;
  name: string;
  onRestart: () => void;
  onMenu: () => void;
  isTouch: boolean;
}

function useCountUp(target: number, duration = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / duration);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(target * e));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return v;
}

function fmtTime(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-ink/15 bg-ink/[0.06] px-2.5 py-1.5">
      <span className="text-ink-soft">{icon}</span>
      <div className="min-w-0">
        <div className="text-[0.7rem] uppercase tracking-wider opacity-70">{label}</div>
        <div className="font-pirate text-xl leading-none">{value}</div>
      </div>
    </div>
  );
}

export function GameOverScreen({ stats, scores, rank, name, onRestart, onMenu, isTouch }: Props) {
  const { t } = useTranslation(['screens', 'peril']);
  const shown = useCountUp(stats.score);
  const waters = stats.regionName ?? 'the Caribbean';
  const verdict =
    stats.wave >= 10
      ? t('screens:gameover.verdictLegend', { waters })
      : stats.wave >= 6
        ? t('screens:gameover.verdictCrown')
        : stats.wave >= 3
          ? t('screens:gameover.verdictFearsome')
          : t('screens:gameover.verdictLocker');

  return (
    <div className="anim-fade absolute inset-0 overflow-y-auto bg-[radial-gradient(ellipse_at_center,rgba(40,6,4,0.35),rgba(2,8,18,0.88))]">
      <div className="flex min-h-full flex-col items-center justify-center gap-3 p-3 sm:gap-5 sm:p-6">
        <header className="anim-pop text-center">
          <Skull className="mx-auto h-10 w-10 text-parch/90 sm:h-12 sm:w-12" />
          <h2 className="title-gold text-6xl leading-none sm:text-8xl">{t('screens:gameover.sunk')}</h2>
          <p className="font-fell italic text-parch/90">{verdict}</p>
        </header>

        <div className="grid w-full max-w-4xl gap-3 sm:gap-5 md:grid-cols-2">
          <section className="parchment anim-pop p-4 text-center sm:p-6" style={{ animationDelay: '0.1s' }}>
            <div className="font-pirate text-xl opacity-75">{t('screens:gameover.plunderOf', { name: name || t('screens:gameover.captainFallback') })}</div>
            <div className="relative">
              <div className="font-pirate text-6xl tabular-nums leading-tight text-[#6b3a0a] sm:text-7xl">
                {fmt(shown)}
              </div>
              {rank >= 0 && (
                <div className="anim-stamp pointer-events-none absolute -right-1 -top-3 rounded-md border-[3px] border-blood px-2 py-0.5 font-pirate text-lg text-blood sm:right-2 sm:text-2xl">
                  {rank === 0 ? t('screens:gameover.newRecord') : t('screens:gameover.rank', { rank: rank + 1 })}
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-left sm:grid-cols-3">
              <Stat icon={<WavesHorizontal className="h-5 w-5" />} label={t('screens:gameover.wave')} value={`${stats.wave}`} />
              <Stat icon={<Anchor className="h-5 w-5" />} label={t('screens:gameover.sunkShips')} value={`${stats.sunk}`} />
              <Stat icon={<Coins className="h-5 w-5" />} label={t('screens:gameover.goldLooted')} value={fmt(stats.gold)} />
              <Stat
                icon={<Crosshair className="h-5 w-5" />}
                label={t('screens:gameover.accuracy')}
                value={`${Math.round(stats.accuracy * 100)}%`}
              />
              <Stat icon={<Flame className="h-5 w-5" />} label={t('screens:gameover.bestStreak')} value={`x${stats.maxStreak}`} />
              <Stat icon={<Timer className="h-5 w-5" />} label={t('screens:gameover.timeAtSea')} value={fmtTime(stats.time)} />
              {(stats.boarded ?? 0) > 0 && (
                <Stat icon={<Flag className="h-5 w-5" />} label={t('screens:gameover.boarded')} value={`${stats.boarded}`} />
              )}
              {(stats.prisoners ?? 0) > 0 && (
                <Stat icon={<Users className="h-5 w-5" />} label={t('screens:gameover.prisoners')} value={`${stats.prisoners}`} />
              )}
              {(stats.flagsTaken ?? 0) > 0 && (
                <Stat icon={<Star className="h-5 w-5" />} label={t('screens:gameover.flags')} value={`${stats.flagsTaken}`} />
              )}
            </div>
            <p className="mt-2 text-sm italic opacity-70">
              {stats.regionName ? t('screens:gameover.sailed', { region: stats.regionName }) : t('screens:gameover.sailedUnknown')}
              {stats.difficulty && (
                <>
                  {' · '}
                  <span className="whitespace-nowrap">
                    {'☠'.repeat(difficultyById(stats.difficulty).skulls)}{' '}
                    {t(`peril:${stats.difficulty}.name`)}
                  </span>
                </>
              )}
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onRestart}
                className="btn-seal anim-pulse flex flex-1 items-center justify-center gap-2 py-3 text-2xl sm:text-3xl"
              >
                <RotateCcw className="h-6 w-6" /> {t('screens:gameover.sailAgain')}
              </button>
              <button
                type="button"
                onClick={onMenu}
                className="btn-wood flex items-center justify-center gap-2 px-5 py-2.5 text-xl"
              >
                <House className="h-5 w-5" /> {t('screens:gameover.port')}
              </button>
            </div>
            {!isTouch && (
              <p className="mt-2 text-sm italic opacity-70">
                {t('screens:gameover.againHint', { r: 'R', enter: 'Enter' })}
              </p>
            )}
          </section>

          <section className="parchment anim-pop p-4 sm:p-6" style={{ animationDelay: '0.2s' }}>
            <HighScoreTable scores={scores} highlight={rank} />
          </section>
        </div>
      </div>
    </div>
  );
}

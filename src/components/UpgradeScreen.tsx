import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { EraId, UpgradeId, UpgradeOffer } from '../game/types';
import { isFittingSlot } from '../game/hullFittings';
import { upgradeVariant } from '../game/weapons';
import { cn } from '../utils/cn';
import { KeyCap, UPGRADE_ICONS } from './ui';

interface Props {
  offers: UpgradeOffer[];
  wave: number;
  era: EraId;
  onChoose: (id: UpgradeId) => void;
  isTouch: boolean;
}

/** Between-wave "port call": pick one of three random ship improvements. */
export function UpgradeScreen({ offers, wave, era, onChoose, isTouch }: Props) {
  const { t } = useTranslation(['upgrades', 'fittings', 'common']);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setArmed(true), 450);
    return () => window.clearTimeout(t);
  }, []);

  const variant = upgradeVariant(era);
  const cardName = (id: UpgradeId): string =>
    isFittingSlot(id)
      ? t(`fittings:eras.${era}.${id}.name`)
      : t(`upgrades:${variant}.${id}.name`, { defaultValue: t(`upgrades:base.${id}.name`) });
  const cardDesc = (id: UpgradeId): string =>
    isFittingSlot(id)
      ? t(`fittings:eras.${era}.${id}.desc`)
      : t(`upgrades:${variant}.${id}.desc`, { defaultValue: t(`upgrades:base.${id}.desc`) });

  return (
    <div className="anim-fade absolute inset-0 overflow-y-auto bg-[radial-gradient(ellipse_at_center,rgba(3,16,32,0.45),rgba(2,10,22,0.82))]">
      <div className="flex min-h-full flex-col items-center justify-center gap-4 p-4 sm:gap-6">
        <div className="anim-pop text-center">
          <p className="font-fell text-base italic text-parch/90 sm:text-lg">
            {t('upgrades:ui.survived', { wave })}
          </p>
          <h2 className="title-gold text-5xl leading-none sm:text-7xl">{t('upgrades:ui.shipwright')}</h2>
          <p className="mt-1 font-fell italic text-parch/80">{t('upgrades:ui.choose')}</p>
        </div>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-5">
          {offers.map((o, i) => {
            const Icon = UPGRADE_ICONS[o.def.id];
            return (
              <button
                key={o.def.id}
                type="button"
                disabled={!armed}
                onClick={() => onChoose(o.def.id)}
                style={{ animationDelay: `${0.08 + i * 0.09}s` }}
                className={cn(
                  'parchment upgrade-card anim-pop flex cursor-pointer items-center gap-4 p-4 text-left sm:flex-col sm:p-6 sm:text-center',
                  !armed && 'cursor-default',
                )}
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-gold bg-gradient-to-b from-[#7a4e28] to-[#3a2412] text-gold shadow-[0_6px_14px_rgba(0,0,0,0.35)] sm:h-20 sm:w-20">
                  <Icon className="h-7 w-7 sm:h-10 sm:w-10" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-pirate text-2xl leading-tight sm:text-[1.7rem]">{cardName(o.def.id)}</div>
                  <div className="italic leading-snug text-ink-soft">{cardDesc(o.def.id)}</div>
                  <div className="mt-2 flex items-center gap-1 sm:justify-center">
                    {Array.from({ length: o.def.max }).map((_, k) => (
                      <span
                        key={k}
                        className={cn(
                          'h-2.5 w-2.5 rotate-45 border border-ink/60',
                          k < o.level && 'bg-ink',
                          k === o.level && 'bg-blood animate-pulse',
                        )}
                      />
                    ))}
                    <span className="ml-1.5 text-xs italic opacity-70">
                      {o.level === 0 ? t('common:brandNew') : t('common:level', { from: o.level, to: o.level + 1 })}
                    </span>
                  </div>
                </div>
                {!isTouch && <KeyCap className="hidden sm:inline-flex">{i + 1}</KeyCap>}
              </button>
            );
          })}
        </div>
        {!isTouch && (
          <p className="font-fell text-sm italic text-parch/70">
            {t('upgrades:ui.pressPre')} <KeyCap>1</KeyCap> <KeyCap>2</KeyCap> <KeyCap>3</KeyCap> {t('upgrades:ui.pressPost')}
          </p>
        )}
      </div>
    </div>
  );
}

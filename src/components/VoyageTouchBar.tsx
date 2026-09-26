// Touch steering for every mode that sails the chart.
//
// The engines own an `Input` instance; the touch bar writes straight into the
// live one through a module-level handle, so Trade and Adventure share this
// exact helm without sharing anything else.

import { useCallback } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Flag } from 'lucide-react';
import type { Input } from '../game/input';

let liveInput: Input | null = null;

/** The running engine registers its input here so the touch bar can drive it. */
export function setLiveInput(i: Input | null) {
  liveInput = i;
}

/** Hold a key down / release it, from a touch button. */
export function useTouchKey() {
  return useCallback((code: string, on: boolean) => {
    if (!liveInput) return;
    if (on) liveInput.down.add(code);
    else liveInput.down.delete(code);
  }, []);
}

interface Props {
  canDock: boolean;
  onDock: () => void;
}

export function VoyageTouchBar({ canDock, onDock }: Props) {
  const key = useTouchKey();
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex items-end justify-between p-3">
      <div className="pointer-events-auto flex gap-2">
        <TouchBtn label={<ArrowLeft className="h-6 w-6" />} onDown={() => key('KeyA', true)} onUp={() => key('KeyA', false)} />
        <TouchBtn label={<ArrowRight className="h-6 w-6" />} onDown={() => key('KeyD', true)} onUp={() => key('KeyD', false)} />
        <TouchBtn label={<ArrowUp className="h-6 w-6" />} onDown={() => key('KeyW', true)} onUp={() => key('KeyW', false)} />
        <TouchBtn label={<ArrowDown className="h-6 w-6" />} onDown={() => key('KeyS', true)} onUp={() => key('KeyS', false)} />
      </div>
      <div className="pointer-events-auto flex gap-2">
        {canDock && <TouchBtn label={<Flag className="h-6 w-6" />} onDown={onDock} accent />}
        <TouchBtn
          label={<Crosshair className="h-6 w-6" />}
          onDown={() => {
            if (!liveInput) return;
            liveInput.portQueued = true;
            liveInput.starQueued = true;
          }}
          accent
        />
      </div>
    </div>
  );
}

export function TouchBtn({
  label,
  onDown,
  onUp,
  accent,
}: {
  label: React.ReactNode;
  onDown: () => void;
  onUp?: () => void;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        onDown();
      }}
      onPointerUp={(e) => {
        e.preventDefault();
        onUp?.();
      }}
      onPointerLeave={() => onUp?.()}
      onPointerCancel={() => onUp?.()}
      className={
        accent
          ? 'grid h-14 w-14 place-items-center rounded-full border-2 border-gold bg-blood/80 text-parch shadow-lg active:translate-y-1'
          : 'grid h-14 w-14 place-items-center rounded-full border-2 border-gold/60 bg-black/50 text-gold shadow-lg active:translate-y-1'
      }
    >
      {label}
    </button>
  );
}

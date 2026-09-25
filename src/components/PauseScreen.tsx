import { Anchor, House, Play, RotateCcw } from 'lucide-react';
import type { Settings } from '../game/storage';
import { KeyCap, SoundToggles } from './ui';

interface Props {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
  settings: Settings;
  onSettings: (s: Settings) => void;
  isTouch: boolean;
  /** The song the deck is playing — the era's own tape. */
  nowPlaying: string;
}

/** Pause overlay — P / Esc resumes, R restarts instantly. */
export function PauseScreen({ onResume, onRestart, onMenu, settings, onSettings, isTouch, nowPlaying }: Props) {
  return (
    <div className="anim-fade absolute inset-0 overflow-y-auto bg-[#03101f]/60 backdrop-blur-[2px]">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="parchment anim-pop w-full max-w-sm p-6 text-center">
          <Anchor className="mx-auto h-10 w-10 text-ink-soft" />
          <h2 className="font-pirate text-5xl leading-tight">Anchored</h2>
          <p className="italic opacity-80">The crew awaits your orders, Captain.</p>
          <div className="mt-5 flex flex-col gap-3">
            <button
              type="button"
              onClick={onResume}
              className="btn-seal flex items-center justify-center gap-2 py-2.5 text-2xl"
            >
              <Play className="h-6 w-6" /> Weigh Anchor
              {!isTouch && <KeyCap className="ml-1">P</KeyCap>}
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="btn-wood flex items-center justify-center gap-2 py-2 text-xl"
            >
              <RotateCcw className="h-5 w-5" /> Restart Voyage
              {!isTouch && <KeyCap className="ml-1">R</KeyCap>}
            </button>
            <button
              type="button"
              onClick={onMenu}
              className="btn-wood flex items-center justify-center gap-2 py-2 text-xl"
            >
              <House className="h-5 w-5" /> Abandon Ship
            </button>
          </div>
          <div className="mt-5 border-t-2 border-dashed border-ink/25 pt-4">
            <p className="mb-3 text-[0.8rem] italic opacity-75">
              On the deck: <span className="not-italic opacity-90">{nowPlaying}</span>
            </p>
            <SoundToggles settings={settings} onChange={onSettings} />
          </div>
        </div>
      </div>
    </div>
  );
}

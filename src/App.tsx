import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause } from 'lucide-react';
import { Engine } from './game/engine';
import { isTypingTarget } from './game/input';
import type { GameStats, Screen, UpgradeId, UpgradeOffer } from './game/types';
import {
  addScore,
  loadName,
  loadScores,
  loadSettings,
  saveName,
  saveSettings,
  type ScoreEntry,
  type Settings,
} from './game/storage';
import { StartScreen } from './components/StartScreen';
import { PauseScreen } from './components/PauseScreen';
import { UpgradeScreen } from './components/UpgradeScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { TouchControls } from './components/TouchControls';

function detectTouch(): boolean {
  if (typeof window === 'undefined') return false;
  const coarse = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  return coarse || (navigator.maxTouchPoints > 0 && 'ontouchstart' in window);
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [screen, setScreen] = useState<Screen>('menu');
  const screenRef = useRef<Screen>('menu');
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [stats, setStats] = useState<GameStats | null>(null);
  const [rank, setRank] = useState(-1);
  const [offers, setOffers] = useState<UpgradeOffer[]>([]);
  const offersRef = useRef<UpgradeOffer[]>([]);
  const [offerWave, setOfferWave] = useState(0);
  const [name, setName] = useState(() => loadName());
  const nameRef = useRef(name);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const settingsRef = useRef(settings);
  const [isTouch, setIsTouch] = useState(() => detectTouch());
  const gameOverAt = useRef(0);
  const upgradeAt = useRef(0);

  useEffect(() => {
    nameRef.current = name;
  }, [name]);

  // ---- engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const eng = new Engine(canvas, {
      onScreen: (s) => {
        screenRef.current = s;
        if (s === 'upgrade') upgradeAt.current = performance.now();
        setScreen(s);
      },
      onGameOver: (st) => {
        gameOverAt.current = performance.now();
        const entryName = nameRef.current.trim() || 'Captain';
        if (st.score > 0) {
          const res = addScore({ name: entryName, score: st.score, wave: st.wave, sunk: st.sunk, date: Date.now() });
          setScores(res.scores);
          setRank(res.rank);
        } else {
          setRank(-1);
        }
        setStats(st);
      },
      onUpgrade: (o, w) => {
        offersRef.current = o;
        setOffers(o);
        setOfferWave(w);
      },
    });
    eng.setAudio(settingsRef.current.sfx, settingsRef.current.music);
    engineRef.current = eng;
    setEngine(eng);
    return () => {
      eng.destroy();
      engineRef.current = null;
      setEngine(null);
    };
  }, []);

  // ---- detect first touch on hybrid devices
  useEffect(() => {
    const onTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', onTouch, { passive: true, once: true });
    return () => window.removeEventListener('touchstart', onTouch);
  }, []);

  // ---- actions
  const start = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    saveName(nameRef.current.trim());
    setStats(null);
    setRank(-1);
    e.startGame();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);
  const resume = useCallback(() => engineRef.current?.resume(), []);
  const toMenu = useCallback(() => {
    engineRef.current?.quitToMenu();
    setScores(loadScores());
  }, []);
  const choose = useCallback((id: UpgradeId) => {
    engineRef.current?.chooseUpgrade(id);
  }, []);

  const updateSettings = useCallback((s: Settings) => {
    settingsRef.current = s;
    setSettings(s);
    saveSettings(s);
    engineRef.current?.unlockAudio();
    engineRef.current?.setAudio(s.sfx, s.music);
  }, []);

  // ---- menu / meta keyboard shortcuts (gameplay keys live in the engine)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const s = screenRef.current;
      const typing = isTypingTarget(e.target);
      if (e.code === 'KeyM' && !typing) {
        const cur = settingsRef.current;
        const anyOn = cur.sfx || cur.music;
        updateSettings({ sfx: !anyOn, music: !anyOn });
        return;
      }
      switch (s) {
        case 'menu':
          if (e.code === 'Enter' || e.code === 'NumpadEnter' || (e.code === 'Space' && !typing)) {
            e.preventDefault();
            start();
          }
          break;
        case 'playing':
          if (e.code === 'KeyP' || e.code === 'Escape') {
            e.preventDefault();
            pause();
          }
          break;
        case 'paused':
          if (e.code === 'KeyP' || e.code === 'Escape' || e.code === 'Enter') {
            e.preventDefault();
            resume();
          } else if (e.code === 'KeyR') {
            e.preventDefault();
            start();
          }
          break;
        case 'upgrade': {
          if (performance.now() - upgradeAt.current < 450) return;
          const map: Record<string, number> = { Digit1: 0, Digit2: 1, Digit3: 2, Numpad1: 0, Numpad2: 1, Numpad3: 2 };
          const idx = map[e.code];
          if (idx !== undefined && offersRef.current[idx]) {
            e.preventDefault();
            choose(offersRef.current[idx].def.id);
          }
          break;
        }
        case 'gameover': {
          const since = performance.now() - gameOverAt.current;
          if (e.code === 'KeyR' || ((e.code === 'Enter' || e.code === 'Space') && since > 700)) {
            e.preventDefault();
            start();
          }
          break;
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [start, pause, resume, choose, updateSettings]);

  return (
    <div className="fixed inset-0 select-none overflow-hidden bg-abyss">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse' || screenRef.current !== 'playing') return;
          const inp = engineRef.current?.input;
          if (!inp) return;
          inp.smartQueued = true;
          inp.touchFireHeld = true;
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== 'mouse') return;
          const inp = engineRef.current?.input;
          if (inp) inp.touchFireHeld = false;
        }}
        onPointerLeave={() => {
          const inp = engineRef.current?.input;
          if (inp && !isTouch) inp.touchFireHeld = false;
        }}
      />

      {screen === 'playing' && engine && isTouch && <TouchControls input={engine.input} />}

      {screen === 'playing' && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Pause"
          onClick={(e) => {
            e.currentTarget.blur();
            pause();
          }}
          className="btn-wood absolute grid h-11 w-11 place-items-center rounded-full p-0"
          style={{ top: 'max(10px, env(safe-area-inset-top))', right: 'max(10px, env(safe-area-inset-right))' }}
        >
          <Pause className="h-5 w-5" />
        </button>
      )}

      {screen === 'menu' && (
        <StartScreen
          name={name}
          onName={setName}
          onStart={start}
          scores={scores}
          settings={settings}
          onSettings={updateSettings}
          isTouch={isTouch}
        />
      )}

      {screen === 'paused' && (
        <PauseScreen
          onResume={resume}
          onRestart={start}
          onMenu={toMenu}
          settings={settings}
          onSettings={updateSettings}
          isTouch={isTouch}
        />
      )}

      {screen === 'upgrade' && offers.length > 0 && (
        <UpgradeScreen offers={offers} wave={offerWave} onChoose={choose} isTouch={isTouch} />
      )}

      {screen === 'gameover' && stats && (
        <GameOverScreen
          stats={stats}
          scores={scores}
          rank={rank}
          name={name.trim()}
          onRestart={start}
          onMenu={toMenu}
          isTouch={isTouch}
        />
      )}
    </div>
  );
}

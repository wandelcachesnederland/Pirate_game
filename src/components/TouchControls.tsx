import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Bomb, ShipWheel } from 'lucide-react';
import type { Input } from '../game/input';
import { cn } from '../utils/cn';

const R = 60; // joystick radius (px)
const DEAD = 7; // dead-zone before steering engages (px)

export function TouchControls({ input }: { input: Input }) {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const joyId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const fireIds = useRef(new Set<number>());
  const [active, setActive] = useState(false);
  const [firing, setFiring] = useState(false);

  useEffect(() => {
    const ids = fireIds.current;
    return () => {
      input.releaseJoy();
      input.touchFireHeld = false;
      ids.clear();
    };
  }, [input]);

  useEffect(() => {
    // focus lost mid-touch (alt-tab, notification): drop all held state so the
    // stick and FIRE can never latch onto a pointer that is already gone
    const onBlur = () => {
      joyId.current = null;
      fireIds.current.clear();
      input.releaseJoy();
      input.touchFireHeld = false;
      setActive(false);
      setFiring(false);
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [input]);

  const placeBase = (x: number, y: number) => {
    const b = baseRef.current;
    if (b) b.style.transform = `translate3d(${x - R}px, ${y - R}px, 0)`;
  };
  const placeKnob = (dx: number, dy: number) => {
    const k = knobRef.current;
    if (k) k.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
  };

  const onJoyDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (joyId.current !== null) return;
    e.preventDefault();
    joyId.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    origin.current = { x: e.clientX, y: e.clientY };
    placeBase(e.clientX, e.clientY);
    placeKnob(0, 0);
    setActive(true);
    input.usedTouch = true;
  };

  const onJoyMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joyId.current) return;
    let dx = e.clientX - origin.current.x;
    let dy = e.clientY - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d > R) {
      // floating stick: drag the base along so the thumb never slips off
      const excess = d - R;
      origin.current.x += (dx / d) * excess;
      origin.current.y += (dy / d) * excess;
      placeBase(origin.current.x, origin.current.y);
      dx = (dx / d) * R;
      dy = (dy / d) * R;
    }
    placeKnob(dx, dy);
    if (d > DEAD) input.setJoy(dx / R, dy / R);
    else input.releaseJoy(); // back in the dead zone — stop steering, don't hold the last heading
  };

  const onJoyUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerId !== joyId.current) return;
    joyId.current = null;
    input.releaseJoy();
    placeKnob(0, 0);
    setActive(false);
  };

  const onFireDown = (e: RPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    fireIds.current.add(e.pointerId);
    input.smartQueued = true;
    input.touchFireHeld = true;
    input.usedTouch = true;
    setFiring(true);
  };

  const onFireUp = (e: RPointerEvent<HTMLDivElement>) => {
    if (!fireIds.current.has(e.pointerId)) return;
    fireIds.current.delete(e.pointerId);
    if (fireIds.current.size === 0) {
      input.touchFireHeld = false;
      setFiring(false);
    }
  };

  return (
    <>
      {/* Steering zone (left) */}
      <div
        className="absolute bottom-0 left-0 top-[20%] w-[55%] touch-none"
        onPointerDown={onJoyDown}
        onPointerMove={onJoyMove}
        onPointerUp={onJoyUp}
        onPointerCancel={onJoyUp}
        onLostPointerCapture={onJoyUp}
      />

      {/* Idle hint */}
      <div
        className={cn(
          'pointer-events-none absolute grid h-[120px] w-[120px] place-items-center rounded-full border-2 border-dashed border-parch/40 bg-black/15 transition-opacity duration-300',
          active ? 'opacity-0' : 'opacity-100',
        )}
        style={{
          left: 'calc(max(14px, env(safe-area-inset-left)) + 14px)',
          bottom: 'calc(max(14px, env(safe-area-inset-bottom)) + 24px)',
        }}
      >
        <div className="flex flex-col items-center text-parch/70">
          <ShipWheel className="h-9 w-9" />
          <span className="font-pirate text-sm tracking-wider">STEER</span>
        </div>
      </div>

      {/* Floating joystick */}
      <div
        ref={baseRef}
        className={cn(
          'pointer-events-none absolute left-0 top-0 h-[120px] w-[120px] rounded-full border-[3px] border-gold/80 bg-[radial-gradient(circle,rgba(0,0,0,0.1),rgba(0,0,0,0.35))] shadow-[0_0_24px_rgba(0,0,0,0.35)] transition-opacity duration-100',
          active ? 'opacity-100' : 'opacity-0',
        )}
      >
        <div
          ref={knobRef}
          className="absolute left-[32px] top-[32px] grid h-14 w-14 place-items-center rounded-full border-2 border-[#f0c060] bg-[radial-gradient(circle_at_35%_30%,#8a5a2e,#4a2c14)] text-gold shadow-[0_6px_14px_rgba(0,0,0,0.5)]"
        >
          <ShipWheel className="h-8 w-8" />
        </div>
      </div>

      {/* Fire zone (right) */}
      <div
        className="absolute bottom-0 right-0 top-[20%] w-[45%] touch-none"
        onPointerDown={onFireDown}
        onPointerUp={onFireUp}
        onPointerCancel={onFireUp}
        onLostPointerCapture={onFireUp}
      >
        <div
          className={cn(
            'btn-seal pointer-events-none absolute flex flex-col items-center justify-center leading-none transition-transform duration-75',
            firing ? 'scale-90 brightness-125' : 'scale-100',
          )}
          style={{
            right: 'max(18px, env(safe-area-inset-right))',
            bottom: 'max(26px, env(safe-area-inset-bottom))',
            width: 108,
            height: 108,
          }}
        >
          <Bomb className="h-9 w-9" />
          <span className="mt-0.5 text-2xl">FIRE</span>
        </div>
      </div>
    </>
  );
}

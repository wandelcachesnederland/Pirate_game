const GAME_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'KeyQ',
  'KeyE',
  'KeyJ',
  'KeyK',
  'KeyL',
]);

export function isTypingTarget(t: EventTarget | null): boolean {
  if (!t || !(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || t.isContentEditable;
}

/** Shared input state: keyboard is captured here, touch UI writes into it directly. */
export class Input {
  down = new Set<string>();
  portQueued = false;
  starQueued = false;
  smartQueued = false;
  touchFireHeld = false;
  joyActive = false;
  joyX = 0;
  joyY = 0;
  joyMag = 0;
  usedTouch = false;
  enabled = false;

  private onDown = (e: KeyboardEvent) => {
    if (isTypingTarget(e.target)) return;
    const c = e.code;
    if (!GAME_KEYS.has(c)) return;
    if (this.enabled) e.preventDefault();
    this.down.add(c);
    if (e.repeat || !this.enabled) return;
    if (c === 'KeyQ' || c === 'KeyJ') this.portQueued = true;
    else if (c === 'KeyE' || c === 'KeyL') this.starQueued = true;
    else if (c === 'Space' || c === 'KeyK') this.smartQueued = true;
  };

  private onUp = (e: KeyboardEvent) => {
    const c = e.code;
    if (GAME_KEYS.has(c) && this.enabled) e.preventDefault();
    this.down.delete(c);
  };

  clear = () => {
    this.down.clear();
    this.portQueued = false;
    this.starQueued = false;
    this.smartQueued = false;
    this.touchFireHeld = false;
    this.joyActive = false;
    this.joyMag = 0;
  };

  attach() {
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
    window.addEventListener('blur', this.clear);
  }

  detach() {
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    window.removeEventListener('blur', this.clear);
  }

  has(...codes: string[]): boolean {
    for (const c of codes) if (this.down.has(c)) return true;
    return false;
  }

  get left() {
    return this.has('KeyA', 'ArrowLeft');
  }
  get right() {
    return this.has('KeyD', 'ArrowRight');
  }
  get up() {
    return this.has('KeyW', 'ArrowUp');
  }
  get downKey() {
    return this.has('KeyS', 'ArrowDown');
  }
  get portHeld() {
    return this.has('KeyQ', 'KeyJ');
  }
  get starHeld() {
    return this.has('KeyE', 'KeyL');
  }
  get smartHeld() {
    return this.touchFireHeld || this.has('Space', 'KeyK');
  }

  setJoy(x: number, y: number) {
    const m = Math.hypot(x, y);
    this.joyActive = true;
    this.usedTouch = true;
    this.joyMag = Math.min(1, m);
    if (m > 0.0001) {
      this.joyX = x / m;
      this.joyY = y / m;
    }
  }

  releaseJoy() {
    this.joyActive = false;
  }

  consume() {
    this.portQueued = false;
    this.starQueued = false;
    this.smartQueued = false;
  }
}

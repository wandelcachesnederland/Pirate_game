import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdventureEngine } from '../src/game/adventure/engine';
import {
  FOES,
  FOE_BY_ID,
  LEASH_RANGE,
  REFITS,
  WAKE_RANGE,
  contractOffer,
  lairsInBounds,
  liveFoes,
  nearestFoe,
  rankFor,
  refitCost,
  repairCost,
  statsFor,
  type FoeDef,
  type RefitId,
} from '../src/game/adventure/beasts';
import { PORTS_PROJ } from '../src/game/chart/ports';
import { isLand, project } from '../src/game/chart/world';

// ----------------------------------------------------------------- harness

/** Exercise the real adventure methods without a canvas or animation loop. */
function harness(overrides: Record<string, unknown> = {}) {
  const e = Object.create(AdventureEngine.prototype) as any;
  const sounds: string[] = [];
  Object.assign(e, {
    player: ship(1000, 400),
    foes: [],
    raiders: [],
    projectiles: [],
    messages: [],
    phase: 'sailing',
    activePortId: null,
    renown: 0,
    salvage: 5000,
    refits: { guns: 0, hull: 0, gunners: 0, copper: 0 },
    contract: null,
    defeated: new Set<string>(),
    stats: { days: 1, felled: 0, raiders: 0, ports: new Set<string>() },
    cb: {},
    input: { consume() {} },
    audio: new Proxy({}, { get: (_o, key) => () => sounds.push(String(key)) }),
    ...overrides,
  });
  return { e, sounds };
}

function ship(x: number, y: number, extra: Record<string, unknown> = {}) {
  return {
    x, y, angle: 0, sail: 1, vx: 0, vy: 0,
    hp: 140, maxHp: 140, cannons: 3, damage: 6, range: 86, reload: 1,
    reloadL: 0, reloadR: 0, speed: 48, turn: 2.6, hitFlash: 0,
    ...extra,
  };
}

/**
 * A foe in its lair, optionally dragged to a position of our choosing. The lair
 * follows the position, so leash tests are about the distance we actually set.
 */
function foe(id: string, at?: { x: number; y: number }, lair = at) {
  const { e } = harness();
  const f = e.makeFoe(FOE_BY_ID[id]) as FoeDef & Record<string, any>;
  if (at) {
    f.x = at.x;
    f.y = at.y;
  }
  if (lair) {
    f.lairX = lair.x;
    f.lairY = lair.y;
  }
  return f as Record<string, any>;
}

// ----------------------------------------------------------------- the gallery

test('every lair holds a named peril in open water', () => {
  assert.equal(lairsInBounds(), true);
  assert.ok(FOES.length >= 8, 'the chart should be well populated');
  assert.equal(new Set(FOES.map((f) => f.id)).size, FOES.length, 'lair ids are unique');
  for (const f of FOES) {
    assert.equal(isLand(f.x, f.y), false, `${f.id} must lair in water`);
    assert.ok(f.hp > 0 && f.damage > 0 && f.renown > 0 && f.salvage > 0, `${f.id} has stats`);
    assert.ok(f.name.length > 0 && f.title.length > 0 && f.tale.length > 0, `${f.id} has a story`);
  }
  assert.ok(FOES.some((f) => f.kind === 'beast') && FOES.some((f) => f.kind === 'rival'));
});

test('no two lairs sit close enough to wake together', () => {
  for (let i = 0; i < FOES.length; i++) {
    for (let j = i + 1; j < FOES.length; j++) {
      const d = Math.hypot(FOES[i].x - FOES[j].x, FOES[i].y - FOES[j].y);
      assert.ok(d > WAKE_RANGE, `${FOES[i].id} and ${FOES[j].id} are only ${d.toFixed(0)} apart`);
    }
  }
});

test('tiers get harder and pay better, in order', () => {
  for (const tier of [2, 3, 4]) {
    const prev = statsFor({ ...FOE_BY_ID['vane'], tier: tier - 1, kind: 'rival' });
    const next = statsFor({ ...FOE_BY_ID['vane'], tier, kind: 'rival' });
    assert.ok(next.hp > prev.hp, `tier ${tier} is tougher`);
    assert.ok(next.damage > prev.damage, `tier ${tier} hits harder`);
    assert.ok(next.renown > prev.renown, `tier ${tier} pays more renown`);
    assert.ok(next.salvage > prev.salvage, `tier ${tier} pays more salvage`);
  }
});

test('beasts are brutes at knife range; rivals stand off and throw shot', () => {
  const beast = statsFor({ ...FOE_BY_ID['gulper'], kind: 'beast' });
  const rival = statsFor({ ...FOE_BY_ID['gulper'], kind: 'rival' });
  assert.ok(beast.range < rival.range, 'a beast must close to bite');
  assert.ok(beast.damage > rival.damage, 'the bite is worse than a broadside');
  assert.ok(beast.speed > rival.speed, 'beasts are faster in the water');
  assert.ok(beast.hp > rival.hp, 'beasts take more killing');
});

// ----------------------------------------------------------------- contracts

test('the bounty board sends you at the trouble nearest the port you are in', () => {
  const london = contractOffer('london', []);
  const nagasaki = contractOffer('nagasaki', []);
  assert.ok(london && nagasaki);
  const lp = PORTS_PROJ.find((p) => p.id === 'london')!;
  const np = PORTS_PROJ.find((p) => p.id === 'nagasaki')!;
  const londonFoe = FOE_BY_ID[london.foeId];
  const nagasakiFoe = FOE_BY_ID[nagasaki.foeId];
  const londonDist = Math.hypot(londonFoe.x - lp.x, londonFoe.y - lp.y);
  const nagasakiDist = Math.hypot(nagasakiFoe.x - np.x, nagasakiFoe.y - np.y);
  assert.ok(nagasakiDist < londonDist, 'Nagasaki should be sent at closer game than London is');
});

test('a name already crossed off is never offered again, and a clear chart offers nothing', () => {
  const first = contractOffer('london', [])!;
  const second = contractOffer('london', [first.foeId])!;
  assert.notEqual(second.foeId, first.foeId);
  // a contract is only ever for a living foe
  assert.ok(liveFoes([first.foeId]).every((f) => f.id !== first.foeId));
  const all = FOES.map((f) => f.id);
  assert.equal(contractOffer('london', all), null);
  assert.equal(liveFoes(all).length, 0);
});

test('contracts pay more for a bigger name', () => {
  // leave exactly one lair alive and the board must send you at that one
  const butVane = FOES.filter((f) => f.id !== 'vane').map((f) => f.id);
  const butSable = FOES.filter((f) => f.id !== 'sable').map((f) => f.id);
  const small = contractOffer('london', butVane)!;
  const big = contractOffer('london', butSable)!;
  assert.equal(small.foeId, 'vane');
  assert.equal(big.foeId, 'sable');
  assert.equal(FOE_BY_ID[small.foeId].tier, 1);
  assert.equal(FOE_BY_ID[big.foeId].tier, 4);
  assert.ok(big.renown > small.renown && big.salvage > small.salvage);
});

// ----------------------------------------------------------------- refits

test('refits escalate in price and cap out', () => {
  for (const def of REFITS) {
    const first = refitCost(def.id, 0);
    const second = refitCost(def.id, 1);
    assert.ok(first && second && second > first, `${def.id} gets dearer`);
    assert.equal(refitCost(def.id, def.max), null, `${def.id} caps at ${def.max}`);
  }
});

test('repairs are priced by missing hull', () => {
  assert.equal(repairCost(0), 0);
  assert.equal(repairCost(-20), 0, 'a ship in good order owes nothing');
  assert.equal(repairCost(50), 100);
});

test('renown buys a reputation', () => {
  assert.equal(rankFor(0), 'Unknown Hand');
  assert.equal(rankFor(2000), 'Legend of the Chart');
  let last = '';
  for (const renown of [0, 200, 400, 700, 1100, 1600]) {
    const rank = rankFor(renown);
    assert.notEqual(rank, last);
    last = rank;
  }
});

// ----------------------------------------------------------------- hunting

test('a lair wakes when you sail within its reach and names itself', () => {
  const f = foe('gulper', { x: 1000, y: 460 });
  const { e, sounds } = harness({ foes: [f], player: ship(1000, 400) });
  assert.equal(f.awake, false);
  e.updateFoes(0.1);
  assert.equal(f.awake, true, 'sailing close wakes it');
  assert.ok(e.messages.some((m: any) => m.text.includes('Brine Gulper')));
  assert.ok(sounds.includes('roar'), 'a beast roars when it wakes');
});

test('a lair stays asleep until you are close enough', () => {
  const f = foe('vane', { x: 1000, y: 400 + WAKE_RANGE + 60 });
  const { e, sounds } = harness({ foes: [f], player: ship(1000, 400) });
  e.updateFoes(0.1);
  assert.equal(f.awake, false);
  assert.equal(sounds.length, 0);
});

test('a rival woken hears a stinger, not a roar', () => {
  const f = foe('vane', { x: 1000, y: 460 });
  const { e, sounds } = harness({ foes: [f], player: ship(1000, 400) });
  e.updateFoes(0.1);
  assert.ok(sounds.includes('stinger'));
  assert.ok(!sounds.includes('roar'));
});

test('a woken foe turns for home past its leash and sleeps again', () => {
  const lair = { x: 1000, y: 400 };
  const f = foe('kraken', { x: lair.x, y: lair.y });
  f.awake = true;
  f.x = lair.x;
  f.y = lair.y + LEASH_RANGE + 40; // dragged far from its lair
  const { e } = harness({ foes: [f], player: ship(1000, 400) });
  e.updateFoes(0.1);
  assert.equal(f.goingHome, true, 'past the leash it gives up the chase');
  // let it steer home: park it on the lair and it should settle
  f.x = lair.x + 6;
  f.y = lair.y + 6;
  e.updateFoes(0.1);
  assert.equal(f.awake, false, 'home again, it sleeps');
});

test('a sleeping foe heals, so you cannot nibble it to death', () => {
  const f = foe('leviathan', { x: 2000, y: 700 });
  f.hp = f.maxHp * 0.5;
  const { e } = harness({ foes: [f], player: ship(1000, 400) });
  e.updateFoes(1);
  assert.ok(f.hp > f.maxHp * 0.5, 'it recovers while it sleeps');
  assert.ok(f.hp <= f.maxHp);
});

test('a rival stands off and fires its broadside when you are abeam', () => {
  const f = foe('takeda', { x: 1000, y: 400 });
  f.awake = true;
  f.angle = 0; // facing +x, so the port battery covers -y
  const player = ship(1000, 340); // 60 off the port beam, inside a rival's reach
  const { e } = harness({ foes: [f], player });
  const before = player.hp;
  e.updateFoes(0.1);
  assert.ok(player.hp < before, 'the broadside lands');
});

test('a beast bites at knife range', () => {
  const f = foe('serpent', { x: 1000, y: 400 });
  f.awake = true;
  const player = ship(1000, 420);
  const { e, sounds } = harness({ foes: [f], player });
  const before = player.hp;
  e.updateFoes(0.1);
  assert.ok(player.hp < before, 'the bite takes the hull');
  assert.ok(sounds.includes('crunch'));
});

test('a broadside will not reach past the guns or across the bow', () => {
  const { e } = harness();
  // with the bow pointing along +x, the starboard battery covers +y
  const src = ship(1000, 400);
  const far = ship(1000, 400 + src.range + 50);
  const abeam = ship(1000, 400 + src.range - 10);
  const ahead = ship(1000 + src.range - 10, 400); // dead ahead: across the bow
  assert.equal(e.fireAt(src, far, 'star'), false, 'out of reach');
  assert.equal(e.fireAt(src, abeam, 'star'), true, 'abeam and in reach');
  assert.equal(e.projectiles.length, 1);
  assert.equal(e.fireAt(src, ahead, 'star'), false, 'the guns do not point forward');
  assert.equal(src.reloadR, src.reload, 'the battery is loading after it told');
});

test('a battery that has fired cannot tell again until it has loaded', () => {
  const { e } = harness();
  e.firePlayer('star'); // nothing in the arc: powder and smoke only
  const smoke = e.projectiles.length;
  assert.ok(smoke > 0, 'the guns speak even when nothing is abeam');
  assert.ok(e.player.reloadR > 0, 'and then they load');
  e.firePlayer('star');
  assert.equal(e.projectiles.length, smoke, 'no second shot while loading');
  e.player.reloadR = 0;
  e.firePlayer('star');
  assert.ok(e.projectiles.length > smoke, 'once loaded it can speak again');
});

test('crossing a name off pays renown, salvage and any bounty on it', () => {
  const f = foe('sarr', { x: 1000, y: 460 });
  f.awake = true;
  f.hp = 0;
  const { e } = harness({ foes: [f], player: ship(1000, 400), contract: { foeId: 'sarr', renown: 60, salvage: 240 } });
  e.updateFoes(0.1);
  assert.equal(e.foes.length, 0);
  assert.equal(e.defeated.has('sarr'), true);
  assert.equal(e.renown, f.def.renown + 60);
  assert.equal(e.salvage, 5000 + f.def.salvage + 240);
  assert.equal(e.contract, null, 'the bounty is settled');
  assert.equal(e.stats.felled, 1);
});

test('a prize taken without a contract pays only its own worth', () => {
  const f = foe('bonnet', { x: 1000, y: 460 });
  f.awake = true;
  f.hp = 0;
  const { e } = harness({ foes: [f], player: ship(1000, 400) });
  e.updateFoes(0.1);
  assert.equal(e.renown, f.def.renown);
  assert.equal(e.salvage, 5000 + f.def.salvage);
});

// ----------------------------------------------------------------- the voyage

test('the chart is won when the last lair is empty', () => {
  const { e } = harness({ foes: [] });
  e.checkEnd();
  assert.equal(e.phase, 'victory');
});

test('losing the hull ends the voyage', () => {
  const { e } = harness({ player: ship(1000, 400, { hp: 0 }), foes: [foe('sable', { x: 1000, y: 460 })] });
  e.checkEnd();
  assert.equal(e.phase, 'over');
});

test('salvage buys refits that change the ship', () => {
  const { e } = harness({ phase: 'docked' });
  const base = { damage: e.player.damage, maxHp: e.player.maxHp, reload: e.player.reload, speed: e.player.speed };
  const gunsCost = e.refitCost('guns');
  assert.equal(e.buyRefit('guns'), true);
  assert.equal(e.player.damage, base.damage + 1);
  assert.equal(e.salvage, 5000 - gunsCost);
  assert.equal(e.refits.guns, 1);
  assert.ok(e.refitCost('guns')! > gunsCost, 'the next one costs more');

  e.buyRefit('hull');
  assert.equal(e.player.maxHp, base.maxHp + 25);
  e.buyRefit('gunners');
  assert.ok(e.player.reload < base.reload);
  e.buyRefit('copper');
  assert.equal(e.player.speed, base.speed + 4);
});

test('a refit cannot be bought at sea or with empty pockets', () => {
  const { e } = harness({ phase: 'sailing', salvage: 5 });
  assert.equal(e.buyRefit('guns'), false);
  assert.equal(e.refits.guns, 0);
  assert.equal(e.salvage, 5);
});

test('repairs are charged in salvage and only in port', () => {
  const { e } = harness({ phase: 'sailing', player: ship(1000, 400, { hp: 100 }) });
  e.repair();
  assert.equal(e.player.hp, 100, 'no shipwright at sea');
  e.phase = 'docked';
  e.repair();
  assert.equal(e.player.hp, 140);
  assert.equal(e.salvage, 5000 - 80);
});

test('the bounty board is signed in port and can be torn up', () => {
  const { e } = harness({ phase: 'sailing' });
  e.takeContract();
  assert.equal(e.contract, null, 'no signing at sea');
  e.phase = 'docked';
  e.activePortId = 'portroyal';
  e.takeContract();
  assert.ok(e.contract, 'a contract is taken in port');
  const held = e.contract.foeId;
  assert.ok(FOE_BY_ID[held]);
  e.abandonContract();
  assert.equal(e.contract, null);
});

test('a ship slides along the coast instead of sailing through it', () => {
  const { e } = harness();
  // walk east across the Atlantic until Africa interrupts, along latitude 20
  const [, y] = project(0, 20);
  let coastX = 0;
  for (let lon = -20; lon < 15; lon += 0.25) {
    const [x] = project(lon, 20);
    if (isLand(x, y)) {
      coastX = x;
      break;
    }
  }
  assert.ok(coastX > 0, 'found the African coast');
  const s = ship(coastX - 4, y);
  e.moveWithLand(s, coastX + 2, y); // try to sail straight into the Sahara
  assert.equal(s.x, coastX - 4, 'refused on the x axis');
  assert.equal(isLand(s.x, s.y), false, 'still afloat');
  // but a move that stays in water is allowed
  const before = s.y;
  e.moveWithLand(s, s.x, y + 3);
  assert.equal(s.y, before + 3);
});

test('the HUD reports the hunt: the name on you, the tally and your rank', () => {
  const f = foe('rooke', { x: 1000, y: 460 });
  f.awake = true;
  const { e } = harness({ foes: [f], player: ship(1000, 400), renown: 700 });
  const hud = e.getHud();
  assert.equal(hud.target?.id, 'rooke');
  assert.equal(hud.target?.kind, 'rival');
  assert.ok(hud.target!.distance <= 61);
  assert.equal(hud.threats, 1);
  assert.equal(hud.felled, 0);
  assert.equal(hud.total, FOES.length);
  assert.equal(hud.rank, rankFor(700));
  assert.equal(hud.renown, 700);
  // a sleeping lair is not a contact
  f.awake = false;
  assert.equal(e.getHud().target, null);
});

test('a fresh voyage wakes every lair and leaves you unknown', () => {
  const { e } = harness();
  e.freshVoyage();
  assert.equal(e.foes.length, FOES.length);
  assert.ok(e.foes.every((f: any) => f.awake === false));
  assert.equal(e.renown, 0);
  assert.equal(e.phase, 'sailing');
  assert.equal(isLand(e.player.x, e.player.y), false, 'you start afloat');
  const nearest = nearestFoe(e.player.x, e.player.y);
  assert.ok(nearest && nearest.d > WAKE_RANGE, 'no lair is on top of you at the start');
});

test('the port panel reports refits, the board and what is left to hunt', () => {
  const { e } = harness();
  e.freshVoyage();
  e.activePortId = 'portroyal';
  e.phase = 'docked';
  const port = e.getPort();
  assert.equal(port.port.name, 'Port Royal');
  assert.equal(port.remaining, FOES.length);
  assert.equal(port.refits.length, REFITS.length);
  assert.ok(port.offer, 'the board has something on it');
  assert.equal(port.activeContract, null);
  e.takeContract();
  assert.ok(e.getPort().activeContract, 'the signed contract shows in port');
  assert.equal(e.getPort().offer, null, 'one contract at a time');
});

test('refit ids known to the UI all exist and are capped', () => {
  const ids: RefitId[] = ['guns', 'hull', 'gunners', 'copper'];
  for (const id of ids) {
    const def = REFITS.find((r) => r.id === id);
    assert.ok(def, `${id} is a real refit`);
    assert.ok(refitCost(id, def!.max - 1) !== null);
    assert.equal(refitCost(id, def!.max), null);
  }
});

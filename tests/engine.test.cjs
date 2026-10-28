'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const BB = require('../src/engine.js');
const seed = require('../database/seed.json');
const key = 'bongobridge-demo-v1';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: key => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}
function setup() {
  globalThis.localStorage = memoryStorage();
  return BB.load(seed);
}

test('quote separates the staged import payment and measures physical weight', () => {
  const quote = BB.estimate({ origin: 'China', price: 42, weight: 0.35 });
  assert.equal(quote.items,5040); assert.equal(quote.shipping,252); assert.equal(quote.total,5372); assert.equal(quote.advance,3528); assert.equal(quote.balance,1844); assert.equal(quote.billableWeight,0.35);
  assert.equal(BB.estimate({ origin: 'China', price: 58, weight: 0.8, quantity: 2 }).billableWeight, 1.6);
});

test('mode, city, quantity, zero price and numeric form inputs affect quotes correctly', () => {
  const quote = BB.estimate({ origin: 'India', price: '0', weight: '0.01', quantity: '2', city: 'Sylhet', mode: 'sea' });
  assert.equal(quote.shipping, 5);
  assert.equal(quote.delivery, 150);
  assert.equal(quote.total, 155);
  assert.equal(quote.days, '12–18');
  assert.equal(BB.estimate({ origin: 'USA', price: 1, weight: 0.5, mode: 'sea' }).days, '25–40');
  assert.equal(BB.estimate({ origin: 'UK', price: 1, weight: 0.51 }).shipping, 536);
});

test('quote rejects blank, negative, nonfinite, extreme and unsupported values', () => {
  const base = { origin: 'China', price: 10, weight: 1 };
  const invalid = [
    { price: '' }, { price: ' ' }, { price: null }, { price: NaN }, { price: Infinity }, { price: -1 }, { price: 100001 },
    { weight: 0 }, { weight: -1 }, { weight: 1001 }, { weight: 'abc' }, { quantity: 0 }, { quantity: 21 }, { quantity: 1.5 },
    { origin: '__proto__' }, { origin: 'Japan' }, { city: 'Atlantis' }, { mode: 'express' }
  ];
  invalid.forEach(change => assert.throws(() => BB.estimate({ ...base, ...change }), RangeError));
  assert.throws(() => BB.estimate(null), RangeError);
});

test('fresh state clones the seed and save/load round trips permitted fields', () => {
  const state = setup();
  assert.equal(state.orders.length, 6);
  state.orders[0].statusIndex = 3;
  state.cart.push({ productId: 'P001', quantity: 2 });
  state.secret = 'never persist extra properties';
  assert.equal(BB.save(state), true);
  assert.equal(seed.orders[0].statusIndex, 0);
  const restored = BB.load(seed);
  assert.equal(restored.orders[0].statusIndex, 3);
  assert.deepEqual(restored.cart, [{ productId: 'P001', quantity: 2 }]);
  assert.equal(restored.secret, undefined);
});

test('corrupt storage and tampered unknown records fall back to seed', () => {
  setup();
  for (const raw of ['{not json', 'null', JSON.stringify({ orders: [], cart: [{ productId: 'unknown', quantity: 1 }] })]) {
    globalThis.localStorage.setItem(key, raw);
    assert.equal(BB.load(seed).orders.length, 6);
  }
  const state = BB.reset(seed);
  state.orders[0].statusIndex = 99;
  globalThis.localStorage.setItem(key, JSON.stringify(state));
  assert.equal(BB.load(seed).orders[0].statusIndex, 0);
});

test('restored product and customer text use generated labels only', () => {
  const state = setup();
  state.orders[0].productName = '<img src=x onerror=alert(1)>';
  state.orders[0].customer = 'Real personal name';
  globalThis.localStorage.setItem(key, JSON.stringify(state));
  const order = BB.load(seed).orders[0];
  assert.equal(order.productName, seed.products[0].name);
  assert.equal(order.customer, 'Demo Shopper');
});

test('order ids increment safely, keep presets, and calculate simulated totals', () => {
  const state = setup();
  const input = { product: seed.products[0], quantity: 2, city: 'Dhaka', origin: 'China', price: 42, weight: 0.35, mode: 'air', orders: state.orders };
  const order = BB.makeOrder(input);
  assert.equal(order.id, 'BB-DEMO-1047');
  assert.equal(order.amount, BB.estimate(input).total);
  assert.equal(order.customer, 'Demo Shopper');
  assert.equal(order.statusIndex, 0);
  assert.equal(order.productName, seed.products[0].name);
  assert.ok(Number.isFinite(Date.parse(order.createdAt)));
  assert.equal(BB.makeOrder({ ...input, orders: [...state.orders, order] }).id, 'BB-DEMO-1048');
  const proxy = BB.makeOrder({ ...input, product: undefined });
  assert.equal(proxy.productId, 'PROXY');
  assert.equal(proxy.productName, 'Sample proxy request');
});

test('reset removes only its own demo key and recovers despite unavailable storage', () => {
  const state = setup();
  globalThis.localStorage.setItem('unrelated-app', 'preserve');
  BB.save(state);
  assert.equal(BB.reset(seed).orders.length, 6);
  assert.equal(globalThis.localStorage.getItem(key), null);
  assert.equal(globalThis.localStorage.getItem('unrelated-app'), 'preserve');
  globalThis.localStorage = {
    getItem() { throw new Error('storage blocked'); },
    setItem() { throw new Error('quota exceeded'); },
    removeItem() { throw new Error('storage blocked'); }
  };
  assert.equal(BB.load(seed).orders.length, 6);
  assert.equal(BB.save(state), false);
  assert.equal(BB.reset(seed).cart.length, 0);
});

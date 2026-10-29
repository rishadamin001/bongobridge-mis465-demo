'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../src/modules/commerce.js');
const P = require('../src/modules/pricing.js');
const BB = require('../src/engine.js');

function fixture() {
  const product = {
    id: 'P001', name: 'Generated headphone', category: 'Electronics', family: 'headphones', origin: 'China',
    priceBDT: 1000, weight: 1, length: 10, width: 10, height: 10,
    image: 'assets/headphone-black.jpg', imageAlt: 'Black sample headphone', stockPerSku: 500,
    variants: [
      { id: 'black', label: 'Black', image: 'assets/headphone-black.jpg', priceDeltaBDT: 0 },
      { id: 'white', label: 'White', image: 'assets/headphone-white.jpg', priceDeltaBDT: 100 }
    ],
    sizes: [{ id: 'standard', label: 'Standard', priceDeltaBDT: 0 }, { id: 'large', label: 'Large', priceDeltaBDT: 200, weightMultiplier: 2 }],
    bulkTiers: [{ min: 1, discount: 0 }, { min: 10, discount: 5 }, { min: 50, discount: 10 }, { min: 100, discount: 15 }]
  };
  return [product, { ...product, id: 'P002', name: 'Second sample headphone', priceBDT: 800 }, { ...product, id: 'P003', family: 'keyboards', name: 'Sample keyboard' }];
}
function storage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), removeItem: key => data.delete(key) };
}

test('bulk discount pools sizes and variations of one product exactly once, with one local delivery', () => {
  const products = fixture();
  const cart = [{ productId: 'P001', variantId: 'black', sizeId: 'standard', quantity: 8 }, { productId: 'P001', variantId: 'white', sizeId: 'large', quantity: 2 }];
  const before = JSON.stringify({ products, cart });
  const result = C.quoteCart(products, cart);
  assert.equal(result.quantity, 10);
  assert.deepEqual(result.lines.map(x => [x.groupQuantity, x.discount, x.unitBDT]), [[10, 5, 950], [10, 5, 1235]]);
  assert.equal(result.lines[1].quote.actualWeight, 4);
  assert.equal(result.lines[1].size.weightMultiplier, 2);
  assert.equal(result.lines[1].quote.delivery, 0);
  assert.equal(result.lines[1].quote.localDeliveryShared, true);
  assert.deepEqual(result.totals, { items: 10070, shipping: 11400, delivery: 80, total: 21550, advance: 7049, balance: 14501, savings: 530 });
  assert.equal(JSON.stringify({ products, cart }), before);
});

test('cart addition is atomic, SKU-aware and reprices existing lines at a newly reached tier', () => {
  const products = fixture(), cart = [{ productId: 'P001', variantId: 'black', sizeId: 'standard', quantity: 9 }];
  assert.equal(C.quoteCart(products, cart).lines[0].unitBDT, 1000);
  const merged = C.addLines(products, cart, [{ productId: 'P001', variantId: 'white', sizeId: 'standard', quantity: 1 }]);
  assert.equal(cart[0].quantity, 9);
  assert.equal(merged.length, 2);
  assert.deepEqual(C.quoteCart(products, merged).lines.map(x => x.discount), [5, 5]);
  const original = JSON.stringify(merged);
  assert.throws(() => C.addLines(products, merged, [{ productId: 'P001', variantId: 'black', sizeId: 'standard', quantity: 491 }]), RangeError);
  assert.equal(JSON.stringify(merged), original);
  const sameSku = C.addLines(products, [], [{ productId: 'P001', quantity: 2 }, { productId: 'P001', quantity: 3 }]);
  assert.deepEqual(sameSku, [{ productId: 'P001', variantId: 'black', sizeId: 'standard', quantity: 5 }]);
});

test('different products never share bulk thresholds or their local delivery', () => {
  const result = C.quoteCart(fixture(), [{ productId: 'P001', quantity: 6 }, { productId: 'P002', quantity: 4 }], { city: 'Sylhet', mode: 'sea' });
  assert.deepEqual(result.lines.map(x => x.discount), [0, 0]);
  assert.deepEqual(result.lines.map(x => x.groupQuantity), [6, 4]);
  assert.equal(result.totals.delivery, 300);
  assert.equal(result.totals.savings, 0);
});

test('quantity limits, sample stock, option IDs and tier metadata reject invalid input', () => {
  const products = fixture();
  for (const quantity of [0, -1, 501, 1.5, Infinity, NaN, '', null]) assert.throws(() => C.addLines(products, [], [{ productId: 'P001', quantity }]), RangeError);
  assert.throws(() => C.addLines(products, [], [{ productId: 'P001', variantId: 'unknown', quantity: 1 }]), RangeError);
  assert.throws(() => C.resolve(products[0], { sizeId: 'unknown' }), RangeError);
  assert.throws(() => C.lineKey({ productId: 'P001', variantId: 'black|large' }), RangeError);
  assert.throws(() => C.tier({ bulkTiers: [{ min: 1, discount: 0 }, { min: 10, discount: 10 }, { min: 20, discount: 5 }] }, 20), RangeError);
  products[0].stockPerSku = 3;
  assert.throws(() => C.addLines(products, [], [{ productId: 'P001', quantity: 4 }]), RangeError);
});

test('tier boundary rounding, default options and empty carts stay deterministic', () => {
  const p = { ...fixture()[0], priceBDT: 999 };
  assert.deepEqual(C.tier(p, 9), { min: 1, discount: 0, nextMin: 10 });
  assert.deepEqual(C.tier(p, 10), { min: 10, discount: 5, nextMin: 50 });
  assert.deepEqual(C.tier(p, 100), { min: 100, discount: 15, nextMin: null });
  assert.equal(C.quoteCart([p], [{ productId: 'P001', quantity: 10 }]).lines[0].unitBDT, 949);
  const plain = { id: 'OLD001', name: 'Legacy product', category: 'Home', origin: 'India', price: 5, weight: .2, image: 'mug.jpg' };
  assert.equal(C.resolve(plain).baseUnitBDT, 600);
  assert.equal(C.resolve(plain).variantId, 'default');
  assert.equal(C.resolve(plain).size.weightMultiplier, 1);
  assert.deepEqual(C.quoteCart([p], []).totals, { items: 0, shipping: 0, delivery: 0, total: 0, advance: 0, balance: 0, savings: 0 });
});

test('import quantities reach 500 while exported consignments retain the 20-unit limit', () => {
  assert.equal(P.importQuote({ origin: 'China', priceBDT: 100, weight: .1, quantity: 500 }).items, 50000);
  assert.throws(() => P.importQuote({ origin: 'China', priceBDT: 100, weight: .1, quantity: 501 }), RangeError);
  assert.throws(() => P.exportQuote({ destination: 'UK', supplyBDT: 100, weight: .1, quantity: 21 }), RangeError);
  assert.throws(() => P.quantity(21), RangeError);
});

test('advance half-taka rounding is exact and checkout sums the same rounded SKU advances as orders', () => {
  const quote = P.importQuote({ origin: 'China', priceBDT: 2655, weight: .1, quantity: 1 });
  assert.equal(quote.items, 2655);
  assert.equal(quote.advance, 1859);
  assert.equal(quote.advance + quote.balance, quote.total);

  const product = { ...fixture()[0], priceBDT: 2655 };
  const seed = { products: [product], orders: [] };
  BB.reset(seed);
  const quoted = C.quoteCart(seed.products, [
    { productId: product.id, variantId: 'black', sizeId: 'standard', quantity: 1 },
    { productId: product.id, variantId: 'white', sizeId: 'standard', quantity: 1 }
  ]);
  assert.deepEqual(quoted.lines.map(line => line.quote.advance), [1859, 1929]);
  assert.equal(quoted.totals.advance, 3788);
  const orders = [];
  for (const line of quoted.lines) orders.push(BB.makeOrder({
    ...product, product, variantId: line.variantId, sizeId: line.sizeId,
    quantity: line.quantity, groupQuantity: line.groupQuantity,
    itemUnitBDT: line.unitBDT, baseUnitBDT: line.baseUnitBDT,
    bulkDiscount: line.discount, localDeliveryBDT: line.quote.delivery, orders
  }));
  assert.equal(orders.reduce((sum, order) => sum + order.advance, 0), quoted.totals.advance);
  assert.equal(orders.reduce((sum, order) => sum + order.balance, 0), quoted.totals.balance);
  assert.equal(quoted.totals.advance + quoted.totals.balance, quoted.totals.total);
});

test('import freight rounds exact gram-based half-taka charges up', () => {
  const fashion = P.importQuote({ origin: 'China', category: 'Fashion', priceBDT: 100, weight: .35, quantity: 1 });
  assert.equal(fashion.billableWeight, .35);
  assert.equal(fashion.rate, 650);
  assert.equal(fashion.shipping, 228);
  const uk = P.importQuote({ origin: 'UK', priceBDT: 100, weight: .35, quantity: 1 });
  assert.equal(uk.shipping, 368);
  const usa = P.importQuote({ origin: 'USA', priceBDT: 100, weight: .69, quantity: 1 });
  assert.equal(usa.shipping, 794);
});

test('legacy cart migration and multiple SKU persistence restore trusted labels and historical snapshots', () => {
  const seed = { products: fixture(), orders: [] };
  globalThis.localStorage = storage();
  globalThis.localStorage.setItem('bongobridge-demo-v1', JSON.stringify({ orders: [], cart: [{ productId: 'P001', quantity: 4 }] }));
  let state = BB.load(seed);
  assert.deepEqual(state.cart, [{ productId: 'P001', variantId: 'black', sizeId: 'standard', quantity: 4 }]);
  state.cart = C.addLines(seed.products, state.cart, [{ productId: 'P001', variantId: 'white', sizeId: 'large', quantity: 6 }]);
  const quoted = C.quoteCart(seed.products, state.cart, { city: 'Sylhet' });
  for (const line of quoted.lines) {
    const order = BB.makeOrder({ ...line.product, product: line.product, variantId: line.variantId, sizeId: line.sizeId, quantity: line.quantity, groupQuantity: line.groupQuantity, itemUnitBDT: line.unitBDT, baseUnitBDT: line.baseUnitBDT, bulkDiscount: line.discount, localDeliveryBDT: line.quote.delivery, city: 'Sylhet', orders: state.orders });
    state.orders.push(order);
  }
  assert.equal(state.orders.reduce((s, o) => s + o.amount, 0), quoted.totals.total);
  assert.equal(state.orders[1].localDeliveryBDT, 0);
  state.orders[1].variantLabel = '<img src=x onerror=alert(1)>';
  state.orders[1].sizeLabel = 'Untrusted label';
  assert.equal(BB.save(state), true);
  const restored = BB.load(seed);
  assert.equal(restored.cart.length, 2);
  assert.equal(restored.orders[1].variantLabel, 'White');
  assert.equal(restored.orders[1].sizeLabel, 'Large');
  assert.equal(restored.orders[1].itemUnitBDT, 1235);
  assert.equal(restored.orders[1].bulkDiscount, 5);
  assert.equal(restored.orders[1].groupQuantity, 10);
  assert.throws(() => BB.makeOrder({ ...seed.products[0], product: seed.products[0], quantity: 10, groupQuantity: 10, itemUnitBDT: 1, orders: [] }), RangeError);
  assert.throws(() => BB.makeOrder({ ...seed.products[0], product: seed.products[0], quantity: 1, localDeliveryBDT: 81, orders: [] }), RangeError);
});

test('recommendations prioritize family, exclude the current product and remain bounded', () => {
  const products = fixture();
  assert.deepEqual(C.recommendations(products, 'P001', 2).map(p => p.id), ['P002', 'P003']);
  assert.equal(C.recommendations(products, 'P001', 0).length, 0);
  assert.throws(() => C.recommendations(products, 'P001', 2.5), RangeError);
});

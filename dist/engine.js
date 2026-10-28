(function (root, factory) {
  'use strict';
  var api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BB = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  // Every rate in this teaching model is invented; no live services are called.
  const KEY = 'bongobridge-demo-v1';
  const statuses = Object.freeze(['Request received', 'Purchased', 'At origin hub', 'In transit', 'Customs simulation', 'Delivered']);
  const cities = Object.freeze(['Dhaka', 'Chattogram', 'Sylhet', 'Khulna', 'Rajshahi', 'Barishal', 'Rangpur', 'Mymensingh']);
  const lanes = Object.freeze({
    China: Object.freeze({ air: 750, sea: 280, days: '8–12', hub: 'Guangzhou', code: 'CN' }),
    USA: Object.freeze({ air: 1150, sea: 450, days: '12–18', hub: 'New Jersey', code: 'US' }),
    UK: Object.freeze({ air: 1050, sea: 400, days: '10–15', hub: 'London', code: 'GB' }),
    India: Object.freeze({ air: 600, sea: 240, days: '5–8', hub: 'Kolkata', code: 'IN' })
  });
  let products = new Map();

  function numeric(value, label, min, max, integer) {
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !value.trim())) {
      throw new RangeError(label + ' must be a number.');
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < min || parsed > max || (integer && !Number.isInteger(parsed))) {
      throw new RangeError(label + ' is outside the demo range.');
    }
    return parsed;
  }

  function estimate(input) {
    if (!input || typeof input !== 'object') throw new TypeError('A demo estimate is required.');
    const origin = input.origin;
    const city = input.city === undefined ? 'Dhaka' : input.city;
    const mode = input.mode === undefined ? 'air' : input.mode;
    if (!Object.prototype.hasOwnProperty.call(lanes, origin)) throw new RangeError('Choose a source market.');
    if (!cities.includes(city)) throw new RangeError('Choose a demo destination city.');
    if (!['air', 'sea'].includes(mode)) throw new RangeError('Choose air or sea freight.');
    const price = numeric(input.price, 'Item price', 0, 100000, false);
    const weight = numeric(input.weight, 'Item weight', Number.MIN_VALUE, 1000, false);
    const quantity = numeric(input.quantity === undefined ? 1 : input.quantity, 'Quantity', 1, 20, true);
    const items = Math.round(price * quantity * 120);
    const billableWeight = Math.max(0.5, Math.ceil(weight * quantity * 2) / 2);
    const rate = lanes[origin][mode];
    const shipping = Math.round(billableWeight * rate);
    const service = Math.round(items * 0.05);
    const duties = Math.round(items * 0.15);
    const delivery = city === 'Dhaka' ? 80 : 150;
    const total = items + shipping + service + duties + delivery;
    const days = mode === 'air' ? lanes[origin].days : origin === 'India' ? '12–18' : '25–40';
    return { items, shipping, service, duties, delivery, total, billableWeight, rate, days };
  }

  function knownProduct(productId) {
    return typeof productId === 'string' ? products.get(productId) : undefined;
  }

  function cleanOrder(value) {
    if (!value || typeof value !== 'object') return null;
    const product = knownProduct(value.productId);
    if (!product && value.productId !== 'PROXY') return null;
    if (typeof value.id !== 'string' || !/^BB-DEMO-\d{4,9}$/.test(value.id)) return null;
    if (!cities.includes(value.city) || !Number.isInteger(value.statusIndex) || value.statusIndex < 0 || value.statusIndex >= statuses.length) return null;
    if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 20) return null;
    if (!Number.isFinite(value.amount) || value.amount < 0 || value.amount > 1000000000) return null;
    if (typeof value.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt))) return null;
    const origin = Object.prototype.hasOwnProperty.call(lanes, value.origin) ? value.origin : product ? product.origin : 'China';
    const mode = value.mode === 'sea' ? 'sea' : 'air';
    // Restore display labels from trusted presets, never from browser-edited text.
    const customer = /^Demo shopper [A-F]$/.test(value.customer) ? value.customer : 'Demo Shopper';
    return {
      id: value.id, productId: product ? product.id : 'PROXY',
      productName: product ? product.name : 'Sample proxy request', customer,
      city: value.city, statusIndex: value.statusIndex, quantity: value.quantity,
      createdAt: value.createdAt, amount: value.amount, origin, mode
    };
  }

  function cleanState(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.orders) || !Array.isArray(value.cart)) return null;
    if (value.orders.length > 1000 || value.cart.length > 100) return null;
    const orders = value.orders.map(cleanOrder);
    if (orders.some(order => !order)) return null;
    if (new Set(orders.map(order => order.id)).size !== orders.length) return null;
    const cart = [];
    for (const entry of value.cart) {
      if (!entry || !knownProduct(entry.productId) || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 20 || cart.some(item => item.productId === entry.productId)) return null;
      cart.push({ productId: entry.productId, quantity: entry.quantity });
    }
    return { orders, cart };
  }

  function defaults(seed) {
    products = new Map((Array.isArray(seed && seed.products) ? seed.products : []).map(product => [product.id, product]));
    return { orders: (Array.isArray(seed && seed.orders) ? seed.orders : []).map(cleanOrder).filter(Boolean), cart: [] };
  }

  function load(seed) {
    const fresh = defaults(seed);
    try {
      const raw = root.localStorage && root.localStorage.getItem(KEY);
      if (!raw) return fresh;
      return cleanState(JSON.parse(raw)) || fresh;
    } catch (_) {
      return fresh;
    }
  }

  function save(state) {
    try {
      const clean = cleanState(state);
      if (!clean || !root.localStorage) return false;
      root.localStorage.setItem(KEY, JSON.stringify(clean));
      return true;
    } catch (_) {
      return false;
    }
  }

  function reset(seed) {
    try { if (root.localStorage) root.localStorage.removeItem(KEY); } catch (_) { /* Private browsing may block storage. */ }
    return defaults(seed);
  }

  function makeOrder(input) {
    if (!input || typeof input !== 'object') throw new TypeError('A demo order is required.');
    const quote = estimate(input);
    const product = input.product && knownProduct(input.product.id);
    const orders = Array.isArray(input.orders) ? input.orders : [];
    let highest = 1046;
    orders.forEach(order => {
      const match = order && typeof order.id === 'string' && /^BB-DEMO-(\d{4,9})$/.exec(order.id);
      if (match) highest = Math.max(highest, Number(match[1]));
    });
    if (highest >= 999999999) throw new RangeError('Reset the demo before creating another order.');
    return {
      id: 'BB-DEMO-' + (highest + 1),
      productId: product ? product.id : 'PROXY',
      productName: product ? product.name : 'Sample proxy request',
      customer: 'Demo Shopper', city: input.city === undefined ? 'Dhaka' : input.city,
      statusIndex: 0, quantity: Number(input.quantity === undefined ? 1 : input.quantity),
      createdAt: new Date().toISOString(), amount: quote.total,
      origin: input.origin, mode: input.mode === undefined ? 'air' : input.mode
    };
  }

  return Object.freeze({ statuses, cities, lanes, estimate, load, save, reset, makeOrder });
});

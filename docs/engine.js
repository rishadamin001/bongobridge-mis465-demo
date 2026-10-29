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
    const pricing = root.BongoPricing || (typeof require === 'function' ? require('./modules/pricing.js') : null);
    return pricing.importQuote(input);
  }

  function commerce() {
    return root.BongoCommerce || (typeof require === 'function' ? require('./modules/commerce.js') : null);
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
    if (!Number.isInteger(value.quantity) || value.quantity < 1 || value.quantity > 500) return null;
    if (!Number.isFinite(value.amount) || value.amount < 0 || value.amount > 1000000000000) return null;
    if (typeof value.createdAt !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}\.\d{3}Z)?$/.test(value.createdAt) || !Number.isFinite(Date.parse(value.createdAt))) return null;
    const origin = Object.prototype.hasOwnProperty.call(lanes, value.origin) ? value.origin : product ? product.origin : 'China';
    const mode = value.mode === 'sea' ? 'sea' : 'air';
    // Restore display labels from trusted presets, never from browser-edited text.
    const customer = /^Demo shopper [A-F]$/.test(value.customer) ? value.customer : 'Demo Shopper';
    let selection;
    try {
      selection = product ? commerce().resolve(product, value) : { variantId: 'default', sizeId: 'default', variant: { label: 'Original' }, size: { label: 'One size' } };
    } catch (_) { return null; }
    for (const field of ['advance', 'balance']) if (value[field] !== undefined && value[field] !== null && (!Number.isFinite(value[field]) || value[field] < 0 || value[field] > 1000000000000)) return null;
    for (const field of ['baseUnitBDT', 'itemUnitBDT']) if (value[field] !== undefined && value[field] !== null && (!Number.isFinite(value[field]) || value[field] < 0 || value[field] > 12000000)) return null;
    const groupQuantity = value.groupQuantity === undefined ? value.quantity : value.groupQuantity;
    if (!Number.isInteger(groupQuantity) || groupQuantity < value.quantity || groupQuantity > 500) return null;
    const bulkDiscount = value.bulkDiscount === undefined ? 0 : value.bulkDiscount;
    if (!Number.isFinite(bulkDiscount) || bulkDiscount < 0 || bulkDiscount > 100) return null;
    const tierMin = value.tierMin === undefined ? 1 : value.tierMin;
    if (!Number.isInteger(tierMin) || tierMin < 1 || tierMin > Math.max(1, groupQuantity)) return null;
    const localDeliveryBDT = value.localDeliveryBDT === undefined ? null : value.localDeliveryBDT;
    if (localDeliveryBDT !== null && localDeliveryBDT !== 0 && localDeliveryBDT !== (value.city === 'Dhaka' ? 80 : 150)) return null;
    return {
      id: value.id, productId: product ? product.id : 'PROXY',
      productName: product ? product.name : 'Sample proxy request', customer,
      city: value.city, statusIndex: value.statusIndex, quantity: value.quantity,
      createdAt: value.createdAt, amount: value.amount, origin, mode,
      advance: Number.isFinite(value.advance) ? value.advance : null,
      balance: Number.isFinite(value.balance) ? value.balance : null,
      paymentRef: typeof value.paymentRef === 'string' && /^BB-PAY-DEMO-[A-Z0-9-]+$/.test(value.paymentRef) ? value.paymentRef : null,
      paymentMethod: ['card','bkash','nagad','rocket','bank'].includes(value.paymentMethod) ? value.paymentMethod : null,
      variantId: selection.variantId, sizeId: selection.sizeId,
      variantLabel: selection.variant.label, sizeLabel: selection.size.label,
      groupQuantity, bulkDiscount, tierMin, localDeliveryBDT,
      baseUnitBDT: Number.isFinite(value.baseUnitBDT) ? value.baseUnitBDT : null,
      itemUnitBDT: Number.isFinite(value.itemUnitBDT) ? value.itemUnitBDT : null
    };
  }

  function cleanState(value) {
    if (!value || typeof value !== 'object' || !Array.isArray(value.orders) || !Array.isArray(value.cart)) return null;
    if (value.orders.length > 1000 || value.cart.length > 2000) return null;
    const orders = value.orders.map(cleanOrder);
    if (orders.some(order => !order)) return null;
    if (new Set(orders.map(order => order.id)).size !== orders.length) return null;
    let cart;
    try { cart = commerce().addLines([...products.values()], [], value.cart); } catch (_) { return null; }
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
    const product = input.product && knownProduct(input.product.id);
    const quantity = numeric(input.quantity === undefined ? 1 : input.quantity, 'Quantity', 1, 500, true);
    const selection = product ? commerce().resolve(product, input) : { variantId: 'default', sizeId: 'default', variant: { label: 'Original' }, size: { label: 'One size', weightMultiplier: 1 }, baseUnitBDT: null };
    const groupQuantity = numeric(input.groupQuantity === undefined ? quantity : input.groupQuantity, 'Grouped quantity', quantity, 500, true);
    const bulk = product ? commerce().tier(product, groupQuantity) : { min: 1, discount: 0 };
    const hasSnapshot = product && (input.groupQuantity !== undefined || input.itemUnitBDT !== undefined || input.bulkDiscount !== undefined || input.baseUnitBDT !== undefined);
    let itemUnitBDT = null;
    if (hasSnapshot) {
      itemUnitBDT = Math.round(selection.baseUnitBDT * (100 - bulk.discount) / 100);
      if (input.itemUnitBDT !== undefined && numeric(input.itemUnitBDT, 'Unit price', 0, 12000000, true) !== itemUnitBDT) throw new RangeError('Refresh this sample bulk quote before checkout.');
      if (input.bulkDiscount !== undefined && Number(input.bulkDiscount) !== bulk.discount) throw new RangeError('Refresh this sample bulk discount before checkout.');
    }
    const quote = estimate(hasSnapshot ? { ...input, priceBDT: itemUnitBDT, weight: Number(product.weight) * selection.size.weightMultiplier } : input);
    if (input.localDeliveryBDT !== undefined) {
      const delivery = numeric(input.localDeliveryBDT, 'Local delivery', 0, 150, true);
      if (delivery !== 0 && delivery !== quote.delivery) throw new RangeError('Use the displayed sample local delivery amount.');
      quote.total += delivery - quote.delivery;
      quote.balance += delivery - quote.delivery;
      quote.delivery = delivery;
    }
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
      statusIndex: 0, quantity,
      createdAt: new Date().toISOString(), amount: quote.total,
      origin: input.origin, mode: input.mode === undefined ? 'air' : input.mode,
      advance: quote.advance, balance: quote.balance,
      paymentRef: input.paymentRef || null, paymentMethod: input.paymentMethod || null,
      variantId: selection.variantId, sizeId: selection.sizeId,
      variantLabel: selection.variant.label, sizeLabel: selection.size.label,
      baseUnitBDT: hasSnapshot ? selection.baseUnitBDT : null,
      itemUnitBDT, groupQuantity, bulkDiscount: hasSnapshot ? bulk.discount : 0,
      tierMin: hasSnapshot ? bulk.min : 1, localDeliveryBDT: quote.delivery
    };
  }

  return Object.freeze({ statuses, cities, lanes, estimate, load, save, reset, makeOrder });
});

/* Bulk/SKU calculations for the classroom catalog. No stock or prices are live. */
(function (root, factory) {
  const pricing = root.BongoPricing || (typeof require === 'function' ? require('./pricing.js') : null);
  const api = factory(pricing);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.BongoCommerce = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (P) {
  'use strict';
  const MAX_QUANTITY = 500;
  const defaultTiers = Object.freeze([{ min: 1, discount: 0 }, { min: 10, discount: 5 }, { min: 50, discount: 10 }, { min: 100, discount: 15 }]);
  const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

  function validId(value, label) {
    if (typeof value !== 'string' || !idPattern.test(value)) throw new RangeError('Choose a valid ' + label + '.');
    return value;
  }
  function finite(value, label, min = 0, max = 12000000) {
    if ((typeof value !== 'number' && typeof value !== 'string') || String(value).trim() === '' || !Number.isFinite(Number(value)) || Number(value) < min || Number(value) > max) throw new RangeError('Enter a valid ' + label + '.');
    return Number(value);
  }
  function count(value, allowZero = false) {
    const n = finite(value, 'quantity', allowZero ? 0 : 1, MAX_QUANTITY);
    if (!Number.isInteger(n)) throw new RangeError('Quantity must be a whole number.');
    return n;
  }
  function catalogMap(products) {
    if (!Array.isArray(products)) throw new TypeError('A generated catalog is required.');
    const map = new Map();
    for (const p of products) {
      if (!p || map.has(p.id)) throw new RangeError('Catalog product IDs must be unique.');
      validId(p.id, 'product');
      map.set(p.id, p);
    }
    return map;
  }
  function choices(product, name, fallback) {
    if (product[name] === undefined || (Array.isArray(product[name]) && product[name].length === 0)) return [fallback];
    if (!Array.isArray(product[name])) throw new RangeError('Invalid catalog ' + name + '.');
    const ids = new Set();
    return product[name].map(entry => {
      if (!entry || ids.has(entry.id)) throw new RangeError('Catalog option IDs must be unique.');
      validId(entry.id, name === 'variants' ? 'variation' : 'size');
      ids.add(entry.id);
      if (typeof entry.label !== 'string' || !entry.label.trim() || entry.label.length > 100) throw new RangeError('A catalog option label is required.');
      return { ...entry, priceDeltaBDT: finite(entry.priceDeltaBDT ?? 0, 'option price', -12000000, 12000000) };
    });
  }
  function resolve(product, selection = {}) {
    if (!product || typeof product !== 'object') throw new TypeError('A generated product is required.');
    validId(product.id, 'product');
    if (!selection || typeof selection !== 'object') throw new TypeError('A product selection is required.');
    const variants = choices(product, 'variants', { id: 'default', label: 'Original', image: product.image, imageAlt: product.imageAlt || product.name, priceDeltaBDT: 0 });
    const sizes = choices(product, 'sizes', { id: 'default', label: 'One size', priceDeltaBDT: 0, weightMultiplier: 1 });
    const variantId = selection.variantId === undefined ? variants[0].id : validId(selection.variantId, 'variation');
    const sizeId = selection.sizeId === undefined ? sizes[0].id : validId(selection.sizeId, 'size');
    const variant = variants.find(v => v.id === variantId);
    const chosenSize = sizes.find(s => s.id === sizeId);
    if (!variant || !chosenSize) throw new RangeError('That variation or size is not available in this demo.');
    const size = { ...chosenSize, weightMultiplier: finite(chosenSize.weightMultiplier ?? 1, 'size weight multiplier', 0.01, 100) };
    const price = product.priceBDT === undefined ? finite(product.price, 'item price', 0, 100000) * 120 : finite(product.priceBDT, 'item price');
    const baseUnitBDT = Math.round(price + variant.priceDeltaBDT + size.priceDeltaBDT);
    if (baseUnitBDT < 0 || baseUnitBDT > 12000000) throw new RangeError('Catalog option price is outside the classroom range.');
    return { variant, size, variantId, sizeId, label: variant.label + ' · ' + size.label, image: variant.image || product.image, imageAlt: variant.imageAlt || product.imageAlt || product.name, baseUnitBDT };
  }
  function lineKey(line) {
    if (!line || typeof line !== 'object') throw new TypeError('A cart line is required.');
    return validId(line.productId, 'product') + '|' + validId(line.variantId ?? 'default', 'variation') + '|' + validId(line.sizeId ?? 'default', 'size');
  }
  function tier(product, totalQuantity) {
    const qty = count(totalQuantity, true);
    const source = product && product.bulkTiers !== undefined ? product.bulkTiers : defaultTiers;
    if (!Array.isArray(source) || !source.length) throw new RangeError('A bulk price schedule is required.');
    const tiers = source.map(t => {
      if (!t) throw new RangeError('Invalid bulk price schedule.');
      return { min: count(t.min), discount: finite(t.discount, 'bulk discount', 0, 100) };
    }).sort((a, b) => a.min - b.min);
    if (tiers[0].min !== 1) tiers.unshift({ min: 1, discount: 0 });
    for (let i = 1; i < tiers.length; i++) if (tiers[i].min === tiers[i - 1].min || tiers[i].discount < tiers[i - 1].discount) throw new RangeError('Bulk thresholds must be unique with nondecreasing discounts.');
    let selected = tiers[0];
    for (const t of tiers) if (qty >= t.min) selected = t;
    return { min: selected.min, discount: selected.discount, nextMin: tiers.find(t => t.min > qty)?.min ?? null };
  }
  function addLines(products, cart, newLines) {
    if (!Array.isArray(cart) || !Array.isArray(newLines) || cart.length + newLines.length > 4000) throw new RangeError('Use a valid classroom cart.');
    const catalog = catalogMap(products), merged = new Map(), productTotals = new Map();
    for (const raw of [...cart, ...newLines]) {
      if (!raw || typeof raw !== 'object') throw new RangeError('Choose a valid catalog item.');
      const p = catalog.get(raw.productId);
      if (!p) throw new RangeError('That product is not in the generated catalog.');
      const selected = resolve(p, raw), quantity = count(raw.quantity);
      const line = { productId: p.id, variantId: selected.variantId, sizeId: selected.sizeId, quantity };
      const key = lineKey(line), current = merged.get(key);
      if (current) current.quantity += quantity;
      else merged.set(key, line);
      const skuQty = merged.get(key).quantity;
      const skuStock = p.stockPerSku === undefined ? MAX_QUANTITY : count(p.stockPerSku, true);
      if (skuQty > skuStock) throw new RangeError('This sample variation has a limit of ' + skuStock + ' units.');
      const total = (productTotals.get(p.id) || 0) + quantity;
      if (total > MAX_QUANTITY) throw new RangeError('The classroom bulk limit is 500 units per product across all variations and sizes.');
      productTotals.set(p.id, total);
    }
    return [...merged.values()].map(line => ({ ...line }));
  }
  function quoteCart(products, cart, options = {}) {
    const normalized = addLines(products, [], cart), catalog = catalogMap(products), groups = new Map();
    normalized.forEach(line => groups.set(line.productId, (groups.get(line.productId) || 0) + line.quantity));
    const totals = { items: 0, shipping: 0, delivery: 0, total: 0, advance: 0, balance: 0, savings: 0 };
    const deliveryAssigned = new Set();
    const lines = normalized.map(line => {
      const product = catalog.get(line.productId), selected = resolve(product, line), groupQuantity = groups.get(product.id), bulk = tier(product, groupQuantity);
      const unitBDT = Math.round(selected.baseUnitBDT * (100 - bulk.discount) / 100);
      const quote = P.importQuote({ ...product, priceBDT: unitBDT, weight: Number(product.weight) * selected.size.weightMultiplier, quantity: line.quantity, city: options.city || 'Dhaka', mode: options.mode || 'air' });
      if (deliveryAssigned.has(product.id)) {
        quote.total -= quote.delivery;
        quote.balance -= quote.delivery;
        quote.delivery = 0;
        quote.localDeliveryShared = true;
      } else deliveryAssigned.add(product.id);
      for (const key of ['items', 'shipping', 'delivery', 'total', 'advance', 'balance']) totals[key] += quote[key];
      totals.savings += (selected.baseUnitBDT - unitBDT) * line.quantity;
      return { ...line, product, ...selected, unitBDT, discount: bulk.discount, groupQuantity, tierMin: bulk.min, nextMin: bulk.nextMin, quote };
    });
    return { lines, totals, quantity: normalized.reduce((sum, line) => sum + line.quantity, 0) };
  }
  function recommendations(products, productId, limit = 4) {
    const catalog = catalogMap(products), p = catalog.get(productId);
    const n = finite(limit, 'suggestion count', 0, 20);
    if (!Number.isInteger(n)) throw new RangeError('Suggestion count must be a whole number.');
    if (!p) return products.slice(0, n);
    return products.filter(x => x.id !== p.id).map((x, i) => ({ p: x, rank: p.family && x.family === p.family ? 0 : x.category === p.category ? 1 : (x.origin === p.origin ? 2 : 3), i })).sort((a, b) => a.rank - b.rank || a.i - b.i).slice(0, n).map(x => x.p);
  }
  return Object.freeze({ MAX_QUANTITY, defaultTiers, resolve, lineKey, tier, addLines, quoteCart, recommendations });
});

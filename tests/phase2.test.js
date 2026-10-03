const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const store = require('../utils/data-store');
const diary = require('../utils/diary-store');
const { calculateCustomDrinkCalories } = require('../utils/calculator');

function loadPage(relativePath) {
  let definition;
  const previousPage = global.Page;
  global.Page = (page) => { definition = page; };
  const file = path.join(__dirname, '..', relativePath);
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.Page = previousPage; }
  return {
    ...definition,
    data: structuredClone(definition.data || {}),
    setData(patch) { Object.assign(this.data, patch); }
  };
}

function setup() {
  const values = new Map();
  const navigation = [];
  const app = { globalData: {} };
  global.getApp = () => app;
  global.wx = {
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
    navigateTo: ({ url }) => navigation.push(url),
    switchTab: ({ url }) => navigation.push(url),
    showToast() {}
  };
  return { navigation, app };
}

test('search finds drinks by name, alias, brand and tag, and ignores empty queries', () => {
  assert.deepEqual(store.searchDrinks(''), []);
  assert.deepEqual(store.searchDrinks('   '), []);
  const first = store.getBrands()[0];
  const byBrand = store.searchDrinks(first.name);
  assert.ok(byBrand.length > 0);
  assert.ok(byBrand.every(({ brand }) => brand && brand.name.toLowerCase().includes(first.name.toLowerCase())));
  const drink = store.getDrinksByBrandId(first.id)[0];
  const byName = store.searchDrinks(drink.displayName);
  assert.equal(byName[0].drink.id, drink.id);
  assert.deepEqual(store.searchDrinks('zzzz-no-such-drink'), []);
  assert.ok(store.searchDrinks(drink.displayName, 1).length <= 1);
});

test('record tab search lists matches with calories and opens the drink for the chosen date', () => {
  const { navigation } = setup();
  const record = loadPage('pages/record/record.js');
  record.onLoad();
  record.setDate('2026-09-28');
  const drink = store.getDrinksByBrandId(store.getBrands()[0].id)[0];
  record.onSearchInput({ detail: { value: drink.displayName } });
  assert.equal(record.data.query, drink.displayName);
  assert.equal(record.data.searchResults[0].id, drink.id);
  assert.equal(record.data.searchResults[0].calories, store.getDefaultCalories(drink));
  record.openSearchResult({ currentTarget: { dataset: { id: drink.id } } });
  assert.equal(navigation.at(-1), `/pages/drinks/drinks?brandId=${drink.brandId}&drinkId=${drink.id}&recordDate=2026-09-28`);
  record.clearSearch();
  assert.equal(record.data.query, '');
  assert.deepEqual(record.data.searchResults, []);
});

test('drink sheet recalculates the live calories on every change', () => {
  setup();
  const brand = store.getBrands().find((item) => store.getDrinksByBrandId(item.id).some((d) => d.availableSizes.length > 1));
  const drink = store.getDrinksByBrandId(brand.id).find((item) => item.availableSizes.length > 1);
  const page = loadPage('pages/drinks/drinks.js');
  page.onLoad({ brandId: brand.id, drinkId: drink.id });
  assert.equal(page.data.liveCalories, store.getDefaultCalories(drink));
  const base = page.data.liveCalories;

  page.toggleExtraTopping({ currentTarget: { dataset: { id: store.toppings[0].id } } });
  assert.equal(page.data.liveCalories, base + store.toppings[0].calories);
  page.toggleExtraTopping({ currentTarget: { dataset: { id: store.toppings[0].id } } });
  assert.equal(page.data.liveCalories, base);

  const otherSize = drink.availableSizes.find((id) => id !== drink.defaultSize);
  page.selectSize({ currentTarget: { dataset: { id: otherSize } } });
  assert.notEqual(page.data.liveCalories, base);

  page.closePanel();
  assert.equal(page.data.liveCalories, 0);
});

test('drink sheet saves straight to the calendar on the chosen date without the result page', () => {
  const { navigation, app } = setup();
  const brand = store.getBrands()[0];
  const drink = store.getDrinksByBrandId(brand.id)[0];
  const page = loadPage('pages/drinks/drinks.js');
  page.onLoad({ brandId: brand.id, drinkId: drink.id, recordDate: '2026-09-17' });
  assert.equal(page.data.recordDateLabel, '9月17日');
  page.saveNow();
  assert.equal(navigation.at(-1), '/pages/home/home');
  assert.equal(app.globalData.focusDate, '2026-09-17');
  const saved = diary.getRecords().find((record) => record.id === app.globalData.focusRecordId);
  assert.equal(saved.date, '2026-09-17');
  assert.equal(saved.calories, store.getDefaultCalories(drink));
  assert.equal(saved.config.drinkId, drink.id);
});

test('custom builder keeps the live calories in step with the calculator and can save directly', () => {
  const { navigation, app } = setup();
  const page = loadPage('pages/custom/custom.js');
  page.onLoad({ recordDate: '2026-09-17' });
  const expected = () => calculateCustomDrinkCalories({
    base: store.getBaseById(page.data.selectedBaseId),
    size: store.getCupSizeById(page.data.selectedSizeId),
    sweetness: store.getSweetnessById(page.data.selectedSweetnessId),
    toppings: store.getToppingsByIds(page.data.selectedToppingIds)
  });
  assert.equal(page.data.liveCalories, expected());
  assert.ok(page.data.liveCalories > 0);

  page.toggleTopping({ currentTarget: { dataset: { id: store.toppings[0].id } } });
  assert.equal(page.data.liveCalories, expected());
  page.selectSize({ currentTarget: { dataset: { id: store.cupSizes[store.cupSizes.length - 1].id } } });
  assert.equal(page.data.liveCalories, expected());
  page.selectSweetness({ currentTarget: { dataset: { id: store.sweetnessLevels[0].id } } });
  assert.equal(page.data.liveCalories, expected());

  page.calculate();
  assert.match(navigation.at(-1), /^\/pages\/result\/result\?payload=/);
  page.saveNow();
  assert.equal(navigation.at(-1), '/pages/home/home');
  const saved = diary.getRecords().find((record) => record.id === app.globalData.focusRecordId);
  assert.equal(saved.mode, 'custom');
  assert.equal(saved.date, '2026-09-17');
  assert.equal(saved.calories, page.data.liveCalories);
});

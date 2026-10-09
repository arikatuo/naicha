const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = require('../utils/data-store');
const { getDrinkIcon } = require('../utils/drink-icons');
const { buildEquivalentCards, rankEquivalentCards } = require('../utils/equivalents');
const original = require('./fixtures/original-data.json');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const allDrinks = () => store.getBrands().flatMap((brand) => store.getDrinksByBrandId(brand.id));

function loadPage(relativePath) {
  let definition;
  const previousPage = global.Page;
  global.Page = (page) => { definition = page; };
  const file = path.join(root, relativePath);
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.Page = previousPage; }
  return { ...definition, data: structuredClone(definition.data || {}), setData(patch) { Object.assign(this.data, patch); } };
}

function setupWx() {
  const values = new Map();
  global.getApp = () => ({ globalData: {} });
  global.wx = {
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
    navigateTo() {},
    switchTab() {},
    setNavigationBarTitle() {}
  };
}

test('every original drink keeps its id, brand and calories after the expansion', () => {
  for (const old of original.drinks) {
    const now = store.getDrinkById(old.id);
    assert.ok(now, `${old.id} is still there`);
    assert.equal(now.brandId, old.brandId);
    assert.equal(now.displayName, old.displayName);
    assert.equal(now.baseCalories, old.baseCalories);
    assert.deepEqual(now.sizeCalories, old.sizeCalories);
    assert.equal(now.defaultSize, old.defaultSize);
    assert.deepEqual(now.tagIds, old.tagIds);
  }
  for (const old of original.toppings) {
    const now = store.getToppingById(old.id);
    assert.ok(now, old.id);
    assert.equal(now.calories, old.calories);
  }
});

test('expanded data is consistent: unique ids, valid references, sane calories', () => {
  const drinks = allDrinks();
  assert.ok(drinks.length >= 250, `drinks: ${drinks.length}`);
  assert.equal(new Set(drinks.map((drink) => drink.id)).size, drinks.length);
  assert.equal(store.getBrands().length, 28);
  const sizeIds = store.cupSizes.map((size) => size.id);
  for (const drink of drinks) {
    assert.ok(store.getBrandById(drink.brandId), drink.id);
    assert.ok(drink.displayName && drink.displayName.length <= 16, `${drink.id}: ${drink.displayName}`);
    assert.ok(Number.isFinite(drink.baseCalories) && drink.baseCalories >= 0 && drink.baseCalories <= 1000, drink.id);
    assert.ok(drink.availableSizes.every((id) => sizeIds.includes(id)), drink.id);
    assert.ok(drink.availableSizes.includes(drink.defaultSize), drink.id);
    assert.ok(drink.tagIds.length >= 1 && drink.tagIds.every((id) => store.getTagById(id)), drink.id);
    assert.ok((drink.defaultToppingIds || []).every((id) => store.getToppingById(id)), drink.id);
    assert.ok(Number.isFinite(store.getDefaultCalories(drink)), drink.id);
  }
  const names = new Map();
  for (const drink of drinks) {
    const key = `${drink.brandId}:${drink.displayName}`;
    assert.ok(!names.has(key), `duplicate name in one brand: ${key}`);
    names.set(key, 1);
  }
});

test('new drinks show the Excel calories as the default cup', () => {
  const luckin = store.getDrinksByBrandId('luckin');
  assert.equal(luckin.length, 8);
  const latte = luckin.find((drink) => drink.displayName === '生椰拿铁');
  assert.equal(store.getDefaultCalories(latte), 179);
  const hushang = store.getDrinksByBrandId('hushang').find((drink) => drink.displayName === 'Zhen珠奶茶');
  assert.equal(store.getDefaultCalories(hushang), 400);
});

test('brands carry a category, coffee brands only have coffee drinks and coffee has no sweetness choice', () => {
  const brands = store.getBrands();
  assert.ok(brands.every((brand) => brand.category === 'tea' || brand.category === 'coffee'));
  assert.equal(brands.filter((brand) => brand.category === 'coffee').length, 8);
  assert.equal(brands.filter((brand) => brand.category === 'tea').length, 20);
  for (const brand of brands.filter((item) => item.category === 'coffee')) {
    for (const drink of store.getDrinksByBrandId(brand.id)) {
      assert.ok(drink.tagIds.includes('coffee'), drink.id);
      assert.equal(drink.sweetnessAdjustable, false, drink.id);
    }
  }
  assert.equal(new Set(brands.map((brand) => brand.subtitle)).size, brands.length);
});

test('toppings are scoped: coffee extras only for coffee, tea toppings never for coffee', () => {
  const tea = store.getToppingsForScope('tea').map((topping) => topping.id);
  const coffee = store.getToppingsForScope('coffee').map((topping) => topping.id);
  const everything = store.getToppingsForScope('all').map((topping) => topping.id);
  assert.ok(tea.includes('pearl') && tea.includes('brown-pearl') && tea.includes('cold-foam'));
  assert.ok(!tea.includes('extra-shot') && !tea.includes('oat-milk'));
  assert.deepEqual(coffee.sort(), ['caramel-sauce', 'extra-shot', 'mocha-sauce', 'oat-milk', 'syrup', 'whipped-cream']);
  assert.equal(everything.length, store.toppings.length);

  setupWx();
  const coffeePage = loadPage('pages/drinks/drinks.js');
  coffeePage.onLoad({ brandId: 'starbucks' });
  assert.ok(coffeePage.data.visibleDrinks.length >= 8);
  const latte = coffeePage.data.visibleDrinks[1];
  coffeePage.openDrinkById(latte.id);
  assert.deepEqual(coffeePage.data.toppingOptions.map((topping) => topping.id).sort(), coffee);

  const teaPage = loadPage('pages/drinks/drinks.js');
  teaPage.onLoad({ brandId: 'hushang' });
  teaPage.openDrinkById(teaPage.data.visibleDrinks[0].id);
  assert.ok(teaPage.data.toppingOptions.every((topping) => topping.scope !== 'coffee'));
  assert.equal(teaPage.data.toppingOptions.length, tea.length);
});

test('custom builder: coffee bases hide sweetness and only offer coffee extras; tea bases the opposite', () => {
  setupWx();
  const page = loadPage('pages/custom/custom.js');
  page.onLoad({});
  assert.equal(page.data.sweetnessVisible, true);
  assert.equal(page.data.toppingStep, 4);
  assert.ok(page.data.toppingOptions.every((topping) => topping.scope !== 'coffee'));
  assert.deepEqual(page.data.teaBases.map((base) => base.id), ['milk-tea', 'fruit-tea', 'lemon-tea', 'latte', 'coconut', 'pure-tea', 'cheese-tea']);
  assert.deepEqual(page.data.coffeeBases.map((base) => base.id), ['coffee-latte', 'americano']);

  page.selectSweetness({ currentTarget: { dataset: { id: 'normal' } } });
  page.selectBase({ currentTarget: { dataset: { id: 'coffee-latte' } } });
  assert.equal(page.data.sweetnessVisible, false);
  assert.equal(page.data.toppingStep, 3);
  assert.equal(page.data.selectedSweetnessId, 'half', 'a coffee base resets sweetness so it cannot change the calories');
  assert.deepEqual(page.data.toppingOptions.map((topping) => topping.id).sort(), ['caramel-sauce', 'extra-shot', 'mocha-sauce', 'oat-milk', 'syrup', 'whipped-cream']);
  assert.equal(page.data.canCollapseToppings, false);
  assert.equal(page.data.liveCalories, 190);

  page.toggleTopping({ currentTarget: { dataset: { id: 'oat-milk' } } });
  assert.deepEqual(page.data.selectedToppingIds, ['oat-milk']);
  assert.equal(page.data.liveCalories, 190 + 61);
  assert.equal(page.buildPayload().drinkName, '咖啡拿铁 + 燕麦奶');

  page.selectBase({ currentTarget: { dataset: { id: 'americano' } } });
  assert.equal(page.data.liveCalories, 10 + 61);
  page.selectBase({ currentTarget: { dataset: { id: 'milk-tea' } } });
  assert.deepEqual(page.data.selectedToppingIds, [], 'coffee extras are dropped when switching to a tea base');
  assert.equal(page.data.sweetnessVisible, true);
  assert.equal(page.data.toppingStep, 4);
  assert.ok(page.data.toppingOptions.every((topping) => topping.scope !== 'coffee'));
});

test('custom builder: toppings are ordered by popularity, collapsed to ten, and a selected one never hides', () => {
  setupWx();
  const page = loadPage('pages/custom/custom.js');
  page.onLoad({});
  assert.equal(page.data.toppingOptions.length, 22);
  assert.deepEqual(page.data.toppingOptions.slice(0, 4).map((topping) => topping.id), ['pearl', 'brown-pearl', 'taro-ball', 'pudding']);
  assert.equal(page.data.visibleToppingOptions.length, 10);
  assert.equal(page.data.hiddenToppingCount, 12);
  assert.equal(page.data.canCollapseToppings, true);

  page.toggleAllToppings();
  assert.equal(page.data.visibleToppingOptions.length, 22);
  assert.equal(page.data.hiddenToppingCount, 0);
  page.toggleTopping({ currentTarget: { dataset: { id: 'aloe' } } });
  page.toggleAllToppings();
  assert.equal(page.data.visibleToppingOptions.length, 11, 'the selected aloe stays visible after collapsing');
  assert.ok(page.data.visibleToppingOptions.some((topping) => topping.id === 'aloe' && topping.selected));
  assert.equal(page.data.hiddenToppingCount, 11);
});

test('custom builder: a saved coffee drink reopens with its base, valid extras and a fixed sweetness', () => {
  setupWx();
  const page = loadPage('pages/custom/custom.js');
  const prefill = encodeURIComponent(JSON.stringify({ baseId: 'coffee-latte', sizeId: 'large', sweetnessId: 'normal', toppingIds: ['extra-shot', 'pearl'] }));
  page.onLoad({ prefill });
  assert.equal(page.data.selectedBaseId, 'coffee-latte');
  assert.equal(page.data.selectedSweetnessId, 'half');
  assert.equal(page.data.sweetnessVisible, false);
  assert.equal(page.data.selectedSizeId, 'large');
  assert.deepEqual(page.data.selectedToppingIds, ['extra-shot'], 'a tea topping cannot ride along on a coffee base');
  assert.equal(page.data.liveCalories, Math.round(190 * 1.25 + 5));
});

test('old tea bases keep their ids and numbers, and the latte is now clearly the milk-tea latte', () => {
  const byId = Object.fromEntries(store.bases.map((base) => [base.id, base]));
  assert.deepEqual(['milk-tea', 'fruit-tea', 'latte', 'coconut', 'pure-tea', 'cheese-tea'].map((id) => byId[id].calories), [320, 260, 300, 340, 90, 390]);
  assert.equal(byId.latte.name, '奶茶拿铁');
  assert.equal(byId['coffee-latte'].sweetnessAdjustable, false);
  assert.equal(byId.americano.calories, 10);
});

test('record tab splits brands into tea and coffee tabs', () => {
  setupWx();
  const record = loadPage('pages/record/record.js');
  record.onLoad();
  assert.deepEqual(record.data.brandTabs.map((tab) => [tab.id, tab.count]), [['all', 28], ['tea', 20], ['coffee', 8]]);
  assert.equal(record.data.visibleBrands.length, 28);
  record.selectBrandCategory({ currentTarget: { dataset: { id: 'coffee' } } });
  assert.equal(record.data.visibleBrands.length, 8);
  assert.ok(record.data.visibleBrands.every((brand) => brand.category === 'coffee'));
});

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);

test('every brand has the same kind of simple icon: a short mark on a soft colour, readable and unique', () => {
  const brands = store.getBrands();
  const marks = new Set();
  for (const brand of brands) {
    assert.ok(brand.mark && brand.mark.length <= 2, `${brand.id}: ${brand.mark}`);
    assert.match(brand.color, /^#[0-9A-Fa-f]{6}$/, brand.id);
    assert.match(brand.ink, /^#[0-9A-Fa-f]{6}$/, brand.id);
    assert.ok(contrast(brand.color, brand.ink) >= 4.5, `${brand.id} contrast ${contrast(brand.color, brand.ink).toFixed(1)}`);
    assert.ok(luminance(brand.color) > 0.7, `${brand.id} the background stays a soft light colour`);
    assert.equal(brand.logo, undefined, `${brand.id} no longer uses a logo file`);
    marks.add(brand.mark);
  }
  assert.equal(marks.size, brands.length, 'marks are unique');
  assert.equal(fs.existsSync(path.join(root, 'assets/brands')), false, 'the real logo files are gone');
});

test('brand cards are the same compact row style as the quick drinks: avatar + name + subtitle, no cup glyph', () => {
  const markup = read('pages/record/record.wxml');
  assert.match(markup, /class="brand-avatar" style="background: {{item\.color}}; color: {{item\.ink}};"/);
  assert.doesNotMatch(markup, /brand-tile|brand-cup|brand-logo|logoFailed/);
  const styles = read('pages/record/record.wxss');
  assert.match(styles, /\.brand-card\s*{[^}]*display:\s*flex;[^}]*align-items:\s*center;/s);
  assert.match(styles, /\.brand-avatar\s*{[^}]*width:\s*72rpx;[^}]*height:\s*72rpx;/s);
  assert.doesNotMatch(styles, /\.brand-cup|\.brand-tile|\.mark-/);
  setupWx();
  const record = loadPage('pages/record/record.js');
  record.onLoad();
  assert.equal(record.data.brands.length, 28);
  assert.ok(record.data.brands.every((brand) => brand.mark && brand.color && brand.ink));
});

test('search reaches the new brands and drinks', () => {
  assert.ok(store.searchDrinks('星巴克').length >= 8);
  assert.ok(store.searchDrinks('生椰拿铁').length >= 3);
  assert.ok(store.searchDrinks('杨枝甘露').length >= 4);
});

test('every drink resolves to an icon file that exists, coffee gets a coffee icon and mango drinks the mango icon', () => {
  for (const drink of allDrinks()) {
    const icon = getDrinkIcon(drink);
    assert.ok(fs.existsSync(path.join(root, icon)), `${drink.id}: ${icon}`);
  }
  const americano = store.getDrinksByBrandId('starbucks')[0];
  assert.match(getDrinkIcon(americano), /americano\.png$/);
  const mango = store.getDrinksByBrandId('qifentian').find((drink) => drink.displayName === '杨枝甘露');
  assert.match(getDrinkIcon(mango), /mango-pomelo\.png$/);
  const latte = store.getDrinksByBrandId('luckin')[0];
  assert.match(getDrinkIcon(latte), /coffee-float\.png$/);
});

test('very low calorie drinks lead with a readable equivalent instead of 0.0 fries', () => {
  const cards = rankEquivalentCards(buildEquivalentCards(10, store.equivalents));
  assert.equal(cards[0].id, 'americano');
  const fries = cards.find((card) => card.id === 'fries');
  assert.equal(fries.numberMain, '<0.1');
  const normal = rankEquivalentCards(buildEquivalentCards(627, store.equivalents));
  assert.equal(normal[0].id, 'fries');
  assert.equal(normal.at(-1).id, 'americano', '62.7 cups of americano is no longer the headline');
  assert.equal(rankEquivalentCards(buildEquivalentCards(0, store.equivalents)).length, 5);
});

test('the package stays under the size limit after the data expansion', () => {
  const ignore = require('../project.config.json').packOptions.ignore;
  const ignored = (relativePath, isDirectory) => {
    const name = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
    return ignore.some(({ type, value }) => {
      if (type === 'folder') return name === value || name.startsWith(`${value}/`);
      if (type === 'file') return !isDirectory && name === value;
      if (type === 'suffix') return !isDirectory && name.endsWith(value);
      return false;
    });
  };
  const sizeOf = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).reduce((sum, entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isSymbolicLink() || ignored(rel, entry.isDirectory())) return sum;
    return sum + (entry.isDirectory() ? sizeOf(rel) : fs.statSync(path.join(root, rel)).size);
  }, 0);
  const bytes = sizeOf('.');
  assert.ok(bytes < 2 * 1024 * 1024, `Packaged source is ${bytes} bytes`);
});

test('result page hides meaningless tiny equivalents for very low calorie drinks', () => {
  setupWx();
  const make = (calories) => {
    const result = loadPage('pages/result/result.js');
    result.onLoad({ payload: encodeURIComponent(JSON.stringify({ mode: 'custom', drinkName: '测试', calories })) });
    return result;
  };
  const americano = make(10);
  assert.equal(americano.data.currentCard.id, 'americano');
  assert.deepEqual(americano.data.otherCards, [], '0.1 apples and <0.1 fries are not shown as tiles');
  const normal = make(627);
  assert.equal(normal.data.otherCards.length, 4);
  assert.ok(normal.data.otherCards.every((card) => Number(card.numberMain) >= 0.3));
  const mid = make(100);
  assert.ok(mid.data.otherCards.every((card) => Number(card.numberMain) >= 0.3));
  assert.ok(mid.data.otherCards.length >= 1);
  const markup = read('pages/result/result.wxml');
  assert.match(markup, /wx:if="{{otherCards\.length}}" class="stage-hint"/);
  assert.match(markup, /wx:if="{{otherCards\.length}}" class="equivalent-tiles"/);
});

test('the drink sheet collapses long topping lists like the builder and only offers valid extras', () => {
  setupWx();
  const tea = loadPage('pages/drinks/drinks.js');
  tea.onLoad({ brandId: 'heytea' });
  const drink = tea.data.visibleDrinks[0];
  tea.openDrinkById(drink.id);
  assert.equal(tea.data.toppingOptions.length, 22);
  assert.equal(tea.data.visibleToppingOptions.length, 10);
  assert.equal(tea.data.hiddenToppingCount, 12);
  tea.toggleAllToppings();
  assert.equal(tea.data.visibleToppingOptions.length, 22);
  tea.toggleExtraTopping({ currentTarget: { dataset: { id: 'aloe' } } });
  tea.toggleAllToppings();
  assert.equal(tea.data.visibleToppingOptions.length, 11, 'a selected topping stays visible');
  assert.ok(tea.data.visibleToppingOptions.some((topping) => topping.id === 'aloe' && topping.selected));

  const coffee = loadPage('pages/drinks/drinks.js');
  coffee.onLoad({ brandId: 'starbucks' });
  coffee.openDrinkById(coffee.data.visibleDrinks[1].id);
  assert.equal(coffee.data.canCollapseToppings, false);

  const prefill = encodeURIComponent(JSON.stringify({ toppingIds: ['extra-shot', 'pearl'] }));
  const reopened = loadPage('pages/drinks/drinks.js');
  reopened.onLoad({ brandId: 'starbucks', drinkId: coffee.data.visibleDrinks[1].id, prefill });
  assert.deepEqual(reopened.data.selectedExtraToppingIds, ['extra-shot'], 'a tea topping cannot ride along on a coffee drink');
});

test('custom bases are flow chips and the calendar rows are shorter', () => {
  assert.equal((read('pages/custom/custom.wxml').match(/class="option-grid chips"/g) || []).length, 2);
  assert.match(read('pages/custom/custom.wxss'), /\.option-grid\.chips\s*{[^}]*flex-wrap:\s*wrap;/s);
  assert.match(read('pages/home/home.wxss'), /\.day-cell\s*{[^}]*min-height:\s*84rpx;/s);
});

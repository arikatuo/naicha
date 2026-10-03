const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const store = require('../utils/data-store');
const { dateKey } = require('../utils/calendar');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function loadPage(relativePath) {
  let definition;
  const previousPage = global.Page;
  global.Page = (page) => { definition = page; };
  const file = path.join(root, relativePath);
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
  const titles = [];
  const app = { globalData: {} };
  global.getApp = () => app;
  global.wx = {
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
    switchTab: ({ url }) => navigation.push(url),
    navigateTo: ({ url }) => navigation.push(url),
    setNavigationBarTitle: ({ title }) => titles.push(title)
  };
  return { app, navigation, titles };
}

test('layout never depends on the button component, except the invisible share overlay', () => {
  const walk = (dir, out = []) => {
    for (const name of fs.readdirSync(path.join(root, dir))) {
      const rel = path.join(dir, name);
      if (fs.statSync(path.join(root, rel)).isDirectory()) walk(rel, out);
      else if (rel.endsWith('.wxml')) out.push(rel);
    }
    return out;
  };
  const buttons = [];
  for (const file of [...walk('pages'), 'custom-tab-bar/index.wxml']) {
    for (const tag of read(file).match(/<button\b[^>]*>/g) || []) buttons.push(`${file}: ${tag}`);
  }
  assert.equal(buttons.length, 1, buttons.join('\n'));
  assert.match(buttons[0], /share-overlay/);
  assert.match(buttons[0], /open-type="share"/);
});

test('the record tab returns to today when opened from the tab bar, but keeps the date during the flow', () => {
  const { app } = setup();
  let tabBar;
  const previousComponent = global.Component;
  global.Component = (config) => { tabBar = { ...config, data: structuredClone(config.data), ...config.methods }; };
  const file = path.join(root, 'custom-tab-bar/index.js');
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.Component = previousComponent; }

  const record = loadPage('pages/record/record.js');
  record.onLoad();
  record.setDate('2026-03-01');
  record.onShow();
  assert.equal(record.data.recordDate, '2026-03-01', 'coming back from a child page keeps the chosen date');

  tabBar.switchTab({ currentTarget: { dataset: { path: '/pages/record/record', index: 1 } } });
  assert.equal(app.globalData.resetRecordDate, true);
  record.onShow();
  assert.equal(record.data.recordDate, dateKey(new Date()));
  assert.equal(record.data.recordDateLabel, '今天');
  assert.equal(app.globalData.resetRecordDate, false);

  tabBar.switchTab({ currentTarget: { dataset: { path: '/pages/stats/stats', index: 2 } } });
  assert.equal(app.globalData.resetRecordDate, false, 'other tabs do not touch the record date');

  app.globalData.recordDate = '2026-09-17';
  app.globalData.resetRecordDate = true;
  record.onShow();
  assert.equal(record.data.recordDate, '2026-09-17', 'a date chosen on the calendar wins over the reset');
});

test('home only offers a record button for past days and says where to record today', () => {
  setup();
  const home = loadPage('pages/home/home.js');
  home.onLoad();
  assert.equal(home.data.selectedIsToday, true);
  home.selectDay({ currentTarget: { dataset: { date: '2026-09-17' } } });
  assert.equal(home.data.selectedIsToday, false);
  assert.match(home.data.recordButtonLabel, /^补记9月17日/);
  const markup = read('pages/home/home.wxml');
  assert.match(markup, /wx:if="{{!selectedInFuture && !selectedIsToday}}" class="button-primary record-button"/);
});

test('brand drink list can be filtered by tag and sorted by calories, and the title is the brand name', () => {
  const { titles } = setup();
  const brand = store.getBrands().find((item) => {
    const drinks = store.getDrinksByBrandId(item.id);
    return drinks.some((d) => (d.tagIds || []).length) && new Set(drinks.flatMap((d) => d.tagIds || [])).size > 1;
  });
  const page = loadPage('pages/drinks/drinks.js');
  page.onLoad({ brandId: brand.id });
  assert.deepEqual(titles, [brand.name]);
  assert.equal(page.data.visibleDrinks.length, page.data.drinks.length);
  assert.equal(page.data.filters[0].id, 'all');
  const tag = page.data.filters[1];
  page.selectFilter({ currentTarget: { dataset: { id: tag.id } } });
  assert.ok(page.data.visibleDrinks.length > 0);
  assert.ok(page.data.visibleDrinks.every((drink) => drink.tagIds.includes(tag.id)));
  page.selectFilter({ currentTarget: { dataset: { id: 'all' } } });
  page.toggleSort();
  const calories = page.data.visibleDrinks.map((drink) => drink.defaultCalories);
  assert.deepEqual(calories, [...calories].sort((a, b) => a - b));
  page.toggleSort();
  assert.equal(page.data.sortByCalories, false);
});

test('year statistics scroll to the current month and hide the scroll bar', () => {
  setup();
  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.scrollTo, '');
  stats.changePeriod({ currentTarget: { dataset: { period: 'year' } } });
  assert.match(stats.data.scrollTo, /^col-\d+$/);
  const markup = read('pages/stats/stats.wxml');
  assert.match(markup, /scroll-into-view="{{scrollTo}}"/);
  assert.match(markup, /show-scrollbar="{{false}}"/);
  assert.match(markup, /id="col-{{index}}"/);
});

test('selected options carry a check mark in the builder and the drink sheet', () => {
  for (const file of ['pages/custom/custom.wxml', 'pages/drinks/drinks.wxml']) {
    const markup = read(file);
    assert.ok((markup.match(/class="option-check"/g) || []).length >= 3, file);
  }
});

test('duplicate large titles are gone and bottom bars stay compact', () => {
  assert.doesNotMatch(read('pages/custom/custom.wxml'), /class="title"/);
  assert.doesNotMatch(read('pages/record/record.wxml'), /page-title/);
  assert.doesNotMatch(read('pages/drinks/drinks.wxml'), /class="title"/);
  const custom = read('pages/custom/custom.wxml');
  assert.match(custom, /class="submit-actions"[\s\S]*submit-quick[\s\S]*class="button-primary submit"/);
  assert.match(read('pages/custom/custom.wxss'), /\.submit-actions\s*{[^}]*display:\s*flex;/s);
});

test('every tab page leaves room for the raised tab bar', () => {
  for (const [file, selector] of [['pages/home/home.wxss', '.diary-page'], ['pages/record/record.wxss', '.record-page'], ['pages/stats/stats.wxss', '.stats-page']]) {
    assert.match(read(file), new RegExp(`\\${selector}\\s*{[^}]*padding-bottom:\\s*calc\\(240rpx\\s*\\+\\s*env\\(safe-area-inset-bottom\\)\\)`, 's'), file);
  }
});

test('result page: tapping a tile swaps it into the hero card and the poster/share use it', () => {
  const { app } = setup();
  const result = loadPage('pages/result/result.js');
  result.onLoad({ payload: encodeURIComponent(JSON.stringify({ mode: 'custom', drinkName: '测试', calories: 627 })) });
  assert.equal(result.data.cards.length, 5);
  assert.equal(result.data.otherCards.length, 4);
  assert.ok(result.data.otherCards.every((card) => card.index !== 0));
  const pick = result.data.otherCards[2];
  result.selectEquivalent({ currentTarget: { dataset: { index: pick.index } } });
  assert.equal(result.data.currentCard.id, pick.id);
  assert.equal(result.data.otherCards.length, 4);
  assert.ok(result.data.otherCards.every((card) => card.index !== pick.index));
  assert.ok(result.data.otherCards.some((card) => card.index === 0), 'the previous hero goes back to the tiles');
  assert.ok(result.onShareAppMessage().title.length > 0);
  void app;
});

test('result page: date chips cover today, yesterday and the day before, and a picked date becomes a custom chip', () => {
  setup();
  const result = loadPage('pages/result/result.js');
  result.onLoad({ payload: encodeURIComponent(JSON.stringify({ mode: 'custom', drinkName: '测试', calories: 300 })) });
  assert.deepEqual(result.data.dateChips.map((chip) => chip.label), ['今天', '昨天', '前天']);
  assert.equal(result.data.dateChips[0].active, true);
  assert.equal(result.data.customDate, false);

  const yesterday = result.data.dateChips[1].date;
  result.pickQuickDate({ currentTarget: { dataset: { date: yesterday } } });
  assert.equal(result.data.recordDate, yesterday);
  assert.equal(result.data.dateChips[1].active, true);
  assert.equal(result.data.dateChips[0].active, false);
  assert.equal(result.data.customDate, false);

  result.selectRecordDate({ detail: { value: '2026-03-01' } });
  assert.equal(result.data.recordDate, '2026-03-01');
  assert.equal(result.data.customDate, true);
  assert.ok(result.data.dateChips.every((chip) => !chip.active));
  assert.equal(result.data.recordDateLabel, '3月1日');
});

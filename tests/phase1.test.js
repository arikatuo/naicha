const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { dateKey, heatTier, monthCells } = require('../utils/calendar');
const { repeatRecordUrl, syncTabBar } = require('../utils/nav');
const diary = require('../utils/diary-store');

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

function createWx() {
  const values = new Map();
  const navigation = [];
  global.wx = {
    getStorageSync: (key) => values.get(key),
    setStorageSync: (key, value) => values.set(key, structuredClone(value)),
    navigateTo: ({ url }) => navigation.push(url),
    switchTab: ({ url }) => navigation.push(url),
    showToast() {},
    showModal({ success }) { success({ confirm: true }); }
  };
  return { navigation };
}

test('heat tiers split a day into none, light, moderate and high', () => {
  assert.equal(heatTier(0, 0), 0);
  assert.equal(heatTier(170, 1), 1);
  assert.equal(heatTier(299, 1), 1);
  assert.equal(heatTier(300, 1), 2);
  assert.equal(heatTier(599, 2), 2);
  assert.equal(heatTier(600, 2), 3);
  assert.equal(heatTier(undefined, 1), 1);
});

test('calendar cells carry daily calories and tier for the heat dots', () => {
  const cells = monthCells(2026, 9, [
    { date: '2026-09-30', calories: 170 },
    { date: '2026-09-30', calories: 170 },
    { date: '2026-09-17', calories: 332 },
    { date: '2026-09-11', calories: 700 }
  ], '2026-09-30');
  const byDate = Object.fromEntries(cells.filter((cell) => cell.date).map((cell) => [cell.date, cell]));
  assert.equal(byDate['2026-09-30'].calories, 340);
  assert.equal(byDate['2026-09-30'].tier, 2);
  assert.equal(byDate['2026-09-17'].tier, 2);
  assert.equal(byDate['2026-09-11'].tier, 3);
  assert.equal(byDate['2026-09-01'].tier, 0);
});

test('repeatRecordUrl reopens brand and custom drinks with their configuration and optional date', () => {
  const brand = { mode: 'brand', config: { brandId: 'mixue', drinkId: 'd1' } };
  assert.match(repeatRecordUrl(brand), /^\/pages\/drinks\/drinks\?brandId=mixue&drinkId=d1&prefill=/);
  assert.doesNotMatch(repeatRecordUrl(brand), /recordDate/);
  assert.match(repeatRecordUrl(brand, '2026-09-28'), /&recordDate=2026-09-28$/);
  const custom = { mode: 'custom', config: { baseId: 'milk-tea' } };
  assert.match(repeatRecordUrl(custom, '2026-09-28'), /^\/pages\/custom\/custom\?prefill=.*&recordDate=2026-09-28$/);
  assert.match(repeatRecordUrl({ mode: 'custom', config: null, drinkName: 'x', calories: 1 }), /^\/pages\/result\/result\?payload=/);
});

test('syncTabBar highlights the current tab and tolerates pages without a custom tab bar', () => {
  const calls = [];
  syncTabBar({ getTabBar: () => ({ setData: (patch) => calls.push(patch) }) }, 1);
  assert.deepEqual(calls, [{ selected: 1 }]);
  assert.doesNotThrow(() => syncTabBar({}, 0));
  assert.doesNotThrow(() => syncTabBar({ getTabBar: () => null }, 0));
});

test('record tab uses the date chosen on the calendar once, then falls back to today', () => {
  createWx();
  const app = { globalData: { recordDate: '2026-09-17' } };
  global.getApp = () => app;
  const record = loadPage('pages/record/record.js');
  record.onLoad();
  record.onShow();
  assert.equal(record.data.recordDate, '2026-09-17');
  assert.equal(record.data.recordDateLabel, '9月17日');
  assert.equal(app.globalData.recordDate, '');
  record.onShow();
  assert.equal(record.data.recordDate, '2026-09-17');
  record.onTabItemTap();
  assert.equal(record.data.recordDate, dateKey(new Date()));
  assert.equal(record.data.recordDateLabel, '今天');
});

test('record tab lists each recent drink once, newest first, and reopens it for the chosen date', () => {
  const { navigation } = createWx();
  global.getApp = () => ({ globalData: {} });
  const brandConfig = { brandId: 'mixue', drinkId: 'mixue-pearl' };
  const first = diary.saveRecord({ date: '2026-09-10', mode: 'brand', brandName: '蜜雪冰城', drinkName: '珍珠奶茶', calories: 300, config: brandConfig });
  diary.saveRecord({ date: '2026-09-11', mode: 'custom', drinkName: '自选奶茶', calories: 320, config: { baseId: 'milk-tea' } });
  diary.saveRecord({ date: '2026-09-12', mode: 'brand', brandName: '蜜雪冰城', drinkName: '珍珠奶茶', calories: 300, config: brandConfig });
  const record = loadPage('pages/record/record.js');
  record.onLoad();
  record.setDate('2026-09-28');
  record.onShow();
  assert.equal(record.data.recentDrinks.length, 2);
  assert.match(record.data.recentDrinks[0].meta, /蜜雪冰城 · 300 kcal/);
  record.openRecent({ currentTarget: { dataset: { id: record.data.recentDrinks[0].id } } });
  assert.match(navigation.at(-1), /drinkId=mixue-pearl&prefill=.*&recordDate=2026-09-28$/);
  assert.notEqual(record.data.recentDrinks[0].id, first.id);
});

test('home record actions stay tucked away until a card is expanded', () => {
  createWx();
  global.getApp = () => ({ globalData: {} });
  const saved = diary.saveRecord({ date: '2026-09-29', mode: 'custom', drinkName: '自选奶茶', calories: 320, config: { baseId: 'milk-tea' } });
  const home = loadPage('pages/home/home.js');
  home.onLoad();
  home.setData({ year: 2026, month: 9, selectedDate: '2026-09-29' });
  home.refresh();
  assert.equal(home.data.expandedId, '');
  home.toggleMore({ currentTarget: { dataset: { id: saved.id } } });
  assert.equal(home.data.expandedId, saved.id);
  home.toggleMore({ currentTarget: { dataset: { id: saved.id } } });
  assert.equal(home.data.expandedId, '');
  home.toggleMore({ currentTarget: { dataset: { id: saved.id } } });
  home.selectDay({ currentTarget: { dataset: { date: '2026-09-28' } } });
  assert.equal(home.data.expandedId, '');
});

test('home does not start a record for a future day and offers no disabled button', () => {
  const { navigation } = createWx();
  const app = { globalData: {} };
  global.getApp = () => app;
  const home = loadPage('pages/home/home.js');
  home.onLoad();
  const future = new Date();
  future.setDate(future.getDate() + 3);
  home.setData({ year: future.getFullYear(), month: future.getMonth() + 1, selectedDate: dateKey(future) });
  home.refresh();
  assert.equal(home.data.selectedInFuture, true);
  home.startRecord();
  assert.equal(navigation.length, 0);
  assert.equal(app.globalData.recordDate || '', '');
});

test('custom tab bar has a raised centre record button and existing icons', () => {
  const root = path.join(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'custom-tab-bar/index.json'), 'utf8'));
  const markup = fs.readFileSync(path.join(root, 'custom-tab-bar/index.wxml'), 'utf8');
  const styles = fs.readFileSync(path.join(root, 'custom-tab-bar/index.wxss'), 'utf8');
  assert.equal(config.component, true);
  assert.match(markup, /class="center-button"/);
  assert.match(styles, /\.center-button\s*{[^}]*top:\s*-36rpx;/s);
  assert.match(styles, /env\(safe-area-inset-bottom\)/);
});

test('old shared links to the merged brand and lookup pages land on the record tab', () => {
  const { navigation } = createWx();
  const definition = {};
  const previousApp = global.App;
  global.App = (config) => Object.assign(definition, config);
  const file = path.join(__dirname, '..', 'app.js');
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.App = previousApp; }
  definition.onPageNotFound({ path: 'pages/brands/brands' });
  definition.onPageNotFound({ path: 'pages/lookup/lookup' });
  definition.onPageNotFound({ path: 'pages/unknown/unknown' });
  assert.deepEqual(navigation, ['/pages/record/record', '/pages/record/record', '/pages/home/home']);
});

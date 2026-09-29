const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { dateKey, isValidDateKey, monthCells, shiftMonth } = require('../utils/calendar');
const diary = require('../utils/diary-store');
const { encodePayload } = require('../utils/nav');

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
  return { values, navigation };
}

test('September 2026 calendar aligns Tuesday the 1st and supports multiple records on one date', () => {
  const cells = monthCells(2026, 9, [{ date: '2026-09-29' }, { date: '2026-09-29' }], '2026-09-29');
  assert.equal(cells.length, 35);
  assert.equal(cells[0].date, '');
  assert.equal(cells[1].date, '2026-09-01');
  assert.equal(cells[29].day, 29);
  assert.equal(cells[29].count, 2);
  assert.equal(cells[29].selected, true);
  assert.equal(cells[30].day, 30);
  assert.equal(cells[31].date, '');
  assert.deepEqual(shiftMonth(2026, 12, 1), { year: 2027, month: 1 });
  assert.equal(isValidDateKey('2026-02-29'), false);
  assert.equal(isValidDateKey('2028-02-29'), true);
  assert.equal(dateKey(new Date(2026, 8, 29)), '2026-09-29');
});

test('diary saves distinct cups, can move and delete a record, and rejects invalid dates', () => {
  createWx();
  const input = { date: '2026-09-29', mode: 'brand', drinkName: '珍珠奶茶', brandName: '蜜雪冰城', calories: 420, config: { brandId: 'mixue', drinkId: 'one' } };
  const first = diary.saveRecord(input);
  const second = diary.saveRecord(input);
  assert.notEqual(first.id, second.id);
  assert.equal(diary.getRecords().length, 2);
  assert.equal(first.config.drinkId, 'one');
  diary.updateRecord(first.id, { date: '2026-09-28' });
  assert.equal(diary.getRecords().find((record) => record.id === first.id).date, '2026-09-28');
  assert.equal(diary.deleteRecord(second.id), true);
  assert.equal(diary.getRecords().length, 1);
  assert.throws(() => diary.saveRecord({ ...input, date: '2026-09-31' }));
});

test('calendar record flow saves only after an explicit result action and returns to its date', () => {
  const { navigation } = createWx();
  const app = { globalData: { focusDate: '' } };
  global.getApp = () => app;
  const home = loadPage('pages/home/home.js');
  home.onLoad();
  home.onShow();
  assert.equal(home.data.hasRecords, false);
  home.setData({ selectedDate: '2026-09-29', year: 2026, month: 9 });
  home.refresh();
  home.startRecord();
  assert.equal(navigation.at(-1), '/pages/brands/brands?recordDate=2026-09-29');

  const result = loadPage('pages/result/result.js');
  result.onLoad({ payload: encodePayload({ mode: 'brand', drinkName: '珍珠奶茶', brandName: '蜜雪冰城', calories: 420, recordDate: '2026-09-29', config: { brandId: 'mixue', drinkId: 'mixue-pearl' } }) });
  assert.equal(diary.getRecords().length, 0);
  result.saveRecord();
  result.saveRecord();
  assert.equal(diary.getRecords().length, 1);
  assert.equal(navigation.at(-1), '/pages/home/home');
  assert.equal(app.globalData.focusDate, '2026-09-29');
  assert.equal(app.globalData.focusRecordId, diary.getRecords()[0].id);
  home.onShow();
  assert.equal(home.data.selectedRecords.length, 1);
  assert.equal(home.data.cells[29].count, 1);
  assert.equal(home.data.justSavedRecord.drinkName, '珍珠奶茶');
  assert.equal(home.data.latestRecord.drinkName, '珍珠奶茶');
  assert.equal(home.data.monthCount, 1);
  home.repeatRecord({ currentTarget: { dataset: { id: home.data.latestRecord.id } } });
  assert.match(navigation.at(-1), /\/pages\/drinks\/drinks\?brandId=mixue&drinkId=mixue-pearl/);
});

test('shared result exposes own calculation and excludes private configuration from its path', () => {
  createWx();
  const result = loadPage('pages/result/result.js');
  result.onLoad({ payload: encodePayload({ mode: 'custom', drinkName: '经典奶茶', calories: 320, config: { baseId: 'milk-tea' } }) });
  const share = result.onShareAppMessage();
  assert.match(share.path, /shared=1$/);
  assert.doesNotMatch(share.path, /baseId|recordDate/);
  const shared = loadPage('pages/result/result.js');
  shared.onLoad({ payload: share.path.split('payload=')[1].split('&shared=')[0], shared: '1' });
  shared.saveRecord();
  assert.equal(diary.getRecords().length, 0);
});

test('brand and custom flows carry the selected record date and configuration to the result', () => {
  const { navigation } = createWx();
  const brands = loadPage('pages/brands/brands.js');
  brands.onLoad({ recordDate: '2026-09-28' });
  brands.openBrand({ currentTarget: { dataset: { id: 'mixue' } } });
  assert.equal(navigation.at(-1), '/pages/drinks/drinks?brandId=mixue&recordDate=2026-09-28');

  const drinks = loadPage('pages/drinks/drinks.js');
  drinks.onLoad({ brandId: 'mixue', recordDate: '2026-09-28' });
  drinks.openDrink({ currentTarget: { dataset: { id: drinks.data.drinks[0].id } } });
  drinks.calculate();
  const brandPayload = JSON.parse(decodeURIComponent(navigation.at(-1).split('payload=')[1]));
  assert.equal(brandPayload.recordDate, '2026-09-28');
  assert.equal(brandPayload.config.brandId, 'mixue');
  assert.equal(brandPayload.config.drinkId, drinks.data.drinks[0].id);

  brands.goCustom();
  assert.equal(navigation.at(-1), '/pages/custom/custom?recordDate=2026-09-28');
  const custom = loadPage('pages/custom/custom.js');
  custom.onLoad({ recordDate: '2026-09-28' });
  custom.calculate();
  const customPayload = JSON.parse(decodeURIComponent(navigation.at(-1).split('payload=')[1]));
  assert.equal(customPayload.recordDate, '2026-09-28');
  assert.equal(customPayload.config.baseId, 'milk-tea');
  assert.equal(customPayload.config.sizeId, 'medium');
});

test('quick drink starts at its configuration with the selected diary date', () => {
  const { navigation } = createWx();
  const brands = loadPage('pages/brands/brands.js');
  brands.onLoad({ recordDate: '2026-09-28' });
  assert.equal(brands.data.quickDrinks.length, 3);
  brands.openQuickDrink({ currentTarget: { dataset: { id: 'chagee-boya-juexian' } } });
  assert.equal(navigation.at(-1), '/pages/drinks/drinks?brandId=chagee&drinkId=chagee-boya-juexian&recordDate=2026-09-28');
});

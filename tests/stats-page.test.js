const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const diary = require('../utils/diary-store');
const { dateKey } = require('../utils/calendar');

function loadPage(relativePath) {
  let definition;
  const previousPage = global.Page;
  global.Page = (page) => { definition = page; };
  const file = path.join(__dirname, '..', relativePath);
  delete require.cache[require.resolve(file)];
  try { require(file); } finally { global.Page = previousPage; }
  return {
    ...definition,
    data: structuredClone(definition.data),
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
    switchTab: ({ url }) => navigation.push(url)
  };
  return { values, navigation };
}

test('calendar entry opens statistics and chart returns to a recorded date', () => {
  const { navigation } = createWx();
  const app = { globalData: { focusDate: '', focusRecordId: '' } };
  global.getApp = () => app;
  const today = dateKey(new Date());
  const input = { date: today, mode: 'custom', drinkName: '奶茶', calories: 320 };
  diary.saveRecord(input);
  diary.saveRecord(input);

  const home = loadPage('pages/home/home.js');
  home.onLoad();
  home.onShow();
  home.openStats();
  assert.equal(navigation.at(-1), '/pages/stats/stats');

  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.activePeriod, 'month');
  assert.deepEqual([stats.data.cups, stats.data.days, stats.data.calories], [2, 1, 640]);
  const index = stats.data.buckets.findIndex((bucket) => bucket.count);
  assert.notEqual(index, -1);
  stats.openBucket({ currentTarget: { dataset: { index } } });
  assert.equal(app.globalData.focusDate, today);
  assert.equal(navigation.at(-1), '/pages/home/home');
});

test('period switching and an empty period keep the next action clear', () => {
  const { navigation } = createWx();
  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.hasPeriodRecords, false);
  stats.changePeriod({ currentTarget: { dataset: { period: 'week' } } });
  assert.equal(stats.data.activePeriod, 'week');
  assert.equal(stats.data.buckets.length, 7);
  stats.startRecord();
  assert.equal(navigation.at(-1), '/pages/brands/brands');
});

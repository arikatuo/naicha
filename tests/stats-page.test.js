const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
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

test('statistics tab refreshes from local records and chart returns to a recorded date', () => {
  const { navigation } = createWx();
  const app = { globalData: { focusDate: '', focusRecordId: '' } };
  global.getApp = () => app;
  const today = dateKey(new Date());
  const input = { date: today, mode: 'custom', drinkName: '奶茶', calories: 320 };
  diary.saveRecord(input);
  diary.saveRecord(input);

  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.activePeriod, 'month');
  assert.deepEqual([stats.data.cups, stats.data.days, stats.data.calories], [2, 1, 640]);
  const index = stats.data.buckets.findIndex((bucket) => bucket.count);
  assert.notEqual(index, -1);
  stats.openBucket({ currentTarget: { dataset: { index } } });
  assert.equal(stats.data.selectedBucket.count, 2);
  assert.deepEqual(stats.data.selectedBucket.dates.map((item) => item.date), [today]);
  stats.openRecordDate({ currentTarget: { dataset: { date: today } } });
  assert.equal(app.globalData.focusDate, today);
  assert.equal(navigation.at(-1), '/pages/home/home');
});

test('calendar detail link opens the latest recorded day, not an empty today', () => {
  const { navigation } = createWx();
  const app = { globalData: { focusDate: '' } };
  global.getApp = () => app;
  const stats = loadPage('pages/stats/stats.js');
  stats.setData({ buckets: [
    { dates: [{ date: '2026-09-01', count: 1 }] },
    { dates: [{ date: '2026-09-06', count: 1 }, { date: '2026-09-18', count: 1 }] }
  ] });
  stats.goToCalendar();
  assert.equal(app.globalData.focusDate, '2026-09-18');
  assert.equal(navigation.at(-1), '/pages/home/home');
});

test('period switching and an empty period keep the next action clear', () => {
  const { navigation } = createWx();
  const stats = loadPage('pages/stats/stats.js');
  stats.onShow();
  assert.equal(stats.data.hasPeriodRecords, false);
  assert.equal(stats.data.activePeriodLabel, '本月');
  stats.changePeriod({ currentTarget: { dataset: { period: 'week' } } });
  assert.equal(stats.data.activePeriod, 'week');
  assert.equal(stats.data.activePeriodLabel, '本周');
  assert.equal(stats.data.buckets.length, 7);
  stats.startRecord();
  assert.equal(navigation.at(-1), '/pages/record/record');
});

test('statistics has its own tab and the calendar month header stays focused', () => {
  const appConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
  assert.equal(appConfig.tabBar.custom, true);
  assert.deepEqual(appConfig.tabBar.list.map(({ text }) => text), ['日历', '记一杯', '统计']);
  assert.equal(appConfig.tabBar.list[2].pagePath, 'pages/stats/stats');
  const tabScript = fs.readFileSync(path.join(__dirname, '..', 'custom-tab-bar/index.js'), 'utf8');
  for (const icon of tabScript.match(/\/assets\/tabs\/[\w-]+\.png/g)) {
    assert.ok(fs.existsSync(path.join(__dirname, '..', icon)), icon);
  }
  const homeMarkup = fs.readFileSync(path.join(__dirname, '..', 'pages/home/home.wxml'), 'utf8');
  const monthHeader = homeMarkup.indexOf('class="month-header"');
  const weekdays = homeMarkup.indexOf('class="weekdays"');
  assert.ok(monthHeader > 0 && monthHeader < weekdays);
  assert.doesNotMatch(homeMarkup, /bindtap="openStats"/);
});

test('empty statistics keep the period clear and group the record action', () => {
  const markup = fs.readFileSync(path.join(__dirname, '..', 'pages/stats/stats.wxml'), 'utf8');
  assert.match(markup, /class="period-range"[^>]*>{{periodLabel}}<\/text>/);
  assert.match(markup, /wx:if="{{hasPeriodRecords}}" class="summary-card surface"/);
  assert.match(markup, /wx:if="{{!hasPeriodRecords}}" class="stats-empty"/);
  assert.match(markup, /class="empty-content"[\s\S]*class="empty-emblem"[\s\S]*class="empty-title"[\s\S]*bindtap="startRecord"/);
  assert.doesNotMatch(markup, /class="empty-track /);
  assert.match(markup, /wx:for="{{buckets}}"/);
  assert.match(markup, /{{activePeriodLabel}}还没有记录/);
  assert.match(markup, /bindtap="startRecord">记录一杯<\/view>/);
  assert.doesNotMatch(markup, /看看这段时间的记录|只统计这台设备上保存的记录|不代表这段时间没有喝/);
});

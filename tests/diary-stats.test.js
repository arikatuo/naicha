const test = require('node:test');
const assert = require('node:assert/strict');
const { getPeriodStats } = require('../utils/diary-stats');

const cup = (date, calories, createdAt = 0) => ({ date, calories, createdAt });

test('current week starts Monday, counts cups and distinct recorded days, and follows record date', () => {
  const records = [
    cup('2026-09-27', 50),
    cup('2026-09-28', 200, Date.parse('2026-10-04')),
    cup('2026-09-29', 300),
    cup('2026-09-29', 350),
    cup('2026-10-04', 400),
    cup('2026-10-05', 500)
  ];
  const stats = getPeriodStats(records, 'week', new Date(2026, 8, 29));
  assert.equal(stats.label, '09/28–10/04');
  assert.deepEqual([stats.cups, stats.days, stats.calories], [4, 3, 1250]);
  assert.deepEqual(stats.buckets.map((bucket) => bucket.count), [1, 2, 0, 0, 0, 0, 1]);
  assert.deepEqual(stats.buckets.map((bucket) => bucket.focusDate), [
    '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01',
    '2026-10-02', '2026-10-03', '2026-10-04'
  ]);
});

test('week handles Sunday and year rollover', () => {
  const stats = getPeriodStats([cup('2025-12-29', 100), cup('2026-01-04', 200), cup('2026-01-05', 300)], 'week', new Date(2026, 0, 4));
  assert.deepEqual([stats.cups, stats.days, stats.calories], [2, 2, 300]);
  assert.equal(stats.buckets[0].focusDate, '2025-12-29');
  assert.equal(stats.buckets[6].focusDate, '2026-01-04');
  assert.deepEqual(stats.buckets.map((bucket) => bucket.count), [1, 0, 0, 0, 0, 0, 1]);
});

test('month groups calendar rows from Monday and excludes neighboring-month dates', () => {
  const stats = getPeriodStats([
    cup('2026-08-31', 100), cup('2026-09-01', 200), cup('2026-09-06', 250),
    cup('2026-09-07', 300), cup('2026-09-30', 400), cup('2026-10-01', 500)
  ], 'month', new Date(2026, 8, 29));
  assert.equal(stats.label, '2026年9月');
  assert.deepEqual([stats.cups, stats.days, stats.calories], [4, 4, 1150]);
  assert.deepEqual(stats.buckets, [
    { label: '1–6日', count: 2, focusDate: '2026-09-01' },
    { label: '7–13日', count: 1, focusDate: '2026-09-07' },
    { label: '14–20日', count: 0, focusDate: '2026-09-14' },
    { label: '21–27日', count: 0, focusDate: '2026-09-21' },
    { label: '28–30日', count: 1, focusDate: '2026-09-30' }
  ]);
});

test('leap-day and year buckets use local calendar dates', () => {
  const records = [cup('2028-02-29', 180), cup('2028-12-31', 220), cup('2027-12-31', 500), cup('2029-01-01', 600)];
  const february = getPeriodStats(records, 'month', new Date(2028, 1, 29));
  assert.equal(february.cups, 1);
  assert.equal(february.buckets.at(-1).label, '28–29日');
  assert.equal(february.buckets.at(-1).count, 1);
  assert.equal(february.buckets.at(-1).focusDate, '2028-02-29');
  const year = getPeriodStats(records, 'year', new Date(2028, 8, 29));
  assert.deepEqual([year.cups, year.days, year.calories], [2, 2, 400]);
  assert.equal(year.buckets.length, 12);
  assert.equal(year.buckets[1].count, 1);
  assert.equal(year.buckets[1].focusDate, '2028-02-29');
  assert.equal(year.buckets[11].count, 1);
});

test('empty periods retain tappable buckets and malformed dates cannot inflate totals', () => {
  const stats = getPeriodStats([cup('2026-02-30', 100), cup('2026-09-01', NaN)], 'week', new Date(2026, 8, 29));
  assert.deepEqual([stats.cups, stats.days, stats.calories], [0, 0, 0]);
  assert.equal(stats.buckets.length, 7);
  assert.equal(stats.buckets[0].focusDate, '2026-09-28');
  assert.throws(() => getPeriodStats([], 'quarter', new Date(2026, 8, 29)));
});

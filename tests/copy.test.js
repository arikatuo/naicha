const test = require('node:test');
const assert = require('node:assert/strict');
const { getResultCopy } = require('../utils/copy');

const copywriting = require('../data/copywriting');

test('getResultCopy keeps the result neutral while the theme changes', () => {
  const expectations = [
    [160, 'fresh'], [260, 'fresh'],
    [360, 'milkTea'], [460, 'milkTea'],
    [560, 'warm'], [660, 'warm'],
    [760, 'cocoa'], [900, 'cocoa']
  ];

  for (const [calories, theme] of expectations) {
    assert.deepEqual(getResultCopy(calories, copywriting), {
      title: '热量有数，快乐照旧。', badge: '这一杯', theme
    });
  }
});

test('getResultCopy returns a complete neutral fallback', () => {
  assert.deepEqual(getResultCopy(-1, copywriting), {
    title: '热量有数，快乐照旧。',
    badge: '这一杯',
    theme: 'milkTea'
  });
});

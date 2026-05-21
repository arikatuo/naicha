const test = require('node:test');
const assert = require('node:assert/strict');
const { buildEquivalentCards } = require('../utils/equivalents');

const equivalents = [
  { id: 'fries', name: '大薯', unit: '包', kind: 'count', caloriesPerUnit: 312, icon: '/assets/icons/fries.png' },
  { id: 'pork', name: '肥肉', unit: 'g', kind: 'grams', caloriesPer100g: 807, icon: '/assets/icons/pork.png' },
  { id: 'rice', name: '米饭', unit: '碗', kind: 'count', caloriesPerUnit: 232, icon: '/assets/icons/rice.png' },
  { id: 'jogging', name: '慢跑', unit: '分钟', kind: 'minutes', caloriesPerMinute: 10.8, icon: '/assets/icons/jogging.png' }
];

test('buildEquivalentCards formats the four fixed equivalent cards', () => {
  const cards = buildEquivalentCards(486, equivalents);

  assert.deepEqual(cards.map((card) => card.text), [
    '约 1.6 包大薯',
    '约 60g 肥肉',
    '约 2.1 碗米饭',
    '约慢跑 45 分钟消耗'
  ]);
});

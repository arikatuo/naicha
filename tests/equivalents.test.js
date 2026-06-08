const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../utils/data-store');
const { buildEquivalentCards } = require('../utils/equivalents');

const equivalents = [
  { id: 'fries', name: '大薯', unit: '包', kind: 'count', caloriesPerUnit: 312, icon: '/assets/icons/fries.png' },
  { id: 'pork', name: '肥肉', unit: 'g', kind: 'grams', caloriesPer100g: 807, icon: '/assets/icons/pork.png' },
  { id: 'rice', name: '米饭', unit: '碗', kind: 'count', caloriesPerUnit: 232, icon: '/assets/icons/rice.png' },
  { id: 'jogging', name: '慢跑', unit: '分钟', kind: 'minutes', caloriesPerMinute: 10.8, icon: '/assets/icons/jogging.png' },
  { id: 'americano', name: '美式咖啡', unit: '杯', kind: 'count', caloriesPerUnit: 10, icon: '/assets/icons/milk-tea-cup.png' },
  { id: 'ice-cream', name: '雪糕', unit: '根', kind: 'count', caloriesPerUnit: 120, icon: '/assets/icons/result-clay-card.png' },
  { id: 'apple', name: '苹果', unit: '个', kind: 'count', caloriesPerUnit: 95, icon: '/assets/icons/toppings.png' },
  { id: 'bike', name: '骑共享单车', unit: '分钟', kind: 'minutes', caloriesPerMinute: 6.5, icon: '/assets/icons/bike.png' }
];

test('buildEquivalentCards formats the eight fixed equivalent cards', () => {
  const cards = buildEquivalentCards(486, equivalents);

  assert.equal(cards.length, 8);
  assert.equal(cards[0].hint, '还有 7 个对比，左右滑动');
  assert.equal(cards[7].hint, '已经看完啦，换一杯试试');
  assert.deepEqual(cards.map((card) => card.text), [
    '约 1.6 包大薯',
    '约 60g 肥肉',
    '约 2.1 碗米饭',
    '约慢跑 45 分钟消耗',
    '约 48.6 杯美式咖啡',
    '约 4.1 根雪糕',
    '约 5.1 个苹果',
    '约骑共享单车 75 分钟消耗'
  ]);
});

test('stored equivalent set includes the four surprise comparison cards', () => {
  assert.equal(store.equivalents.length, 8);
  assert.deepEqual(store.equivalents.slice(4).map((item) => item.id), [
    'americano',
    'ice-cream',
    'apple',
    'bike'
  ]);
});

test('shared bike equivalent uses a bike icon instead of the jogging figure', () => {
  const bike = store.equivalents.find((item) => item.id === 'bike');

  assert.equal(bike.icon, '/assets/icons/bike.png');
  assert.notEqual(bike.icon, '/assets/icons/jogging.png');
});

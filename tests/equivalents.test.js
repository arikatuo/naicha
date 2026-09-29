const test = require('node:test');
const assert = require('node:assert/strict');
const store = require('../utils/data-store');
const { buildEquivalentCards } = require('../utils/equivalents');

test('result comparisons use familiar foods and drinks without exercise offsets', () => {
  const cards = buildEquivalentCards(486, store.equivalents);

  assert.deepEqual(cards.map((card) => card.id), ['fries', 'rice', 'americano', 'ice-cream', 'apple']);
  assert.deepEqual(cards.map((card) => card.text), [
    '约 1.6 包大薯',
    '约 2.1 碗米饭',
    '约 48.6 杯美式咖啡',
    '约 4.1 根雪糕',
    '约 5.1 个苹果'
  ]);
  assert.equal(cards[0].hint, '麦当劳大薯条');
  assert.ok(cards.every((card) => !/肥肉|慢跑|骑车消耗/.test(card.text)));
});

test('food and drink comparisons use their own artwork', () => {
  const icons = Object.fromEntries(store.equivalents.map((item) => [item.id, item.icon]));

  assert.equal(icons.americano, '/assets/icons/americano.png');
  assert.equal(icons['ice-cream'], '/assets/icons/ice-cream.png');
  assert.equal(icons.apple, '/assets/icons/apple.png');
  assert.notEqual(icons.americano, '/assets/icons/milk-tea-cup.png');
  assert.notEqual(icons['ice-cream'], '/assets/icons/result-clay-card.png');
});

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateBrandDrinkCalories,
  calculateCustomDrinkCalories,
  sumToppingCalories
} = require('../utils/calculator');

test('brand drink uses reference base and adds extra toppings after size and sweetness adjustment', () => {
  const drink = {
    baseCalories: 420,
    defaultSweetness: 'normal',
    sweetnessCalorieImpact: 'medium'
  };
  const size = { multiplier: 1.25 };
  const sweetness = { multipliers: { medium: 0.94 } };
  const toppings = [{ calories: 120 }, { calories: 70 }];

  const result = calculateBrandDrinkCalories({ drink, size, sweetness, extraToppings: toppings });

  assert.equal(result, 684);
});

test('custom drink multiplies base by size and sweetness then adds toppings', () => {
  const base = { calories: 320, sweetnessCalorieImpact: 'medium' };
  const size = { multiplier: 1.25 };
  const sweetness = { multipliers: { medium: 1.12 } };
  const toppings = [{ calories: 120 }];

  const result = calculateCustomDrinkCalories({ base, size, sweetness, toppings });

  assert.equal(result, 568);
});

test('sumToppingCalories ignores missing topping values', () => {
  assert.equal(sumToppingCalories([{ calories: 120 }, null, { name: '空' }]), 120);
});

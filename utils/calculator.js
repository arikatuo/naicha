function roundCalories(value) {
  return Math.round(Number(value) || 0);
}

function sumToppingCalories(toppings) {
  return (toppings || []).reduce((sum, topping) => {
    return sum + (Number(topping && topping.calories) || 0);
  }, 0);
}

function getSweetnessMultiplier(sweetness, impact) {
  if (!sweetness || !sweetness.multipliers) {
    return 1;
  }
  return Number(sweetness.multipliers[impact]) || 1;
}

function calculateBrandDrinkCalories({ drink, size, sweetness, extraToppings }) {
  const sizeId = size && size.id;
  const documentedSizeCalories = drink && drink.sizeCalories && sizeId
    ? Number(drink.sizeCalories[sizeId])
    : NaN;
  const hasDocumentedSizeCalories = Number.isFinite(documentedSizeCalories);
  const sizeMultiplier = hasDocumentedSizeCalories ? 1 : Number(size && size.multiplier) || 1;
  const impact = drink && drink.sweetnessCalorieImpact ? drink.sweetnessCalorieImpact : 'medium';
  const sweetnessMultiplier = getSweetnessMultiplier(sweetness, impact);
  const baseCalories = hasDocumentedSizeCalories ? documentedSizeCalories : Number(drink && drink.baseCalories) || 0;
  const toppingCalories = sumToppingCalories(extraToppings);

  return roundCalories(baseCalories * sizeMultiplier * sweetnessMultiplier + toppingCalories);
}

function calculateCustomDrinkCalories({ base, size, sweetness, toppings }) {
  const sizeMultiplier = Number(size && size.multiplier) || 1;
  const impact = base && base.sweetnessCalorieImpact ? base.sweetnessCalorieImpact : 'medium';
  const sweetnessMultiplier = getSweetnessMultiplier(sweetness, impact);
  const baseCalories = Number(base && base.calories) || 0;
  const toppingCalories = sumToppingCalories(toppings);

  return roundCalories(baseCalories * sizeMultiplier * sweetnessMultiplier + toppingCalories);
}

module.exports = {
  calculateBrandDrinkCalories,
  calculateCustomDrinkCalories,
  roundCalories,
  sumToppingCalories
};

function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function formatOneDecimal(value) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

function buildEquivalentText(calories, equivalent) {
  if (equivalent.kind === 'count') {
    const amount = formatOneDecimal(calories / equivalent.caloriesPerUnit);
    return `约 ${amount} ${equivalent.unit}${equivalent.name}`;
  }

  if (equivalent.kind === 'grams') {
    const grams = roundToNearest((calories / equivalent.caloriesPer100g) * 100, 5);
    return `约 ${grams}g ${equivalent.name}`;
  }

  if (equivalent.kind === 'minutes') {
    const minutes = roundToNearest(calories / equivalent.caloriesPerMinute, 5);
    return `约${equivalent.name} ${minutes} ${equivalent.unit}消耗`;
  }

  return `约 ${Math.round(calories)} kcal`;
}

function buildEquivalentDisplay(calories, equivalent) {
  if (equivalent.kind === 'count') {
    const count = formatOneDecimal(calories / equivalent.caloriesPerUnit);

    return {
      number: `${count} ${equivalent.unit}`,
      numberMain: `${count}`,
      numberUnit: equivalent.unit,
      label: equivalent.name
    };
  }

  if (equivalent.kind === 'grams') {
    const grams = roundToNearest((calories / equivalent.caloriesPer100g) * 100, 5);

    return {
      number: `${grams}g`,
      numberMain: `${grams}`,
      numberUnit: 'g',
      label: equivalent.name
    };
  }

  if (equivalent.kind === 'minutes') {
    const minutes = roundToNearest(calories / equivalent.caloriesPerMinute, 5);

    return {
      number: `${minutes} ${equivalent.unit}`,
      numberMain: `${minutes}`,
      numberUnit: equivalent.unit,
      label: `${equivalent.name}消耗`
    };
  }

  return {
    number: `${Math.round(calories)} kcal`,
    numberMain: `${Math.round(calories)}`,
    numberUnit: 'kcal',
    label: '热量'
  };
}

function buildEquivalentCards(calories, equivalents) {
  return equivalents.map((equivalent, index) => {
    const remaining = equivalents.length - index - 1;
    const display = buildEquivalentDisplay(calories, equivalent);

    return {
      id: equivalent.id,
      name: equivalent.name,
      icon: equivalent.icon,
      text: buildEquivalentText(calories, equivalent),
      number: display.number,
      numberMain: display.numberMain,
      numberUnit: display.numberUnit,
      label: display.label,
      hint: remaining > 0 ? `还有 ${remaining} 个对比，左右滑动` : '已经看完啦，换一杯试试'
    };
  });
}

module.exports = {
  buildEquivalentCards,
  buildEquivalentDisplay,
  buildEquivalentText,
  roundToNearest
};

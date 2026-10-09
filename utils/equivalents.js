function roundToNearest(value, step) {
  return Math.round(value / step) * step;
}

function formatOneDecimal(value) {
  if (value > 0 && value < 0.05) return '<0.1';
  return (Math.round(value * 10) / 10).toFixed(1);
}

// 低热量的饮品（比如美式）换成薯条是 0.0 包，没有意义：把读起来自然的换算排到前面
function rankEquivalentCards(cards) {
  const score = (card) => {
    const value = Number(card.numberMain);
    if (!Number.isFinite(value)) return 2;
    if (value >= 0.5 && value < 10) return 0;
    if (value >= 10 && value < 30) return 1;
    return 2;
  };
  return cards.map((card, index) => ({ card, index })).sort((a, b) => score(a.card) - score(b.card) || a.index - b.index).map(({ card }) => card);
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

function buildEquivalentHint(equivalent) {
  if (equivalent.id === 'fries') {
    return '麦当劳大薯条';
  }

  if (equivalent.id === 'americano') {
    return `低卡美式，约 ${equivalent.caloriesPerUnit} kcal/${equivalent.unit}`;
  }

  if (equivalent.id === 'apple') {
    return `中等大小，约 ${equivalent.caloriesPerUnit} kcal/${equivalent.unit}`;
  }

  if (equivalent.kind === 'count') {
    return `约 ${equivalent.caloriesPerUnit} kcal/${equivalent.unit}`;
  }

  if (equivalent.kind === 'grams') {
    return `约 ${equivalent.caloriesPer100g} kcal/100g`;
  }

  if (equivalent.kind === 'minutes') {
    return `约 ${equivalent.caloriesPerMinute} kcal/${equivalent.unit}`;
  }

  return '仅供趣味参考';
}

function buildEquivalentCards(calories, equivalents) {
  return equivalents.map((equivalent) => {
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
      hint: buildEquivalentHint(equivalent)
    };
  });
}

module.exports = {
  rankEquivalentCards,
  buildEquivalentCards,
  buildEquivalentDisplay,
  buildEquivalentHint,
  buildEquivalentText,
  roundToNearest
};

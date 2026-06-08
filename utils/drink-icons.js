const drinkIcons = require('../data/drink-icons');

const fallbackByTag = {
  classic: '/assets/icons/drinks/original-tea.png',
  'milk-tea': '/assets/icons/drinks/milk-tea.png',
  fruit: '/assets/icons/drinks/fruit-tea.png',
  'milk-foam': '/assets/icons/drinks/cheese-foam.png',
  fresh: '/assets/icons/drinks/original-tea.png',
  'thick-milk': '/assets/icons/drinks/milk-tea.png',
  toppings: '/assets/icons/drinks/milk-tea.png'
};

function getDrinkIcon(drink) {
  if (drinkIcons[drink.id]) {
    return drinkIcons[drink.id];
  }

  const tags = drink.tagIds || [];
  const matchedTag = tags.find((tag) => fallbackByTag[tag]);

  return matchedTag ? fallbackByTag[matchedTag] : '/assets/icons/drinks/milk-tea.png';
}

module.exports = {
  getDrinkIcon
};

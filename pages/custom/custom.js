const store = require('../../utils/data-store');
const { calculateCustomDrinkCalories } = require('../../utils/calculator');
const { encodePayload } = require('../../utils/nav');

function createToppingOptions(selectedIds = []) {
  return store.toppings.map((topping) => ({
    ...topping,
    selected: selectedIds.includes(topping.id)
  }));
}

Page({
  data: {
    bases: store.bases,
    cupSizes: store.cupSizes,
    sweetnessLevels: store.sweetnessLevels,
    toppings: store.toppings,
    toppingOptions: createToppingOptions(),
    selectedBaseId: 'milk-tea',
    selectedSizeId: 'medium',
    selectedSweetnessId: 'half',
    selectedToppingIds: [],
    selectedToppingCount: 0
  },

  selectBase(event) {
    this.setData({ selectedBaseId: event.currentTarget.dataset.id });
  },

  selectSize(event) {
    this.setData({ selectedSizeId: event.currentTarget.dataset.id });
  },

  selectSweetness(event) {
    this.setData({ selectedSweetnessId: event.currentTarget.dataset.id });
  },

  toggleTopping(event) {
    const id = event.currentTarget.dataset.id;
    const selected = this.data.selectedToppingIds.slice();

    if (selected.includes(id)) {
      const next = selected.filter((item) => item !== id);
      this.setData({
        selectedToppingIds: next,
        selectedToppingCount: next.length,
        toppingOptions: createToppingOptions(next)
      });
      return;
    }

    if (selected.length >= 4) {
      wx.showToast({ title: '先到这里吧，最多选 4 种小料', icon: 'none' });
      return;
    }

    selected.push(id);
    this.setData({
      selectedToppingIds: selected,
      selectedToppingCount: selected.length,
      toppingOptions: createToppingOptions(selected)
    });
  },

  calculate() {
    const base = store.getBaseById(this.data.selectedBaseId);
    const size = store.getCupSizeById(this.data.selectedSizeId);
    const sweetness = store.getSweetnessById(this.data.selectedSweetnessId);
    const toppings = store.getToppingsByIds(this.data.selectedToppingIds);
    const calories = calculateCustomDrinkCalories({ base, size, sweetness, toppings });
    const toppingNames = toppings.map((item) => item.name).join('、');
    const drinkName = toppingNames ? `${base.name} + ${toppingNames}` : base.name;

    wx.navigateTo({
      url: `/pages/result/result?payload=${encodePayload({ mode: 'custom', drinkName, calories })}`
    });
  }
});

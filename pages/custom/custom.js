const store = require('../../utils/data-store');
const { calculateCustomDrinkCalories } = require('../../utils/calculator');
const { encodePayload } = require('../../utils/nav');

Page({
  data: {
    bases: store.bases,
    cupSizes: store.cupSizes,
    sweetnessLevels: store.sweetnessLevels,
    toppings: store.toppings,
    toppingOptions: store.toppings.map((topping) => ({ ...topping, selected: false })),
    selectedBaseId: 'milk-tea',
    selectedSizeId: 'medium',
    selectedSweetnessId: 'half',
    selectedToppingIds: []
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
        toppingOptions: this.data.toppingOptions.map((topping) => ({
          ...topping,
          selected: next.includes(topping.id)
        }))
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
      toppingOptions: this.data.toppingOptions.map((topping) => ({
        ...topping,
        selected: selected.includes(topping.id)
      }))
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

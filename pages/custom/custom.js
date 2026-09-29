const store = require('../../utils/data-store');
const { calculateCustomDrinkCalories } = require('../../utils/calculator');
const { encodePayload, decodePayload } = require('../../utils/nav');
const { isValidDateKey } = require('../../utils/calendar');

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
    selectedToppingCount: 0,
    recordDate: ''
  },

  onLoad(options) {
    const prefill = decodePayload(options && options.prefill);
    const selectedToppingIds = prefill && Array.isArray(prefill.toppingIds)
      ? prefill.toppingIds.filter((id) => store.getToppingById(id)).slice(0, 4)
      : [];
    this.setData({
      recordDate: options && isValidDateKey(options.recordDate) ? options.recordDate : '',
      selectedBaseId: prefill && store.getBaseById(prefill.baseId) ? prefill.baseId : 'milk-tea',
      selectedSizeId: prefill && store.getCupSizeById(prefill.sizeId) ? prefill.sizeId : 'medium',
      selectedSweetnessId: prefill && store.getSweetnessById(prefill.sweetnessId) ? prefill.sweetnessId : 'half',
      selectedToppingIds,
      selectedToppingCount: selectedToppingIds.length,
      toppingOptions: createToppingOptions(selectedToppingIds)
    });
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
      url: `/pages/result/result?payload=${encodePayload({
        mode: 'custom', drinkName, calories, recordDate: this.data.recordDate,
        config: {
          baseId: this.data.selectedBaseId,
          sizeId: this.data.selectedSizeId,
          sweetnessId: this.data.selectedSweetnessId,
          toppingIds: this.data.selectedToppingIds
        }
      })}`
    });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/custom/custom'
    };
  }
});

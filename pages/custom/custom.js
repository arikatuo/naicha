const store = require('../../utils/data-store');
const { calculateCustomDrinkCalories } = require('../../utils/calculator');
const { encodePayload, decodePayload } = require('../../utils/nav');
const { dateKey, isValidDateKey, relativeDateLabel } = require('../../utils/calendar');
const { saveAndShowInCalendar } = require('../../utils/record-flow');

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
    recordDate: '',
    recordDateLabel: '今天',
    liveCalories: 0
  },

  onLoad(options) {
    const prefill = decodePayload(options && options.prefill);
    const selectedToppingIds = prefill && Array.isArray(prefill.toppingIds)
      ? prefill.toppingIds.filter((id) => store.getToppingById(id)).slice(0, 4)
      : [];
    const recordDate = options && isValidDateKey(options.recordDate) ? options.recordDate : '';
    this.setData({
      recordDate,
      recordDateLabel: recordDate ? relativeDateLabel(recordDate, dateKey(new Date())) : '今天',
      selectedBaseId: prefill && store.getBaseById(prefill.baseId) ? prefill.baseId : 'milk-tea',
      selectedSizeId: prefill && store.getCupSizeById(prefill.sizeId) ? prefill.sizeId : 'medium',
      selectedSweetnessId: prefill && store.getSweetnessById(prefill.sweetnessId) ? prefill.sweetnessId : 'half',
      selectedToppingIds,
      selectedToppingCount: selectedToppingIds.length,
      toppingOptions: createToppingOptions(selectedToppingIds)
    });
    this.updateLiveCalories();
  },

  selectBase(event) {
    this.setData({ selectedBaseId: event.currentTarget.dataset.id });
    this.updateLiveCalories();
  },

  selectSize(event) {
    this.setData({ selectedSizeId: event.currentTarget.dataset.id });
    this.updateLiveCalories();
  },

  selectSweetness(event) {
    this.setData({ selectedSweetnessId: event.currentTarget.dataset.id });
    this.updateLiveCalories();
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
      this.updateLiveCalories();
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
    this.updateLiveCalories();
  },

  // 当前搭配的名称、热量和配置；实时热量条和两个提交动作共用
  buildPayload() {
    const base = store.getBaseById(this.data.selectedBaseId);
    const size = store.getCupSizeById(this.data.selectedSizeId);
    const sweetness = store.getSweetnessById(this.data.selectedSweetnessId);
    const toppings = store.getToppingsByIds(this.data.selectedToppingIds);
    if (!base || !size || !sweetness) return null;
    const calories = calculateCustomDrinkCalories({ base, size, sweetness, toppings });
    const toppingNames = toppings.map((item) => item.name).join('、');
    return {
      mode: 'custom',
      drinkName: toppingNames ? `${base.name} + ${toppingNames}` : base.name,
      calories,
      recordDate: this.data.recordDate,
      config: {
        baseId: this.data.selectedBaseId,
        sizeId: this.data.selectedSizeId,
        sweetnessId: this.data.selectedSweetnessId,
        toppingIds: this.data.selectedToppingIds
      }
    };
  },

  updateLiveCalories() {
    const payload = this.buildPayload();
    this.setData({ liveCalories: payload ? payload.calories : 0 });
  },

  calculate() {
    const payload = this.buildPayload();
    if (!payload) return;
    wx.navigateTo({ url: `/pages/result/result?payload=${encodePayload(payload)}` });
  },

  // 已经知道热量、只想记下来的人不用再看结果页
  saveNow() {
    const payload = this.buildPayload();
    if (!payload) return;
    try {
      saveAndShowInCalendar({
        date: payload.recordDate || dateKey(new Date()),
        mode: payload.mode,
        drinkName: payload.drinkName,
        calories: payload.calories,
        config: payload.config
      });
    } catch (error) {
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/custom/custom'
    };
  }
});

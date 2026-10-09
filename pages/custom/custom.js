const store = require('../../utils/data-store');
const { calculateCustomDrinkCalories } = require('../../utils/calculator');
const { encodePayload, decodePayload } = require('../../utils/nav');
const { dateKey, isValidDateKey, relativeDateLabel } = require('../../utils/calendar');
const { saveAndShowInCalendar } = require('../../utils/record-flow');

const COLLAPSED_TOPPINGS = 10;

function scopeOf(baseId) {
  const base = store.getBaseById(baseId);
  return base && base.category === 'coffee' ? 'coffee' : 'tea';
}

function sweetnessAdjustable(baseId) {
  const base = store.getBaseById(baseId);
  return !base || base.sweetnessAdjustable !== false;
}

// 小料列表：常用的先显示，已选中的永远可见；其余折叠
function buildToppingView(baseId, selectedIds, showAll) {
  const all = store.getToppingsForScope(scopeOf(baseId)).map((topping) => ({
    ...topping,
    selected: selectedIds.includes(topping.id)
  }));
  const visible = showAll ? all : all.filter((topping, index) => index < COLLAPSED_TOPPINGS || topping.selected);
  return {
    toppingOptions: all,
    visibleToppingOptions: visible,
    hiddenToppingCount: all.length - visible.length,
    canCollapseToppings: all.length > COLLAPSED_TOPPINGS
  };
}

Page({
  data: {
    teaBases: store.bases.filter((base) => base.category !== 'coffee'),
    coffeeBases: store.bases.filter((base) => base.category === 'coffee'),
    sweetnessVisible: true,
    toppingStep: 4,
    showAllToppings: false,
    visibleToppingOptions: [],
    hiddenToppingCount: 0,
    canCollapseToppings: false,
    cupSizes: store.cupSizes,
    sweetnessLevels: store.sweetnessLevels,
    toppings: store.toppings,
    toppingOptions: [],
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
    const recordDate = options && isValidDateKey(options.recordDate) ? options.recordDate : '';
    const selectedBaseId = prefill && store.getBaseById(prefill.baseId) ? prefill.baseId : 'milk-tea';
    // 只保留这个基底能加的小料，避免咖啡基底带着珍珠
    const allowedToppingIds = store.getToppingsForScope(scopeOf(selectedBaseId)).map((topping) => topping.id);
    const selectedToppingIds = prefill && Array.isArray(prefill.toppingIds)
      ? prefill.toppingIds.filter((id) => allowedToppingIds.includes(id)).slice(0, 4)
      : [];
    this.setData({
      recordDate,
      recordDateLabel: recordDate ? relativeDateLabel(recordDate, dateKey(new Date())) : '今天',
      selectedBaseId,
      selectedSizeId: prefill && store.getCupSizeById(prefill.sizeId) ? prefill.sizeId : 'medium',
      selectedSweetnessId: sweetnessAdjustable(selectedBaseId) && prefill && store.getSweetnessById(prefill.sweetnessId) ? prefill.sweetnessId : 'half',
      selectedToppingIds,
      selectedToppingCount: selectedToppingIds.length,
      sweetnessVisible: sweetnessAdjustable(selectedBaseId),
      toppingStep: sweetnessAdjustable(selectedBaseId) ? 4 : 3,
      showAllToppings: false,
      ...buildToppingView(selectedBaseId, selectedToppingIds, false)
    });
    this.updateLiveCalories();
  },

  selectBase(event) {
    const selectedBaseId = event.currentTarget.dataset.id;
    const allowed = store.getToppingsForScope(scopeOf(selectedBaseId)).map((topping) => topping.id);
    const selectedToppingIds = this.data.selectedToppingIds.filter((id) => allowed.includes(id));
    const adjustable = sweetnessAdjustable(selectedBaseId);
    this.setData({
      selectedBaseId,
      selectedToppingIds,
      selectedToppingCount: selectedToppingIds.length,
      selectedSweetnessId: adjustable ? this.data.selectedSweetnessId : 'half',
      sweetnessVisible: adjustable,
      toppingStep: adjustable ? 4 : 3,
      ...buildToppingView(selectedBaseId, selectedToppingIds, this.data.showAllToppings)
    });
    this.updateLiveCalories();
  },

  toggleAllToppings() {
    const showAllToppings = !this.data.showAllToppings;
    this.setData({
      showAllToppings,
      ...buildToppingView(this.data.selectedBaseId, this.data.selectedToppingIds, showAllToppings)
    });
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
        ...buildToppingView(this.data.selectedBaseId, next, this.data.showAllToppings)
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
      ...buildToppingView(this.data.selectedBaseId, selected, this.data.showAllToppings)
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

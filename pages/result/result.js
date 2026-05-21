const store = require('../../utils/data-store');
const { decodePayload } = require('../../utils/nav');
const { buildEquivalentCards } = require('../../utils/equivalents');
const { getResultCopy } = require('../../utils/copy');

Page({
  data: {
    payload: null,
    cards: [],
    resultCopy: { title: '这杯快乐有点认真。', theme: 'milkTea' },
    disclaimer: store.copywriting.disclaimer
  },

  onLoad(options) {
    const payload = decodePayload(options.payload);

    if (!payload) {
      wx.showToast({ title: '结果走丢了，请重新计算', icon: 'none' });
      return;
    }

    this.setData({
      payload,
      cards: buildEquivalentCards(payload.calories, store.equivalents),
      resultCopy: getResultCopy(payload.calories, store.copywriting)
    });
  },

  recalculate() {
    wx.navigateBack({ delta: 1 });
  },

  generatePoster() {
    wx.showToast({ title: '海报功能下一步接入', icon: 'none' });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/home/home'
    };
  }
});

const store = require('../../utils/data-store');
const { decodePayload } = require('../../utils/nav');
const { buildEquivalentCards } = require('../../utils/equivalents');
const { getResultCopy } = require('../../utils/copy');
const { drawPoster } = require('../../utils/poster');

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
    if (!this.data.payload) {
      wx.showToast({ title: '结果走丢了，请重新计算', icon: 'none' });
      return;
    }

    const ctx = wx.createCanvasContext('posterCanvas', this);
    drawPoster({
      ctx,
      payload: this.data.payload,
      cards: this.data.cards,
      resultCopy: this.data.resultCopy,
      width: 360,
      height: 640
    });

    ctx.draw(false, () => {
      wx.canvasToTempFilePath({
        canvasId: 'posterCanvas',
        width: 360,
        height: 640,
        destWidth: 1080,
        destHeight: 1920,
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
            fail: () => wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
          });
        },
        fail: () => wx.showToast({ title: '海报生成失败', icon: 'none' })
      }, this);
    });
  },

  onShareAppMessage() {
    return {
      title: store.copywriting.shareTitle,
      path: '/pages/home/home'
    };
  }
});

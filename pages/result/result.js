const store = require('../../utils/data-store');
const { decodePayload, encodePayload } = require('../../utils/nav');
const { buildEquivalentCards } = require('../../utils/equivalents');
const { getResultCopy } = require('../../utils/copy');
const { drawPoster } = require('../../utils/poster');

function buildShareTitle(payload, card) {
  if (!payload) {
    return store.copywriting.shareTitle;
  }

  const drinkName = payload.drinkName || '这杯奶茶';
  const calories = payload.calories || 0;
  const equivalentText = card && card.text ? `，等于${card.text.replace(/^约\s*/, '')}` : '';
  return `我这杯${drinkName}约 ${calories} kcal${equivalentText}`;
}

Page({
  data: {
    payload: null,
    cards: [],
    currentEquivalentIndex: 0,
    posterPreviewOpen: false,
    previewPosterPath: '',
    posterGenerating: false,
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

  onEquivalentChange(event) {
    this.setData({ currentEquivalentIndex: event.detail.current || 0 });
  },

  generatePoster() {
    if (!this.data.payload) {
      wx.showToast({ title: '结果走丢了，请重新计算', icon: 'none' });
      return;
    }

    this.setData({ posterGenerating: true });
    const ctx = wx.createCanvasContext('posterCanvas', this);
    const highlightCard = this.data.cards[this.data.currentEquivalentIndex] || this.data.cards[0];

    drawPoster({
      ctx,
      payload: this.data.payload,
      cards: this.data.cards,
      highlightCard,
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
          this.setData({
            previewPosterPath: res.tempFilePath,
            posterPreviewOpen: true,
            posterGenerating: false
          });
        },
        fail: () => {
          this.setData({ posterGenerating: false });
          wx.showToast({ title: '海报生成失败', icon: 'none' });
        }
      }, this);
    });
  },

  closePosterPreview() {
    this.setData({ posterPreviewOpen: false });
  },

  noop() {},

  savePoster() {
    if (!this.data.previewPosterPath) {
      wx.showToast({ title: '请先生成分享图', icon: 'none' });
      return;
    }

    wx.saveImageToPhotosAlbum({
      filePath: this.data.previewPosterPath,
      success: () => {
        this.setData({ posterPreviewOpen: false });
        wx.showToast({ title: '已保存到相册', icon: 'success' });
      },
      fail: () => wx.showToast({ title: '保存失败，请检查相册权限', icon: 'none' })
    });
  },

  onShareAppMessage() {
    const payload = this.data.payload;
    if (!payload) {
      return {
        title: store.copywriting.shareTitle,
        path: '/pages/home/home'
      };
    }

    const currentCard = this.data.cards[this.data.currentEquivalentIndex] || this.data.cards[0];

    return {
      title: buildShareTitle(payload, currentCard),
      path: `/pages/result/result?payload=${encodePayload(payload)}`
    };
  }
});

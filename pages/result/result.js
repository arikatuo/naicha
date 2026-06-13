const store = require('../../utils/data-store');
const { decodePayload, encodePayload } = require('../../utils/nav');
const { buildEquivalentCards } = require('../../utils/equivalents');
const { getResultCopy } = require('../../utils/copy');
const { drawPoster } = require('../../utils/poster');

function buildShareTitle(payload, card) {
  if (!payload) {
    return store.copywriting.shareTitle;
  }

  const calories = payload.calories || 0;
  const equivalentText = card && card.text ? card.text.replace(/^约\s*/, '') : `${calories} kcal`;
  return `我刚才这杯约等于${equivalentText}，你那杯呢？`;
}

function buildDots(cards, activeIndex) {
  return cards.map((card, index) => ({
    id: card.id,
    active: index === activeIndex
  }));
}

Page({
  data: {
    hasResult: false,
    errorMessage: '结果信息不完整，请重新计算一次。',
    payload: null,
    cards: [],
    currentCard: null,
    dots: [],
    heroCard: null,
    currentEquivalentIndex: 0,
    currentEquivalentPosition: 1,
    posterPreviewOpen: false,
    previewPosterPath: '',
    posterGenerating: false,
    resultCopy: { title: '快乐上线，分量刚好有感。', badge: '快乐常驻', theme: 'milkTea' },
    disclaimer: store.copywriting.disclaimer
  },

  onLoad(options) {
    const payload = decodePayload(options.payload);

    if (
      !payload
      || !Number.isFinite(payload.calories)
      || payload.calories < 0
      || typeof payload.drinkName !== 'string'
      || !payload.drinkName.trim()
    ) {
      this.setData({ hasResult: false });
      return;
    }

    const cards = buildEquivalentCards(payload.calories, store.equivalents);
    const currentEquivalentIndex = 0;

    this.setData({
      hasResult: true,
      payload,
      cards,
      currentCard: cards[currentEquivalentIndex] || null,
      dots: buildDots(cards, currentEquivalentIndex),
      heroCard: cards[0] || null,
      currentEquivalentIndex,
      currentEquivalentPosition: currentEquivalentIndex + 1,
      resultCopy: getResultCopy(payload.calories, store.copywriting)
    });
  },

  recalculate() {
    wx.reLaunch({ url: '/pages/home/home' });
  },

  setEquivalentIndex(currentEquivalentIndex) {
    const cards = this.data.cards;
    const total = cards.length;
    if (!total) {
      return;
    }

    const safeIndex = (currentEquivalentIndex + total) % total;
    this.setData({
      currentEquivalentIndex: safeIndex,
      currentEquivalentPosition: safeIndex + 1,
      currentCard: cards[safeIndex],
      dots: buildDots(cards, safeIndex)
    });
  },

  previousEquivalent() {
    this.setEquivalentIndex(this.data.currentEquivalentIndex - 1);
  },

  nextEquivalent() {
    this.setEquivalentIndex(this.data.currentEquivalentIndex + 1);
  },

  generatePoster() {
    if (!this.data.payload) {
      wx.showToast({ title: '结果走丢了，请重新计算', icon: 'none' });
      return;
    }

    this.setData({ posterGenerating: true });
    const ctx = wx.createCanvasContext('posterCanvas', this);
    const highlightCard = this.data.currentCard || this.data.heroCard || this.data.cards[0];

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

    const currentCard = this.data.currentCard || this.data.heroCard || this.data.cards[0];

    return {
      title: buildShareTitle(payload, currentCard),
      path: `/pages/result/result?payload=${encodePayload(payload)}`
    };
  }
});
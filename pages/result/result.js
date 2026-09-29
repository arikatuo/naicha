const store = require('../../utils/data-store');
const { decodePayload, encodePayload } = require('../../utils/nav');
const { buildEquivalentCards } = require('../../utils/equivalents');
const { getResultCopy } = require('../../utils/copy');
const { drawPoster, loadCanvasImage } = require('../../utils/poster');
const diary = require('../../utils/diary-store');
const { dateKey, isValidDateKey } = require('../../utils/calendar');

const POSTER_QRCODE_SRC = '/assets/qrcode.png';
const POSTER_CUP_SRC = '/assets/icons/milk-tea-cup.png';
const POSTER_WIDTH = 360;
const POSTER_HEIGHT = 640;
const POSTER_RENDER_SCALE = 2;
const POSTER_EXPORT_WIDTH = 1080;
const POSTER_EXPORT_HEIGHT = 1920;

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

function getPosterCanvas(page) {
  return new Promise((resolve, reject) => {
    page.createSelectorQuery()
      .select('#posterCanvas')
      .fields({ node: true, size: true })
      .exec((results) => {
        const canvas = results && results[0] && results[0].node;
        if (!canvas) {
          reject(new Error('Poster canvas is unavailable'));
          return;
        }
        resolve(canvas);
      });
  });
}

function exportPoster(canvas, page) {
  return new Promise((resolve, reject) => {
    wx.canvasToTempFilePath({
      canvas: canvas,
      width: canvas.width,
      height: canvas.height,
      destWidth: POSTER_EXPORT_WIDTH,
      destHeight: POSTER_EXPORT_HEIGHT,
      success: resolve,
      fail: reject
    }, page);
  });
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
    recordDate: '',
    todayDate: '',
    isShared: false,
    savingRecord: false,
    savedRecordId: '',
    resultCopy: { title: '热量有数，快乐照旧。', badge: '这一杯', theme: 'milkTea' },
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
      recordDate: isValidDateKey(payload.recordDate) ? payload.recordDate : dateKey(new Date()),
      todayDate: dateKey(new Date()),
      isShared: options.shared === '1',
      savingRecord: false,
      savedRecordId: '',
      resultCopy: getResultCopy(payload.calories, store.copywriting)
    });
  },

  recalculate() {
    wx.switchTab({ url: '/pages/lookup/lookup' });
  },

  selectRecordDate(event) {
    this.setData({ recordDate: event.detail.value });
  },

  saveRecord() {
    if (!this.data.payload || this.data.isShared || this.data.savingRecord || this.data.savedRecordId) return;
    this.setData({ savingRecord: true });
    try {
      const { payload, recordDate } = this.data;
      const record = diary.saveRecord({
        date: recordDate,
        mode: payload.mode,
        brandName: payload.brandName,
        drinkName: payload.drinkName,
        calories: payload.calories,
        config: payload.config
      });
      this.setData({ savingRecord: false, savedRecordId: record.id });
      const app = typeof getApp === 'function' ? getApp() : null;
      if (app && app.globalData) {
        app.globalData.focusDate = recordDate;
        app.globalData.focusRecordId = record.id;
      }
      wx.switchTab({ url: '/pages/home/home' });
    } catch (error) {
      this.setData({ savingRecord: false });
      wx.showToast({ title: '保存失败，请重试', icon: 'none' });
    }
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

  onEquivalentChange(event) {
    this.setEquivalentIndex(event.detail.current || 0);
  },

  previousEquivalent() {
    this.setEquivalentIndex(this.data.currentEquivalentIndex - 1);
  },

  nextEquivalent() {
    this.setEquivalentIndex(this.data.currentEquivalentIndex + 1);
  },

  async generatePoster() {
    if (!this.data.payload) {
      wx.showToast({ title: '结果走丢了，请重新计算', icon: 'none' });
      return;
    }

    this.setData({ posterGenerating: true });

    try {
      const highlightCard = this.data.currentCard || this.data.heroCard || this.data.cards[0];
      const canvas = await getPosterCanvas(this);

      canvas.width = POSTER_WIDTH * POSTER_RENDER_SCALE;
      canvas.height = POSTER_HEIGHT * POSTER_RENDER_SCALE;

      const ctx = canvas.getContext('2d');
      ctx.scale(POSTER_RENDER_SCALE, POSTER_RENDER_SCALE);

      const [cup, equivalent, qrcode] = await Promise.all([
        loadCanvasImage(canvas, POSTER_CUP_SRC),
        highlightCard && highlightCard.icon
          ? loadCanvasImage(canvas, highlightCard.icon)
          : Promise.resolve(null),
        loadCanvasImage(canvas, POSTER_QRCODE_SRC)
      ]);

      drawPoster({
        ctx,
        payload: this.data.payload,
        cards: this.data.cards,
        highlightCard,
        resultCopy: this.data.resultCopy,
        width: POSTER_WIDTH,
        height: POSTER_HEIGHT,
        images: { cup, equivalent, qrcode }
      });

      const result = await exportPoster(canvas, this);
      this.setData({
        previewPosterPath: result.tempFilePath,
        posterPreviewOpen: true,
        posterGenerating: false
      });
    } catch (error) {
      console.error('Poster generation failed', error);
      this.setData({ posterGenerating: false });
      wx.showToast({ title: '海报生成失败，请重试', icon: 'none' });
    }
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
      path: `/pages/result/result?payload=${encodePayload({
        mode: payload.mode,
        brandName: payload.brandName,
        drinkName: payload.drinkName,
        calories: payload.calories
      })}&shared=1`
    };
  }
});

const store = require('../../utils/data-store');
const diary = require('../../utils/diary-store');
const { dateKey, monthCells, shiftMonth } = require('../../utils/calendar');
const { encodePayload } = require('../../utils/nav');

function displayDate(key) {
  const [, month, day] = key.split('-').map(Number);
  return `${month}月${day}日`;
}

Page({
  data: {
    year: 0,
    month: 0,
    monthLabel: '',
    cells: [],
    selectedDate: '',
    todayDate: '',
    selectedDateLabel: '',
    selectedRecords: [],
    selectedCalories: 0,
    hasRecords: false,
    hasSelectedRecords: false,
    monthCount: 0,
    latestRecord: null,
    justSavedRecordId: '',
    justSavedRecord: null,
    recordButtonLabel: '选一杯，看看热量',
    selectedInFuture: false,
    storageError: false
  },

  onLoad() {
    const today = new Date();
    this.setData({ year: today.getFullYear(), month: today.getMonth() + 1, selectedDate: dateKey(today) });
  },

  onShow() {
    const app = typeof getApp === 'function' ? getApp() : null;
    const focusDate = app && app.globalData && app.globalData.focusDate;
    const focusRecordId = app && app.globalData && app.globalData.focusRecordId;
    if (focusDate) {
      const [year, month] = focusDate.split('-').map(Number);
      this.setData({ year, month, selectedDate: focusDate });
      app.globalData.focusDate = '';
    }
    this.setData({ justSavedRecordId: focusRecordId || '' });
    if (app && app.globalData) app.globalData.focusRecordId = '';
    this.refresh();
  },

  refresh() {
    try {
      const records = diary.getRecords();
      const { year, month, selectedDate } = this.data;
      const today = dateKey(new Date());
      const selectedRecords = records.filter((record) => record.date === selectedDate);
      this.setData({
        monthLabel: `${year}年${month}月`,
        cells: monthCells(year, month, records, selectedDate).map((cell) => ({ ...cell, today: cell.date === today })),
        selectedDateLabel: displayDate(selectedDate),
        todayDate: today,
        selectedRecords,
        selectedCalories: selectedRecords.reduce((total, record) => total + (Number.isFinite(record.calories) && record.calories >= 0 ? record.calories : 0), 0),
        hasRecords: records.length > 0,
        hasSelectedRecords: selectedRecords.length > 0,
        monthCount: records.filter((record) => record.date.startsWith(`${year}-${String(month).padStart(2, '0')}-`)).length,
        latestRecord: records[0] || null,
        justSavedRecord: records.find((record) => record.id === this.data.justSavedRecordId) || null,
        recordButtonLabel: selectedDate === today ? '选一杯，看看热量' : `选一杯，补记${displayDate(selectedDate)}`,
        selectedInFuture: selectedDate > today,
        storageError: false
      });
    } catch (error) {
      this.setData({ storageError: true });
    }
  },

  previousMonth() { this.changeMonth(-1); },
  nextMonth() { this.changeMonth(1); },

  changeMonth(offset) {
    const { year, month } = shiftMonth(this.data.year, this.data.month, offset);
    const today = dateKey(new Date());
    const monthPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    const selectedDate = today.startsWith(monthPrefix) ? today : `${monthPrefix}01`;
    this.setData({ year, month, selectedDate, justSavedRecordId: '' });
    this.refresh();
  },

  selectDay(event) {
    const { date } = event.currentTarget.dataset;
    if (!date) return;
    this.setData({ selectedDate: date, justSavedRecordId: '' });
    this.refresh();
  },

  startRecord() {
    if (this.data.selectedInFuture) return;
    wx.navigateTo({ url: `/pages/brands/brands?recordDate=${this.data.selectedDate}` });
  },

  repeatRecord(event) {
    const record = this.data.selectedRecords.find((item) => item.id === event.currentTarget.dataset.id)
      || (this.data.latestRecord && this.data.latestRecord.id === event.currentTarget.dataset.id ? this.data.latestRecord : null);
    if (!record) return;
    const config = record.config || {};
    if (record.mode === 'brand' && config.brandId && config.drinkId) {
      wx.navigateTo({ url: `/pages/drinks/drinks?brandId=${config.brandId}&drinkId=${config.drinkId}&prefill=${encodePayload(config)}` });
    } else if (record.mode === 'custom' && config.baseId) {
      wx.navigateTo({ url: `/pages/custom/custom?prefill=${encodePayload(config)}` });
    } else {
      wx.navigateTo({ url: `/pages/result/result?payload=${encodePayload(record)}` });
    }
  },

  changeRecordDate(event) {
    try {
      diary.updateRecord(event.currentTarget.dataset.id, { date: event.detail.value });
      this.refresh();
      wx.showToast({ title: '日期已修改', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '修改失败，请重试', icon: 'none' });
    }
  },

  removeRecord(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '删除这杯记录？',
      content: '删除后无法恢复。',
      success: ({ confirm }) => {
        if (!confirm) return;
        try {
          diary.deleteRecord(id);
          this.refresh();
        } catch (error) {
          wx.showToast({ title: '删除失败，请重试', icon: 'none' });
        }
      }
    });
  },

  onShareAppMessage() {
    return { title: store.copywriting.shareTitle, path: '/pages/home/home' };
  }
});

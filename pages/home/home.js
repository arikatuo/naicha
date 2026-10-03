const store = require('../../utils/data-store');
const diary = require('../../utils/diary-store');
const { dateKey, monthCells, shiftMonth } = require('../../utils/calendar');
const { repeatRecordUrl, syncTabBar } = require('../../utils/nav');

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
    recordButtonLabel: '记一杯',
    expandedId: '',
    selectedInFuture: false,
    selectedIsToday: true,
    storageError: false
  },

  onLoad() {
    const today = new Date();
    this.setData({ year: today.getFullYear(), month: today.getMonth() + 1, selectedDate: dateKey(today) });
  },

  onShow() {
    syncTabBar(this, 0);
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
        recordButtonLabel: selectedDate === today ? '记一杯' : `补记${displayDate(selectedDate)}的一杯`,
        selectedInFuture: selectedDate > today,
        selectedIsToday: selectedDate === today,
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
    this.setData({ year, month, selectedDate, justSavedRecordId: '', expandedId: '' });
    this.refresh();
  },

  selectDay(event) {
    const { date } = event.currentTarget.dataset;
    if (!date) return;
    this.setData({ selectedDate: date, justSavedRecordId: '', expandedId: '' });
    this.refresh();
  },

  startRecord() {
    if (this.data.selectedInFuture) return;
    const app = typeof getApp === 'function' ? getApp() : null;
    if (app && app.globalData) app.globalData.recordDate = this.data.selectedDate;
    wx.switchTab({ url: '/pages/record/record' });
  },

  toggleMore(event) {
    const { id } = event.currentTarget.dataset;
    this.setData({ expandedId: this.data.expandedId === id ? '' : id });
  },

  repeatRecord(event) {
    const record = this.data.selectedRecords.find((item) => item.id === event.currentTarget.dataset.id)
      || (this.data.latestRecord && this.data.latestRecord.id === event.currentTarget.dataset.id ? this.data.latestRecord : null);
    if (!record) return;
    wx.navigateTo({ url: repeatRecordUrl(record) });
  },

  changeRecordDate(event) {
    try {
      diary.updateRecord(event.currentTarget.dataset.id, { date: event.detail.value });
      this.setData({ expandedId: '' });
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
          this.setData({ expandedId: '' });
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

const { isValidDateKey } = require('./calendar');

const STORAGE_KEY = 'milk-tea-diary-v1';

function storage() {
  if (typeof wx === 'undefined') throw new Error('微信本地存储不可用');
  return wx;
}

function getRecords() {
  const value = storage().getStorageSync(STORAGE_KEY);
  if (!value) return [];
  if (!Array.isArray(value)) throw new Error('记录数据格式不正确');
  return value.slice().sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);
}

function writeRecords(records) {
  storage().setStorageSync(STORAGE_KEY, records);
}

function saveRecord(input) {
  if (!input || !isValidDateKey(input.date) || !input.drinkName || !Number.isFinite(input.calories) || input.calories < 0) {
    throw new Error('记录信息不完整');
  }
  const records = getRecords();
  const now = Date.now();
  const record = {
    id: `${now}-${Math.random().toString(36).slice(2, 10)}`,
    schemaVersion: 1,
    createdAt: now,
    date: input.date,
    mode: input.mode === 'brand' ? 'brand' : 'custom',
    brandName: input.brandName || '',
    drinkName: String(input.drinkName),
    calories: input.calories,
    config: input.config || null
  };
  writeRecords([record, ...records]);
  return record;
}

function updateRecord(id, patch) {
  const records = getRecords();
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error('没有找到这条记录');
  if (!patch || !isValidDateKey(patch.date)) throw new Error('日期无效');
  const updated = { ...records[index], date: patch.date };
  records[index] = updated;
  writeRecords(records);
  return updated;
}

function deleteRecord(id) {
  const records = getRecords();
  const remaining = records.filter((record) => record.id !== id);
  if (remaining.length === records.length) return false;
  writeRecords(remaining);
  return true;
}

module.exports = { STORAGE_KEY, getRecords, saveRecord, updateRecord, deleteRecord };

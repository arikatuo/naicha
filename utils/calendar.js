function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 「今天」或「9月17日」
function relativeDateLabel(key, today) {
  if (key === today) return '今天';
  const [, month, day] = key.split('-').map(Number);
  return `${month}月${day}日`;
}

function isValidDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// 当天热量分档：0 = 无记录，1 = 轻松（<300），2 = 适中（<600），3 = 偏高（>=600）
function heatTier(calories, count = 0) {
  if (!count) return 0;
  if (!(calories > 0) || calories < 300) return 1;
  return calories < 600 ? 2 : 3;
}

function monthCells(year, month, records, selectedDate) {
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const cellCount = Math.max(35, Math.ceil((firstWeekday + daysInMonth) / 7) * 7);
  const counts = {};
  const calories = {};
  records.forEach((record) => {
    counts[record.date] = (counts[record.date] || 0) + 1;
    if (Number.isFinite(record.calories) && record.calories > 0) {
      calories[record.date] = (calories[record.date] || 0) + record.calories;
    }
  });

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > daysInMonth) {
      return { key: `empty-${index}`, day: '', date: '', selected: false, count: 0, calories: 0, tier: 0 };
    }
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayCalories = calories[date] || 0;
    return { key: date, day, date, selected: date === selectedDate, count: counts[date] || 0, calories: dayCalories, tier: heatTier(dayCalories, counts[date] || 0) };
  });
}

function shiftMonth(year, month, offset) {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

module.exports = { dateKey, heatTier, relativeDateLabel, isValidDateKey, monthCells, shiftMonth };

const { dateKey, isValidDateKey } = require('./calendar');

const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

function localDate(year, month, day) {
  const date = new Date(0);
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, month, day);
  return date;
}

function monthBuckets(year, month) {
  const lastDay = localDate(year, month + 1, 0).getDate();
  const firstWeekday = (localDate(year, month, 1).getDay() + 6) % 7;
  const buckets = [];
  for (let first = 1; first <= lastDay;) {
    const last = Math.min(lastDay, first + (first === 1 ? 6 - firstWeekday : 6));
    buckets.push({ label: `${first}–${last}日`, count: 0, focusDate: dateKey(localDate(year, month, first)), lastDate: dateKey(localDate(year, month, last)) });
    first = last + 1;
  }
  return buckets;
}

function periodDefinition(period, now) {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (period === 'week') {
    const monday = localDate(year, month, now.getDate() - (now.getDay() + 6) % 7);
    const buckets = WEEKDAY_LABELS.map((label, index) => ({
      label,
      count: 0,
      focusDate: dateKey(localDate(monday.getFullYear(), monday.getMonth(), monday.getDate() + index))
    }));
    return { label: `${buckets[0].focusDate.slice(5).replace('-', '/')}–${buckets[6].focusDate.slice(5).replace('-', '/')}`, buckets };
  }
  if (period === 'month') {
    return { label: `${year}年${month + 1}月`, buckets: monthBuckets(year, month) };
  }
  if (period === 'year') {
    return {
      label: `${year}年`,
      buckets: Array.from({ length: 12 }, (_, index) => ({
        label: `${index + 1}月`,
        count: 0,
        focusDate: dateKey(localDate(year, index, 1))
      }))
    };
  }
  throw new Error('统计周期无效');
}

function getPeriodStats(records, period, now = new Date()) {
  if (!Array.isArray(records) || !(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new Error('统计数据无效');
  }
  const { label, buckets } = periodDefinition(period, now);
  const firstDate = buckets[0].focusDate;
  const lastDate = period === 'week'
    ? buckets[buckets.length - 1].focusDate
    : period === 'month'
      ? buckets[buckets.length - 1].lastDate
      : `${now.getFullYear()}-12-31`;
  const days = new Set();
  let cups = 0;
  let calories = 0;

  records.forEach((record) => {
    if (!record || !isValidDateKey(record.date) || record.date < firstDate || record.date > lastDate) return;
    cups += 1;
    days.add(record.date);
    if (Number.isFinite(record.calories) && record.calories >= 0) calories += record.calories;
    const bucket = period === 'week'
      ? buckets.find((item) => item.focusDate === record.date)
      : period === 'month'
        ? buckets.find((item) => record.date >= item.focusDate && record.date <= item.lastDate)
        : buckets[Number(record.date.slice(5, 7)) - 1];
    bucket.count += 1;
    if (!bucket.firstRecordDate || record.date < bucket.firstRecordDate) bucket.firstRecordDate = record.date;
  });

  return {
    label,
    cups,
    days: days.size,
    calories,
    buckets: buckets.map(({ label: bucketLabel, count, focusDate, firstRecordDate }) => ({
      label: bucketLabel,
      count,
      focusDate: firstRecordDate || focusDate
    }))
  };
}

module.exports = { getPeriodStats };

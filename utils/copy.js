function getResultCopy(calories, copywriting) {
  const match = copywriting.resultTitles.find((item) => {
    return calories >= item.min && calories <= item.max;
  });

  if (match) {
    return { title: match.title, badge: match.badge, theme: match.theme };
  }

  return { title: '热量有数，快乐照旧。', badge: '这一杯', theme: 'milkTea' };
}

module.exports = {
  getResultCopy
};

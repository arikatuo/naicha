function getResultCopy(calories, copywriting) {
  const match = copywriting.resultTitles.find((item) => {
    return calories >= item.min && calories <= item.max;
  });

  if (match) {
    return { title: match.title, badge: match.badge, theme: match.theme };
  }

  return { title: '快乐上线，分量刚好有感。', badge: '快乐常驻', theme: 'milkTea' };
}

module.exports = {
  getResultCopy
};

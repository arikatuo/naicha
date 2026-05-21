function getResultCopy(calories, copywriting) {
  const match = copywriting.resultTitles.find((item) => {
    return calories >= item.min && calories <= item.max;
  });

  if (match) {
    return { title: match.title, theme: match.theme };
  }

  return { title: '这杯快乐有点认真。', theme: 'milkTea' };
}

module.exports = {
  getResultCopy
};

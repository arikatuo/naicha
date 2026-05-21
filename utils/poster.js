function drawPoster({ ctx, payload, cards, resultCopy, width, height }) {
  ctx.setFillStyle('#fffaf3');
  ctx.fillRect(0, 0, width, height);

  ctx.setFillStyle('#2f241d');
  ctx.setFontSize(22);
  ctx.fillText('奶茶热量换算器', 28, 48);

  ctx.setFontSize(28);
  ctx.fillText(resultCopy.title, 28, 94);

  ctx.setFontSize(20);
  ctx.setFillStyle('#6f5d51');
  ctx.fillText(payload.drinkName, 28, 132);

  ctx.setFillStyle('#2f241d');
  ctx.setFontSize(42);
  ctx.fillText(`约 ${payload.calories} kcal`, 28, 198);

  cards.forEach((card, index) => {
    const x = 28 + (index % 2) * 160;
    const y = 240 + Math.floor(index / 2) * 118;
    ctx.setFillStyle('#fff3e2');
    ctx.fillRect(x, y, 138, 90);
    ctx.drawImage(card.icon, x + 12, y + 18, 44, 44);
    ctx.setFillStyle('#3b281d');
    ctx.setFontSize(14);
    ctx.fillText(card.text, x + 12, y + 76);
  });

  ctx.setFillStyle('#f0dfcc');
  ctx.fillRect(248, 492, 84, 84);
  ctx.setFillStyle('#6f5d51');
  ctx.setFontSize(12);
  ctx.fillText('小程序码', 266, 540);

  ctx.setFillStyle('#8a7b70');
  ctx.setFontSize(12);
  ctx.fillText('热量和运动消耗均为估算，仅供趣味参考', 28, 608);
}

module.exports = {
  drawPoster
};

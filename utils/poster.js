function drawPoster({ ctx, payload, cards, resultCopy, width, height }) {
  ctx.setFillStyle('#fff8ec');
  ctx.fillRect(0, 0, width, height);

  ctx.setFillStyle('#f6e5ce');
  ctx.fillRect(24, 24, 130, 34);
  ctx.setFillStyle('#8b5f3f');
  ctx.setFontSize(14);
  ctx.fillText('趣味估算工具', 38, 47);

  ctx.setFillStyle('#2d211b');
  ctx.setFontSize(30);
  ctx.fillText(resultCopy.title, 28, 104);

  ctx.setFontSize(18);
  ctx.setFillStyle('#6f5d51');
  ctx.fillText(payload.drinkName, 28, 138);

  ctx.setFillStyle('#fffdf8');
  ctx.fillRect(24, 166, 312, 92);
  ctx.setFillStyle('#2d211b');
  ctx.setFontSize(42);
  ctx.fillText(`约 ${payload.calories} kcal`, 44, 225);
  ctx.setFillStyle('#6b3f2a');
  ctx.setFontSize(13);
  ctx.fillText('估算', 256, 225);

  cards.forEach((card, index) => {
    const x = 28 + (index % 2) * 160;
    const y = 286 + Math.floor(index / 2) * 112;
    ctx.setFillStyle(index % 2 === 0 ? '#fffdf8' : '#fff4df');
    ctx.fillRect(x, y, 138, 88);
    ctx.drawImage(card.icon, x + 47, y + 10, 44, 44);
    ctx.setFillStyle('#3b281d');
    ctx.setFontSize(14);
    ctx.fillText(card.text, x + 10, y + 76);
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

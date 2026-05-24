function drawPoster({ ctx, payload, cards, resultCopy, width, height }) {
  ctx.setFillStyle('#fff1dc');
  ctx.fillRect(0, 0, width, height);

  ctx.drawImage('/assets/icons/milk-tea-cup.png', 218, 12, 118, 118);

  ctx.setFillStyle('#f5c89d');
  ctx.fillRect(24, 24, 134, 36);
  ctx.setFillStyle('#8b4f3b');
  ctx.setFontSize(14);
  ctx.fillText('趣味估算工具', 38, 47);

  ctx.setFillStyle('#35231c');
  ctx.setFontSize(30);
  ctx.fillText(resultCopy.title, 28, 104);

  ctx.setFontSize(18);
  ctx.setFillStyle('#6f5d51');
  ctx.fillText(payload.drinkName, 28, 138);

  ctx.setFillStyle('#fffaf1');
  ctx.fillRect(24, 166, 312, 92);
  ctx.drawImage('/assets/icons/result-clay-card.png', 244, 170, 74, 74);
  ctx.setFillStyle('#35231c');
  ctx.setFontSize(42);
  ctx.fillText(`约 ${payload.calories} kcal`, 44, 225);
  ctx.setFillStyle('#8b4f3b');
  ctx.setFontSize(13);
  ctx.fillText('估算', 256, 225);

  cards.forEach((card, index) => {
    const x = 28 + (index % 2) * 160;
    const y = 286 + Math.floor(index / 2) * 112;
    ctx.setFillStyle(index % 2 === 0 ? '#fff8e8' : '#f5d5bc');
    ctx.fillRect(x, y, 138, 88);
    ctx.drawImage(card.icon, x + 47, y + 10, 44, 44);
    ctx.setFillStyle('#3b281d');
    ctx.setFontSize(14);
    ctx.fillText(card.text, x + 10, y + 76);
  });

  ctx.setFillStyle('#f2cba8');
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

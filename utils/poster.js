function roundRect(ctx, x, y, width, height, radius, color) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.setFillStyle(color);
  ctx.fill();
}

function drawText(ctx, text, x, y, size, color) {
  ctx.setFillStyle(color);
  ctx.setFontSize(size);
  ctx.fillText(text, x, y);
}

function drawPoster({ ctx, payload, cards, highlightCard, resultCopy, width, height }) {
  const selectedCard = highlightCard || cards[0];
  const drinkLabel = payload.brandName ? `${payload.brandName} · ${payload.drinkName}` : payload.drinkName;

  ctx.setFillStyle('#fff1dc');
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 26, 28, 138, 34, 17, '#f3c49a');
  drawText(ctx, '趣味估算工具', 42, 51, 14, '#7a4a35');
  ctx.drawImage('/assets/icons/milk-tea-cup.png', 238, 18, 86, 86);

  drawText(ctx, resultCopy.title, 28, 124, 29, '#2e211b');
  drawText(ctx, drinkLabel, 28, 158, 17, '#6f5d51');

  roundRect(ctx, 24, 188, 312, 148, 22, '#fffaf1');
  drawText(ctx, '约', 48, 250, 34, '#2e211b');
  drawText(ctx, `${payload.calories} kcal`, 92, 250, 44, '#2e211b');
  roundRect(ctx, 250, 216, 58, 30, 15, '#f1d3ad');
  drawText(ctx, '估算', 262, 236, 13, '#7a4a35');
  drawText(ctx, '热量为估算值，仅供趣味参考。', 48, 298, 14, '#75665a');

  roundRect(ctx, 36, 374, 288, 154, 26, '#f6d0aa');
  ctx.drawImage(selectedCard.icon, 140, 388, 80, 80);
  drawText(ctx, selectedCard.text, 64, 506, 25, '#2e211b');

  roundRect(ctx, 116, 548, 128, 34, 17, '#fff8e8');
  drawText(ctx, '长按识别小程序', 134, 570, 13, '#7a4a35');

  drawText(ctx, '热量和运动消耗均为估算，不作为健康建议', 28, 616, 12, '#8a7b70');
}

module.exports = {
  drawPoster
};

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

function getCalorieLayout(calories) {
  const text = `${calories}`;
  return {
    numberSize: text.length > 3 ? 46 : 56,
    numberX: 92,
    unitX: text.length > 3 ? 224 : 218,
    unitSize: 26,
    badgeX: 276
  };
}

function drawPoster({ ctx, payload, cards, highlightCard, resultCopy, width, height }) {
  const selectedCard = highlightCard || cards[0];
  const drinkLabel = payload.brandName ? `${payload.brandName} · ${payload.drinkName}` : payload.drinkName;
  const calories = `${payload.calories}`;
  const calorieLayout = getCalorieLayout(payload.calories);

  ctx.setFillStyle('#fff4e5');
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 26, 28, 116, 34, 17, '#b9473d');
  drawText(ctx, '换算结果', 48, 51, 14, '#ffffff');
  ctx.drawImage('/assets/icons/milk-tea-cup.png', 238, 18, 86, 86);

  drawText(ctx, resultCopy.title, 28, 124, 29, '#2d1f18');
  drawText(ctx, drinkLabel, 28, 158, 17, '#6f5d51');

  roundRect(ctx, 24, 188, 312, 148, 22, '#fff9f0');
  drawText(ctx, '约', 48, 252, 34, '#2d1f18');
  drawText(ctx, calories, calorieLayout.numberX, 252, calorieLayout.numberSize, '#2d1f18');
  drawText(ctx, 'kcal', calorieLayout.unitX, 252, calorieLayout.unitSize, '#2d1f18');
  roundRect(ctx, calorieLayout.badgeX, 216, 46, 30, 15, '#f1d7be');
  drawText(ctx, '估算', calorieLayout.badgeX + 10, 236, 13, '#6a3c2c');
  drawText(ctx, '热量为估算值，仅供趣味参考。', 48, 298, 14, '#6f5d51');

  roundRect(ctx, 36, 360, 288, 142, 26, '#f8e4cf');
  ctx.drawImage(selectedCard.icon, 140, 376, 76, 76);
  drawText(ctx, selectedCard.text, 64, 484, 24, '#2d1f18');

  roundRect(ctx, 72, 518, 216, 72, 20, '#fff9f0');
  ctx.drawImage('/assets/qrcode.png', 90, 529, 50, 50);
  drawText(ctx, '你的那杯呢？扫码比一比', 154, 558, 13, '#6a3c2c');

  drawText(ctx, '热量和运动消耗均为估算，不作为健康建议', 28, 616, 12, '#6f5d51');
}

module.exports = {
  drawPoster,
  getCalorieLayout
};

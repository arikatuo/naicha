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
  ctx.fillStyle = color;
  ctx.fill();
}

// options.align: 'left' | 'center'；options.weight: 400 | 600
function drawText(ctx, text, x, y, size, color, options = {}) {
  ctx.fillStyle = color;
  ctx.font = `${options.weight || 400} ${size}px sans-serif`;
  ctx.textAlign = options.align || 'left';
  ctx.fillText(text, x, y);
  ctx.textAlign = 'left';
}

function loadCanvasImage(canvas, src) {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load canvas image: ${src}`));
    image.src = src;
  });
}

function estimateTextWidth(text, size) {
  return String(text || '').split('').reduce((width, char) => {
    if (/^[\x00-\xff]$/.test(char)) {
      return width + size * 0.55;
    }
    return width + size;
  }, 0);
}

function ellipsizeText(text, maxWidth, size) {
  const value = String(text || '');
  if (estimateTextWidth(value, size) <= maxWidth) {
    return value;
  }

  let result = '';
  for (const char of value) {
    if (estimateTextWidth(`${result}${char}…`, size) > maxWidth) {
      return `${result}…`;
    }
    result += char;
  }

  return result;
}

function wrapText(text, maxWidth, size, maxLines) {
  const value = String(text || '').trim();
  if (!value) {
    return [];
  }

  const lines = [];
  let current = '';

  for (const char of value) {
    if (estimateTextWidth(`${current}${char}`, size) > maxWidth && current) {
      lines.push(current);
      current = char;
      if (lines.length === maxLines) {
        break;
      }
    } else {
      current += char;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  if (lines.length === maxLines) {
    const used = lines.join('');
    if (used.length < value.length) {
      lines[maxLines - 1] = ellipsizeText(lines[maxLines - 1], maxWidth, size);
    }
  }

  return lines;
}

function drawWrappedText(ctx, text, x, y, size, color, maxWidth, lineHeight, maxLines, options) {
  const lines = wrapText(text, maxWidth, size, maxLines);
  lines.forEach((line, index) => drawText(ctx, line, x, y + index * lineHeight, size, color, options));
  return y + Math.max(lines.length, 1) * lineHeight;
}

// 热量数字居中放大，四位数时缩小一档避免超出卡片
function getCalorieLayout(calories) {
  return { numberSize: `${calories}`.length > 3 ? 72 : 88, unitSize: 18 };
}

function buildEquivalentText(card) {
  if (!card) {
    return '';
  }

  const unit = card.numberUnit || '';
  const label = String(card.label || card.name || '').replace('消耗', '');
  if (card.numberMain) {
    return `约 ${card.numberMain}${unit} ${label}`;
  }

  return card.text || '';
}

function drawPoster({ ctx, payload, cards, highlightCard, resultCopy, width, height, images }) {
  const selectedCard = highlightCard || cards[0];
  const drinkLabel = payload.brandName ? `${payload.brandName} · ${payload.drinkName}` : payload.drinkName;
  const calories = `${payload.calories}`;
  const calorieLayout = getCalorieLayout(payload.calories);
  const center = width / 2;
  const strong = { align: 'center', weight: 600 };

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fbf8f3';
  ctx.fillRect(0, 0, width, height);

  // 顶部：品牌小标签 + 奶茶插画
  roundRect(ctx, 24, 28, 124, 34, 17, '#b9473d');
  drawText(ctx, '奶茶热量日历', 40, 50, 14, '#ffffff', { weight: 600 });
  ctx.drawImage(images.cup, 256, 20, 80, 80);

  // 主卡片：饮品名、热量大数字、一句话
  roundRect(ctx, 24, 120, 312, 248, 28, '#ffffff');
  drawText(ctx, ellipsizeText(drinkLabel, 272, 15), center, 156, 15, '#6f5d51', { align: 'center' });
  drawText(ctx, calories, center, 250, calorieLayout.numberSize, '#2d1f18', strong);
  drawText(ctx, 'kcal', center, 280, calorieLayout.unitSize, '#6f5d51', { align: 'center' });
  roundRect(ctx, center - 34, 292, 68, 22, 11, '#f8ebde');
  drawText(ctx, '约 · 估算', center, 308, 12, '#6f5d51', { align: 'center' });
  drawWrappedText(ctx, resultCopy.title, center, 342, 17, '#2d1f18', 272, 24, 1, strong);

  // 等于什么：左图右字
  roundRect(ctx, 24, 384, 312, 120, 28, '#f8ebde');
  if (images.equivalent) {
    ctx.drawImage(images.equivalent, 44, 408, 72, 72);
  }
  const hasParts = selectedCard && selectedCard.numberMain;
  drawText(ctx, '约等于', 134, 430, 13, '#6f5d51');
  if (hasParts) {
    drawText(ctx, ellipsizeText(`${selectedCard.numberMain}${selectedCard.numberUnit || ''}`, 188, 32), 134, 466, 32, '#2d1f18', { weight: 600 });
    drawText(ctx, ellipsizeText(String(selectedCard.label || selectedCard.name || '').replace('消耗', ''), 188, 15), 134, 490, 15, '#6f5d51');
  } else {
    drawText(ctx, ellipsizeText(buildEquivalentText(selectedCard), 188, 20), 134, 468, 20, '#2d1f18', { weight: 600 });
  }

  // 底部：二维码 + 提示
  roundRect(ctx, 24, 520, 312, 88, 28, '#ffffff');
  ctx.drawImage(images.qrcode, 38, 526, 76, 76);
  drawText(ctx, '微信搜一搜', 130, 558, 13, '#6f5d51');
  drawText(ctx, '奶茶热量日历', 130, 584, 19, '#2d1f18', { weight: 600 });

  drawText(ctx, '热量为估算值，仅供趣味参考', center, 626, 11, '#857468', { align: 'center' });
}

module.exports = {
  drawPoster,
  getCalorieLayout,
  loadCanvasImage
};

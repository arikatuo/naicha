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

function drawText(ctx, text, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `${size}px sans-serif`;
  ctx.fillText(text, x, y);
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

function drawWrappedText(ctx, text, x, y, size, color, maxWidth, lineHeight, maxLines) {
  const lines = wrapText(text, maxWidth, size, maxLines);
  lines.forEach((line, index) => drawText(ctx, line, x, y + index * lineHeight, size, color));
  return y + Math.max(lines.length, 1) * lineHeight;
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

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#fff4e5';
  ctx.fillRect(0, 0, width, height);

  roundRect(ctx, 26, 30, 116, 36, 18, '#b9473d');
  drawText(ctx, '换算结果', 48, 54, 14, '#ffffff');
  ctx.drawImage(images.cup, 264, 26, 66, 66);

  roundRect(ctx, 20, 106, 320, 82, 22, 'rgba(255, 249, 240, 0.86)');
  const titleBottom = drawWrappedText(ctx, resultCopy.title, 34, 137, 24, '#2d1f18', 292, 30, 2);
  const drinkY = titleBottom + 4;
  drawText(ctx, ellipsizeText(drinkLabel, 292, 16), 34, drinkY, 16, '#6f5d51');

  const calorieCardY = Math.max(220, drinkY + 30);
  roundRect(ctx, 28, calorieCardY, 304, 126, 22, '#fff9f0');
  drawText(ctx, '约', 54, calorieCardY + 66, 34, '#2d1f18');
  drawText(ctx, calories, calorieLayout.numberX, calorieCardY + 66, calorieLayout.numberSize, '#2d1f18');
  drawText(ctx, 'kcal', calorieLayout.unitX, calorieCardY + 66, calorieLayout.unitSize, '#2d1f18');
  roundRect(ctx, calorieLayout.badgeX, calorieCardY + 32, 46, 30, 15, '#f1d7be');
  drawText(ctx, '估算', calorieLayout.badgeX + 10, calorieCardY + 52, 13, '#6a3c2c');
  drawText(ctx, '热量为估算值，仅供趣味参考。', 54, calorieCardY + 101, 14, '#6f5d51');

  const equivalentY = calorieCardY + 154;
  roundRect(ctx, 36, equivalentY, 288, 132, 26, '#f8e4cf');
  if (images.equivalent) {
    ctx.drawImage(images.equivalent, 145, equivalentY + 22, 70, 70);
  }
  drawText(ctx, ellipsizeText(buildEquivalentText(selectedCard), 236, 24), 62, equivalentY + 106, 24, '#2d1f18');

  const qrY = equivalentY + 142;
  roundRect(ctx, 54, qrY, 252, 92, 24, '#fff9f0');
  ctx.drawImage(images.qrcode, 72, qrY + 6, 80, 80);
  drawText(ctx, '微信搜一搜', 172, qrY + 36, 13, '#6a3c2c');
  drawText(ctx, '奶茶有多胖', 172, qrY + 58, 13, '#6a3c2c');

  drawText(ctx, '热量和运动消耗均为估算，不作为健康建议', 28, 618, 12, '#6f5d51');
}

module.exports = {
  drawPoster,
  getCalorieLayout,
  loadCanvasImage
};

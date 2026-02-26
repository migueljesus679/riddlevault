const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

function createStegoImage(secretText, outputPath, width = 400, height = 300) {
  const png = new PNG({ width, height, filterType: -1 });

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) * 4;
      png.data[idx]     = Math.floor(30 + (x / width) * 120 + (y / height) * 60);
      png.data[idx + 1] = Math.floor(60 + (y / height) * 100 + Math.sin(x * 0.05) * 20);
      png.data[idx + 2] = Math.floor(100 + (x / width) * 80 + Math.cos(y * 0.05) * 30);
      png.data[idx + 3] = 255;
    }
  }

  const lenBits = secretText.length.toString(2).padStart(8, '0');
  for (let i = 0; i < 8; i++) {
    const idx = i * 4;
    png.data[idx] = (png.data[idx] & 0xFE) | parseInt(lenBits[i]);
  }

  const msgBits = secretText
    .split('')
    .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');

  for (let i = 0; i < msgBits.length; i++) {
    const idx = (8 + i) * 4;
    png.data[idx] = (png.data[idx] & 0xFE) | parseInt(msgBits[i]);
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Stego image created: ${outputPath} (hidden: "${secretText}")`);
}

module.exports = { createStegoImage };

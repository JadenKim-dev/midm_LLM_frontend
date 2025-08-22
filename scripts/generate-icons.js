const fs = require('fs');
const path = require('path');

// SVG 아이콘 템플릿 (로봇 이모지 기반)
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <style>
      .bg { fill: #1f2937; }
      .robot { font-family: system-ui, -apple-system, sans-serif; font-size: ${size * 0.6}px; }
    </style>
  </defs>
  <rect class="bg" width="${size}" height="${size}" rx="${size * 0.1}"/>
  <text class="robot" x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white">🤖</text>
</svg>`;

// 단축키 아이콘들
const createShortcutSVG = (emoji, size = 192) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <defs>
    <style>
      .bg { fill: #3b82f6; }
      .icon { font-family: system-ui, -apple-system, sans-serif; font-size: ${size * 0.5}px; }
    </style>
  </defs>
  <rect class="bg" width="${size}" height="${size}" rx="${size * 0.1}"/>
  <text class="icon" x="50%" y="50%" text-anchor="middle" dy="0.35em" fill="white">${emoji}</text>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

// 메인 아이콘 크기들
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// 메인 아이콘들 생성
iconSizes.forEach(size => {
  const svgContent = createIconSVG(size);
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.svg`), svgContent.trim());
});

// 단축키 아이콘들 생성
const shortcuts = [
  { name: 'shortcut-new-chat', emoji: '💬' },
  { name: 'shortcut-documents', emoji: '📄' },
  { name: 'shortcut-presentations', emoji: '📊' }
];

shortcuts.forEach(shortcut => {
  const svgContent = createShortcutSVG(shortcut.emoji);
  fs.writeFileSync(path.join(iconsDir, `${shortcut.name}.svg`), svgContent.trim());
});

console.log('✅ PWA 아이콘들이 생성되었습니다.');
console.log(`📁 위치: ${iconsDir}`);
console.log(`🔢 생성된 아이콘 수: ${iconSizes.length + shortcuts.length}개`);
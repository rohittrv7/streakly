const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSETS_DIR = path.resolve(__dirname, "../assets");
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

// Tokens
const BG_COLOR = "#0F0F10";
const ACCENT_LIME = "#D4FF3F";

// Geometric streak flame / check-in mark SVG
function getStreakSvg(color, size, markScale = 0.55) {
  const center = size / 2;
  const radius = (size / 2) * markScale;
  const strokeWidth = size * 0.08;

  // An open circular progress arc with a sharp flame apex
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="streakGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
          <stop offset="100%" stop-color="${color}" stop-opacity="1" />
        </linearGradient>
      </defs>
      <!-- Circular habit ring arc -->
      <path
        d="M ${center - radius * 0.8} ${center + radius * 0.5}
           A ${radius} ${radius} 0 1 0 ${center} ${center - radius}
           L ${center + radius * 0.15} ${center - radius * 0.7}
           C ${center + radius * 0.3} ${center - radius * 0.4}, ${center + radius * 0.8} ${center - radius * 0.2}, ${center + radius * 0.6} ${center + radius * 0.3}
           A ${radius} ${radius} 0 0 1 ${center - radius * 0.8} ${center + radius * 0.5} Z"
        fill="url(#streakGrad)"
      />
      <!-- Flame core dot -->
      <circle cx="${center}" cy="${center}" r="${radius * 0.28}" fill="${color}" />
    </svg>
  `;
}

async function generate() {
  console.log("Generating Streakly identity assets...");

  // 1. App Icon 1024x1024
  const appIconSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="${BG_COLOR}" />
      ${getStreakSvg(ACCENT_LIME, 1024, 0.52)}
    </svg>
  `;
  await sharp(Buffer.from(appIconSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "icon.png"));
  console.log("✓ assets/icon.png (1024x1024)");

  // 2. Android Adaptive Icon Foreground (safe-zone aware: centered at scale 0.38)
  const foregroundSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      ${getStreakSvg(ACCENT_LIME, 1024, 0.38)}
    </svg>
  `;
  await sharp(Buffer.from(foregroundSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-foreground.png"));
  console.log("✓ assets/android-icon-foreground.png (1024x1024, safe-zone aware)");

  // 3. Android Adaptive Icon Background (solid BG_COLOR)
  const backgroundSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <rect width="1024" height="1024" fill="${BG_COLOR}" />
    </svg>
  `;
  await sharp(Buffer.from(backgroundSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-background.png"));
  console.log("✓ assets/android-icon-background.png (1024x1024)");

  // 4. Android 13 Themed Monochrome Adaptive Icon (white silhouette on transparent)
  const monochromeSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      ${getStreakSvg("#FFFFFF", 1024, 0.38)}
    </svg>
  `;
  await sharp(Buffer.from(monochromeSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "android-icon-monochrome.png"));
  console.log("✓ assets/android-icon-monochrome.png (1024x1024)");

  // 5. Notification Small Icon (96x96, white silhouette on transparent)
  const notificationSvg = `
    <svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
      ${getStreakSvg("#FFFFFF", 96, 0.7)}
    </svg>
  `;
  await sharp(Buffer.from(notificationSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "notification-icon.png"));
  console.log("✓ assets/notification-icon.png (96x96)");

  // 6. Splash Icon (512x512)
  const splashSvg = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      ${getStreakSvg(ACCENT_LIME, 512, 0.55)}
    </svg>
  `;
  await sharp(Buffer.from(splashSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "splash-icon.png"));
  console.log("✓ assets/splash-icon.png (512x512)");

  // 7. Favicon 48x48
  const faviconSvg = `
    <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="${BG_COLOR}" />
      ${getStreakSvg(ACCENT_LIME, 48, 0.65)}
    </svg>
  `;
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(path.join(ASSETS_DIR, "favicon.png"));
  console.log("✓ assets/favicon.png (48x48)");

  console.log("Asset generation complete!");
}

generate().catch((err) => {
  console.error("Asset generation failed:", err);
  process.exit(1);
});

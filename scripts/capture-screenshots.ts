import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.SLIDES_URL || 'http://localhost:8080';
const outDir = path.resolve('assets/screenshots/presentation');

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => (globalThis as any).Reveal && (globalThis as any).Reveal.isReady()
  );

  const total = await page.evaluate(
    () => (globalThis as any).document.querySelectorAll('.slides > section').length
  );

  const reportPath = path.join(outDir, 'broken-images.txt');
  if (fs.existsSync(reportPath)) {
    fs.unlinkSync(reportPath);
  }

  for (let i = 0; i < total; i += 1) {
    await page.evaluate((index) => {
      const reveal = (globalThis as any).Reveal;
      reveal.slide(index);
      const slide = (globalThis as any).document.querySelectorAll('.slides > section')[index];
      if (slide) {
        slide
          .querySelectorAll('.fragment')
          .forEach((el: any) => {
            el.classList.add('visible');
            el.classList.remove('fragment');
          });
      }
    }, i);
    await page.waitForTimeout(600);

    const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
    const filePath = path.join(outDir, fileName);

    await page.screenshot({ path: filePath, fullPage: false });

    const brokenImages = await page.evaluate(() =>
      Array.from((globalThis as any).document.images)
        .filter((img: any) => !img.complete || img.naturalWidth === 0)
        .map((img: any) => img.getAttribute('src') || '')
        .filter(Boolean)
    );

    if (brokenImages.length) {
      const line = `slide-${String(i + 1).padStart(2, '0')}: ${brokenImages.join(', ')}\n`;
      fs.appendFileSync(reportPath, line);
    }
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

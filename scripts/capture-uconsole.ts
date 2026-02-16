import { firefox } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const url = 'http://localhost:8080';
const outDir = '/tmp/uconsole-screenshots';

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => (globalThis as any).Reveal && (globalThis as any).Reveal.isReady()
  );

  const total = await page.evaluate(
    () => (globalThis as any).document.querySelectorAll('.slides > section').length
  );

  for (let i = 0; i < total; i++) {
    await page.evaluate((index: number) => {
      const reveal = (globalThis as any).Reveal;
      reveal.slide(index);
      const slide = (globalThis as any).document.querySelectorAll('.slides > section')[index];
      if (slide) {
        slide.querySelectorAll('.fragment').forEach((el: any) => {
          el.classList.add('visible');
          el.classList.remove('fragment');
        });
      }
    }, i);
    await page.waitForTimeout(600);

    const fileName = `slide-${String(i + 1).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(outDir, fileName), fullPage: false });
  }

  await browser.close();
  console.log(`Done: ${total} slides captured at 1280x720 (Firefox)`);
}

main().catch((e) => { console.error(e); process.exit(1); });

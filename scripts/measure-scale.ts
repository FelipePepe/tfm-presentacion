import { firefox } from '@playwright/test';

async function main() {
  const browser = await firefox.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => (globalThis as any).Reveal && (globalThis as any).Reveal.isReady());

  for (const idx of [3, 15]) {
    await page.evaluate((i: any) => (globalThis as any).Reveal.slide(i), idx);
    await page.evaluate((i: any) => {
      const slide = (globalThis as any).document.querySelectorAll('.slides > section')[i];
      slide?.querySelectorAll('.fragment').forEach((el: any) => {
        el.classList.add('visible');
        el.classList.remove('fragment');
      });
    }, idx);
    await page.waitForTimeout(500);

    const info = await page.evaluate((i: any) => {
      const reveal = (globalThis as any).Reveal;
      const config = reveal.getConfig();
      const scale = reveal.getScale();
      const slide = (globalThis as any).document.querySelectorAll('.slides > section')[i];
      const slidesContainer = (globalThis as any).document.querySelector('.slides');
      const transform = slidesContainer ? (globalThis as any).getComputedStyle(slidesContainer).transform : 'none';
      return {
        slideIndex: i + 1,
        revealWidth: config.width,
        revealHeight: config.height,
        scale: scale,
        slideNaturalH: slide.scrollHeight,
        slidesTransform: transform,
      };
    }, idx);
    console.log(JSON.stringify(info, null, 2));
  }
  await browser.close();
}
main().catch((e: any) => { console.error(e); process.exit(1); });

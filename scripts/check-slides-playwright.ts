/**
 * Revisa cada slide de la presentación con Playwright para detectar:
 * - Imágenes rotas (no cargan o naturalWidth === 0)
 * - Overflow (contenido que se sale del viewport)
 * - Errores de consola
 * - Slide no visible (section con tamaño 0 o fuera de vista)
 *
 * Requiere servidor en marcha: npm run dev (puerto 8080)
 * Uso: npx ts-node scripts/check-slides-playwright.ts
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.SLIDES_URL || 'http://localhost:8080';
const viewportWidth = 1920;
const viewportHeight = 1080;
const overflowTolerancePx = 2;

interface SlideIssue {
  slideIndex: number;
  slideLabel: string;
  type: 'broken_image' | 'overflow' | 'console_error' | 'not_visible';
  detail: string;
}

async function main() {
  const issues: SlideIssue[] = [];
  const consoleErrors: { slideIndex: number; text: string }[] = [];
  let currentSlideForErrors = 0;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: viewportHeight },
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push({ slideIndex: currentSlideForErrors, text: msg.text() });
    }
  });

  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    if (!response || response.status() !== 200) {
      console.error('No se pudo cargar la presentación. ¿Está el servidor en marcha? (npm run dev)');
      process.exit(1);
    }
  } catch {
    console.error('Error cargando', url, '. Ejecuta antes: npm run dev');
    process.exit(1);
  }

  await page.waitForFunction(
    () => (globalThis as any).Reveal && (globalThis as any).Reveal.isReady(),
    { timeout: 10000 }
  );

  const total = await page.evaluate(
    () => (globalThis as any).document.querySelectorAll('.slides > section').length
  );

  for (let i = 0; i < total; i += 1) {
    currentSlideForErrors = i + 1;
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
    await page.waitForTimeout(800);

    const slideLabel = `Slide ${i + 1}/${total}`;

    const check = await page.evaluate(
      (args: { index: number; vw: number; vh: number; tol: number }) => {
        const { index, vw: vpW, vh: vpH, tol } = args;
        const slides = (globalThis as any).document.querySelectorAll('.slides > section');
        const currentSlide = slides[index];
        if (!currentSlide) {
          return { brokenImages: [] as string[], overflow: [] as string[], notVisible: false };
        }

        const brokenImages: string[] = [];
        currentSlide.querySelectorAll('img').forEach((img: any) => {
          if (!img.complete || img.naturalWidth === 0) {
            const src = img.getAttribute('src') || '';
            if (src) brokenImages.push(src);
          }
        });

        const slideRect = currentSlide.getBoundingClientRect();
        const notVisible =
          slideRect.width < 10 ||
          slideRect.height < 10 ||
          slideRect.right < -tol ||
          slideRect.left > vpW + tol ||
          slideRect.bottom < -tol ||
          slideRect.top > vpH + tol;

        const overflow: string[] = [];
        const walk = (el: any) => {
          if (el && typeof el.getBoundingClientRect === 'function') {
            const r = el.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              if (
                r.left < -tol ||
                r.right > vpW + tol ||
                r.top < -tol ||
                r.bottom > vpH + tol
              ) {
                const tag = el.tagName.toLowerCase();
                const id = el.id ? `#${el.id}` : '';
                const cls =
                  el.className && typeof el.className === 'string'
                    ? '.' + (el.className as string).split(' ')[0]
                    : '';
                overflow.push(
                  `${tag}${id}${cls} (L:${Math.round(r.left)} R:${Math.round(r.right)} T:${Math.round(r.top)} B:${Math.round(r.bottom)})`
                );
              }
            }
          }
          el.childNodes.forEach((node: any) => {
            if (node.nodeType === 1) walk(node);
          });
        };
        walk(currentSlide);

        return { brokenImages, overflow, notVisible };
      },
      {
        index: i,
        vw: viewportWidth,
        vh: viewportHeight,
        tol: overflowTolerancePx,
      }
    );

    if (check.brokenImages.length) {
      check.brokenImages.forEach((src) => {
        issues.push({
          slideIndex: i + 1,
          slideLabel,
          type: 'broken_image',
          detail: src,
        });
      });
    }
    if (check.notVisible) {
      issues.push({
        slideIndex: i + 1,
        slideLabel,
        type: 'not_visible',
        detail: 'La sección de la slide no es visible o tiene tamaño casi cero.',
      });
    }
    if (check.overflow.length) {
      issues.push({
        slideIndex: i + 1,
        slideLabel,
        type: 'overflow',
        detail:
          check.overflow.slice(0, 5).join('; ') +
          (check.overflow.length > 5 ? ` (+${check.overflow.length - 5} más)` : ''),
      });
    }
  }

  consoleErrors.forEach(({ slideIndex, text }) => {
    const slideNum = slideIndex >= 0 ? slideIndex + 1 : 0;
    issues.push({
      slideIndex: slideNum,
      slideLabel: slideNum ? `Slide ${slideNum}/${total}` : 'Global',
      type: 'console_error',
      detail: text.slice(0, 200),
    });
  });

  await browser.close();

  const outPath = path.resolve('check-slides-report.txt');
  const lines: string[] = [
    'Reporte de revisión de slides (Playwright)',
    `URL: ${url}`,
    `Viewport: ${viewportWidth}x${viewportHeight}`,
    `Total slides: ${total}`,
    `Fecha: ${new Date().toISOString()}`,
    '',
  ];

  if (issues.length === 0) {
    lines.push('No se detectaron problemas. Todas las slides se visualizan correctamente.');
  } else {
    lines.push('Nota: [overflow] = contenido que se sale del viewport (1920x1080). B > 1080 = se corta por abajo.');
    lines.push('Nota: [not_visible] puede deberse a transición en curso; [broken_image] = imagen no cargada.');
    lines.push('');
    const bySlide = new Map<number, SlideIssue[]>();
    issues.forEach((iss) => {
      const key = iss.slideIndex;
      if (!bySlide.has(key)) bySlide.set(key, []);
      bySlide.get(key)!.push(iss);
    });
    Array.from(bySlide.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([num, slideIssues]) => {
        const label = slideIssues[0]?.slideLabel ?? `Slide ${num}`;
        lines.push(`--- ${label} ---`);
        slideIssues.forEach((iss) => {
          lines.push(`  [${iss.type}] ${iss.detail}`);
        });
        lines.push('');
      });
  }

  const report = lines.join('\n');
  fs.writeFileSync(outPath, report, 'utf8');
  console.log(report);
  console.log('\nReporte guardado en:', outPath);
  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

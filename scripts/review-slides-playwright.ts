/**
 * Revisión visual de slides con Playwright (modo visible).
 * Recorre cada slide, hace una pausa para que puedas verla, y comprueba:
 * - Overflow (contenido que se sale del viewport)
 * - Consistencia de fuentes (mismo tipo de elemento, mismo tamaño en la slide)
 * - Iconos faltantes (cards del mismo grid donde unas tienen icono y otras no)
 *
 * Requiere servidor en marcha: npm run dev (puerto 8080)
 * Uso: npm run review-slides
 *   SLIDE_DELAY_MS=3000  → pausa en ms por slide (default 2000)
 *   SCREENSHOTS=0        → no guardar capturas (por defecto sí se guardan en review-slides-screenshots/)
 *   HEADLESS=1           → ejecutar sin ventana (igual que check-slides)
 */

import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const url = process.env.SLIDES_URL || 'http://localhost:8080';
const viewportWidth = 1920;
const viewportHeight = 1080;
const slideDelayMs = Number(process.env.SLIDE_DELAY_MS || 2000);
const withScreenshots = process.env.SCREENSHOTS !== '0';
const headless = process.env.HEADLESS === '1';
const overflowTolerancePx = 2;

type IssueType =
  | 'overflow'
  | 'font_mismatch'
  | 'icon_missing'
  | 'broken_image'
  | 'not_visible'
  | 'console_error';

interface SlideIssue {
  slideIndex: number;
  slideLabel: string;
  type: IssueType;
  detail: string;
}

async function main() {
  const issues: SlideIssue[] = [];
  const consoleErrors: { slideIndex: number; text: string }[] = [];
  let currentSlideForErrors = 0;

  const browser = await chromium.launch({
    headless,
    slowMo: headless ? 0 : 50,
  });

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

  const screenshotsDir = withScreenshots
    ? path.resolve('review-slides-screenshots')
    : null;
  if (screenshotsDir) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log(`\nRevisando ${total} slides (viewport ${viewportWidth}x${viewportHeight})`);
  console.log(`Pausa por slide: ${slideDelayMs} ms. Headless: ${headless}. Capturas: ${withScreenshots ? screenshotsDir : 'no'}\n`);

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
    await page.waitForTimeout(400);

    const slideLabel = `Slide ${i + 1}/${total}`;

    const check = await page.evaluate(
      (args: { index: number; vw: number; vh: number; tol: number }) => {
        const { index, vw: vpW, vh: vpH, tol } = args;
        const slides = (globalThis as any).document.querySelectorAll('.slides > section');
        const currentSlide = slides[index];
        if (!currentSlide) {
          return {
            brokenImages: [] as string[],
            overflow: [] as string[],
            notVisible: false,
            fontMismatch: [] as string[],
            iconMissing: [] as string[],
          };
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
                const cls =
                  el.className && typeof el.className === 'string'
                    ? '.' + (el.className as string).split(' ')[0]
                    : '';
                overflow.push(
                  `${tag}${cls} (B:${Math.round(r.bottom)}${r.bottom > vpH + tol ? ' > viewport' : ''})`
                );
              }
            }
          }
          el.childNodes.forEach((node: any) => {
            if (node.nodeType === 1) walk(node);
          });
        };
        walk(currentSlide);

        const fontMismatch: string[] = [];
        const getFontSize = (el: any) => {
          const s = (globalThis as any).getComputedStyle(el);
          return s ? s.fontSize : '';
        };
        const selectors = [
          '.quality-card h4',
          '.quality-card p',
          '.result-card .result-desc',
          '.criteria-card h4',
          '.criteria-card p',
          '.agenda-content h4',
          '.agenda-content p',
          '.conclusion-item p',
        ];
        selectors.forEach((sel) => {
          const nodes = currentSlide.querySelectorAll(sel);
          if (nodes.length < 2) return;
          const sizes = new Set<string>();
          nodes.forEach((n: any) => sizes.add(getFontSize(n)));
          if (sizes.size > 1) {
            fontMismatch.push(`${sel}: tamaños distintos (${Array.from(sizes).join(', ')})`);
          }
        });

        const iconMissing: string[] = [];
        const gridSelectors = [
          { container: '.quality-grid', card: '.quality-card', icon: '.quality-icon' },
          { container: '.results-grid', card: '.result-card', icon: '.result-icon' },
          { container: '.criteria-grid', card: '.criteria-card', icon: '.criteria-icon' },
          { container: '.agenda-grid', card: '.agenda-item', icon: '.agenda-number' },
          { container: '.conclusions-list', card: '.conclusion-item', icon: '.conclusion-icon' },
        ];
        gridSelectors.forEach(({ container, card, icon }) => {
          const grid = currentSlide.querySelector(container);
          if (!grid) return;
          const cards = grid.querySelectorAll(card);
          if (cards.length < 2) return;
          let withIcon = 0;
          let withoutIcon = 0;
          cards.forEach((c: any) => {
            const hasIcon =
              c.querySelector(icon) ||
              (icon.includes('icon') && c.querySelector('[class*="icon"]')) ||
              c.querySelector('img');
            if (hasIcon) withIcon += 1;
            else withoutIcon += 1;
          });
          if (withIcon > 0 && withoutIcon > 0) {
            iconMissing.push(
              `${container}: ${withIcon} con icono/badge, ${withoutIcon} sin (misma fila/grid)`
            );
          }
        });

        return {
          brokenImages,
          overflow,
          notVisible,
          fontMismatch,
          iconMissing,
        };
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
        detail: 'La sección no es visible o tiene tamaño casi cero.',
      });
    }
    if (check.overflow.length) {
      issues.push({
        slideIndex: i + 1,
        slideLabel,
        type: 'overflow',
        detail:
          check.overflow.slice(0, 6).join('; ') +
          (check.overflow.length > 6 ? ` (+${check.overflow.length - 6} más)` : ''),
      });
    }
    if (check.fontMismatch.length) {
      check.fontMismatch.forEach((d) => {
        issues.push({
          slideIndex: i + 1,
          slideLabel,
          type: 'font_mismatch',
          detail: d,
        });
      });
    }
    if (check.iconMissing.length) {
      check.iconMissing.forEach((d) => {
        issues.push({
          slideIndex: i + 1,
          slideLabel,
          type: 'icon_missing',
          detail: d,
        });
      });
    }

    const slideIssues = issues.filter((iss) => iss.slideIndex === i + 1);
    const msg =
      slideIssues.length === 0
        ? `${slideLabel} OK`
        : `${slideLabel} → ${slideIssues.map((s) => s.type).join(', ')}`;
    console.log(msg);

    if (screenshotsDir) {
      const name = `slide-${String(i + 1).padStart(2, '0')}.png`;
      await page.screenshot({
        path: path.join(screenshotsDir, name),
        fullPage: false,
      });
    }

    await page.waitForTimeout(slideDelayMs);
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

  const outPath = path.resolve('review-slides-report.txt');
  const lines: string[] = [
    'Reporte de revisión visual de slides (Playwright)',
    `URL: ${url}`,
    `Viewport: ${viewportWidth}x${viewportHeight}`,
    `Total slides: ${total}`,
    `Fecha: ${new Date().toISOString()}`,
    '',
  ];

  if (issues.length === 0) {
    lines.push('No se detectaron problemas.');
  } else {
    lines.push(
      '[overflow] = contenido que se sale del viewport. B > 1080 = se corta por abajo.'
    );
    lines.push(
      '[font_mismatch] = mismo tipo de elemento en la slide con distinto tamaño de fuente.'
    );
    lines.push(
      '[icon_missing] = en un mismo grid/lista, unas cards tienen icono/badge y otras no.'
    );
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
  console.log('\n' + report);
  console.log('\nReporte guardado en:', outPath);
  if (screenshotsDir) {
    console.log('Capturas en:', screenshotsDir);
  }
  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

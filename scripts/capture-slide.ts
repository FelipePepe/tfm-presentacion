import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const url = process.env.SLIDES_URL || "http://localhost:8090";

const slideArg = process.argv[2];
if (!slideArg) {
  console.error(
    "Usage: npx ts-node scripts/capture-slide.ts <slideNumber> [outPath]",
  );
  process.exit(1);
}

const slideNumber = Number(slideArg);
if (!Number.isInteger(slideNumber) || slideNumber < 1) {
  console.error("slideNumber must be a positive integer (1-based).");
  process.exit(1);
}

const outDir = path.resolve("assets/screenshots/presentation/interactive");
const defaultName = `slide-${String(slideNumber).padStart(2, "0")}.png`;
const outPath = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(outDir, defaultName);

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
  });

  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () => (globalThis as any).Reveal && (globalThis as any).Reveal.isReady(),
  );

  await page.evaluate((index) => {
    const reveal = (globalThis as any).Reveal;
    reveal.slide(index);
    const slide = (globalThis as any).document.querySelectorAll(
      ".slides > section",
    )[index];
    if (slide) {
      slide.querySelectorAll(".fragment").forEach((el: any) => {
        el.classList.add("visible");
        el.classList.remove("fragment");
      });
    }
  }, slideNumber - 1);

  await page.waitForTimeout(600);
  await page.screenshot({ path: outPath, fullPage: false });
  await browser.close();

  console.log(outPath);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

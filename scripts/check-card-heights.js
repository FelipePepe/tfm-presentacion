const { chromium } = require('@playwright/test');
const fs = require('fs');

async function checkCardHeights() {
  console.log('🔍 Checking card heights in all slides...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Navegar a la presentación local
  await page.goto('http://localhost:8080');
  await page.waitForTimeout(2000); // Esperar a que Reveal.js se inicialice
  
  const issues = [];
  
  // Obtener número total de slides
  const totalSlides = await page.evaluate(() => {
    return Reveal.getTotalSlides();
  });
  
  console.log(`📊 Total slides: ${totalSlides}\n`);
  
  for (let i = 0; i < totalSlides; i++) {
    // Navegar a la slide
    await page.evaluate((slideIndex) => {
      Reveal.slide(slideIndex);
    }, i);
    
    await page.waitForTimeout(500);
    
    // Obtener info de la slide actual
    const slideInfo = await page.evaluate(() => {
      const indices = Reveal.getIndices();
      const currentSlide = Reveal.getCurrentSlide();
      const ariaLabel = currentSlide.getAttribute('aria-label');
      return { h: indices.h, v: indices.v, label: ariaLabel };
    });
    
    // Buscar grids con cards
    const gridsWithIssues = await page.evaluate(() => {
      const results = [];
      
      // Selectores de grids conocidos
      const gridSelectors = [
        '.problem-grid',
        '.agenda-grid',
        '.tech-grid',
        '.cec-grid'
      ];
      
      gridSelectors.forEach(selector => {
        const grids = document.querySelectorAll(selector);
        
        grids.forEach((grid, gridIndex) => {
          const cards = Array.from(grid.querySelectorAll('.problem-card, .agenda-item, .tech-card, .cec-card'));
          
          if (cards.length < 2) return; // No tiene sentido verificar si solo hay 1 card
          
          // Obtener alturas de todas las cards
          const heights = cards.map(card => {
            const rect = card.getBoundingClientRect();
            return Math.round(rect.height);
          });
          
          // Verificar si todas tienen la misma altura
          const uniqueHeights = [...new Set(heights)];
          
          if (uniqueHeights.length > 1) {
            results.push({
              selector,
              gridIndex,
              cardCount: cards.length,
              heights,
              minHeight: Math.min(...heights),
              maxHeight: Math.max(...heights),
              diff: Math.max(...heights) - Math.min(...heights)
            });
          }
        });
      });
      
      return results;
    });
    
    if (gridsWithIssues.length > 0) {
      issues.push({
        slide: i + 1,
        label: slideInfo.label || `Slide ${i + 1}`,
        grids: gridsWithIssues
      });
      
      console.log(`⚠️  Slide ${i + 1}: ${slideInfo.label || 'Sin título'}`);
      gridsWithIssues.forEach(grid => {
        console.log(`   ${grid.selector}: ${grid.cardCount} cards con alturas diferentes`);
        console.log(`   Alturas: ${grid.heights.join('px, ')}px`);
        console.log(`   Diferencia: ${grid.diff}px (min: ${grid.minHeight}px, max: ${grid.maxHeight}px)\n`);
      });
    }
  }
  
  await browser.close();
  
  // Generar reporte
  const report = {
    timestamp: new Date().toISOString(),
    totalSlides,
    slidesWithIssues: issues.length,
    issues
  };
  
  fs.writeFileSync('card-heights-report.json', JSON.stringify(report, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log(`📋 RESUMEN:`);
  console.log(`   Total slides: ${totalSlides}`);
  console.log(`   Slides con problemas de altura: ${issues.length}`);
  console.log(`   Reporte guardado en: card-heights-report.json`);
  console.log('='.repeat(60));
  
  return issues;
}

checkCardHeights().catch(console.error);

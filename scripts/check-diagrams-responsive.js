const { chromium } = require('@playwright/test');

async function testDiagramsResponsive() {
  console.log('🔍 Testing diagrams responsive behavior...\n');
  
  const browser = await chromium.launch({ headless: true });
  
  // Test múltiples viewports
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  const results = [];
  
  for (const viewport of viewports) {
    const page = await browser.newPage({ 
      viewport: { width: viewport.width, height: viewport.height } 
    });
    
    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
    
    console.log(`\n📱 Testing ${viewport.name} (${viewport.width}x${viewport.height})`);
    console.log('='.repeat(60));
    
    // Obtener slides con diagramas
    const totalSlides = await page.evaluate(() => Reveal.getTotalSlides());
    
    for (let i = 0; i < totalSlides; i++) {
      await page.evaluate((slideIndex) => Reveal.slide(slideIndex), i);
      await page.waitForTimeout(300);
      
      const diagramInfo = await page.evaluate(() => {
        const currentSlide = Reveal.getCurrentSlide();
        const diagrams = currentSlide.querySelectorAll('.diagram-img, img[src*="diagram"], img[src*="arquitectura"], img[src*="cronologia"], img[src*="gitflow"]');
        
        if (diagrams.length === 0) return null;
        
        const slideLabel = currentSlide.getAttribute('aria-label');
        const issues = [];
        
        diagrams.forEach((img, idx) => {
          const rect = img.getBoundingClientRect();
          const container = img.closest('.diagram-stage');
          const containerRect = container ? container.getBoundingClientRect() : null;
          
          const info = {
            index: idx,
            src: img.src.split('/').pop(),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            aspectRatio: (rect.width / rect.height).toFixed(2),
            isOverflowing: rect.width > window.innerWidth || rect.height > window.innerHeight,
            hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
            containerWidth: containerRect ? Math.round(containerRect.width) : null,
            containerHeight: containerRect ? Math.round(containerRect.height) : null
          };
          
          // Detectar problemas
          if (info.isOverflowing) {
            issues.push(`Diagram ${idx}: Overflows viewport (${info.width}x${info.height})`);
          }
          if (info.hasHorizontalScroll) {
            issues.push(`Diagram ${idx}: Causes horizontal scroll`);
          }
          if (rect.width < 200) {
            issues.push(`Diagram ${idx}: Too small (${info.width}px width)`);
          }
          
          return info;
        });
        
        const diagrams_data = Array.from(diagrams).map((img, idx) => {
          const rect = img.getBoundingClientRect();
          return {
            index: idx,
            src: img.src.split('/').pop(),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        });
        
        return {
          slideIndex: Reveal.getIndices().h,
          label: slideLabel,
          diagramCount: diagrams.length,
          diagrams: diagrams_data,
          issues
        };
      });
      
      if (diagramInfo && diagramInfo.diagramCount > 0) {
        console.log(`\n  Slide ${i + 1}: ${diagramInfo.label || 'Sin título'}`);
        diagramInfo.diagrams.forEach(d => {
          console.log(`    - ${d.src}: ${d.width}x${d.height}px`);
        });
        
        if (diagramInfo.issues.length > 0) {
          console.log(`    ⚠️  Issues:`);
          diagramInfo.issues.forEach(issue => console.log(`       ${issue}`));
        } else {
          console.log(`    ✅ Responsive OK`);
        }
        
        results.push({
          viewport: viewport.name,
          slide: i + 1,
          label: diagramInfo.label,
          diagrams: diagramInfo.diagrams,
          issues: diagramInfo.issues
        });
      }
    }
    
    await page.close();
  }
  
  await browser.close();
  
  // Resumen
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE ISSUES POR VIEWPORT:\n');
  
  viewports.forEach(vp => {
    const vpResults = results.filter(r => r.viewport === vp.name);
    const withIssues = vpResults.filter(r => r.issues.length > 0);
    console.log(`${vp.name}: ${withIssues.length}/${vpResults.length} slides con problemas`);
  });
  
  // Issues más comunes
  const allIssues = results.flatMap(r => r.issues);
  console.log(`\n🔴 Total de issues detectados: ${allIssues.length}`);
  
  return results;
}

testDiagramsResponsive().catch(console.error);

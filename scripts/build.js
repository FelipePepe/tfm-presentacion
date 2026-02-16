const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const data = JSON.parse(fs.readFileSync('config/data.json', 'utf8'));
const slides = fs.readdirSync('slides')
  .filter(f => f.endsWith('.html'))
  .sort()
  .map(f => fs.readFileSync(path.join('slides', f), 'utf8'))
  .join('\n\n');

const header = fs.readFileSync('templates/header.html', 'utf8');
const footer = fs.readFileSync('templates/footer.html', 'utf8');

let html = header + '\n' + slides + '\n' + footer;

// Replace placeholders
html = html
  .replace(/\{\{project\.version\}\}/g, data.project.version)
  .replace(/\{\{project\.lastUpdate\}\}/g, data.project.lastUpdate)
  .replace(/\{\{metrics\.totalTests\}\}/g, String(data.metrics.totalTests))
  .replace(/\{\{metrics\.backendTests\}\}/g, String(data.metrics.backendTests))
  .replace(/\{\{metrics\.frontendTests\}\}/g, String(data.metrics.frontendTests))
  .replace(/\{\{metrics\.backendCoverage\}\}/g, data.metrics.backendCoverage)
  .replace(/\{\{metrics\.frontendCoverage\}\}/g, data.metrics.frontendCoverage)
  .replace(/\{\{metrics\.globalCoverage\}\}/g, data.metrics.globalCoverage)
  .replace(/\{\{metrics\.lastADR\}\}/g, String(data.metrics.lastADR))
  .replace(/\{\{releases\.current\}\}/g, data.releases.current)
  .replace(/\{\{api\.version\}\}/g, data.api.version)
  .replace(/\{\{api\.endpoints\}\}/g, String(data.api.endpoints))
  .replace(/\{\{author\.name\}\}/g, data.author.name)
  .replace(/\{\{author\.master\}\}/g, data.author.master)
  .replace(/\{\{author\.school\}\}/g, data.author.school)
  .replace(/\{\{author\.date\}\}/g, data.author.date);

const hash = crypto.createHash('md5').update(html).digest('hex').substring(0, 8);
const buildInfo = '\n<!-- Build: ' + new Date().toISOString() + ' | Hash: ' + hash + ' | Version: ' + data.project.version + ' -->';
html = html.replace('</head>', '  ' + buildInfo + '\n  </head>');

// Update Service Worker cache name
const swContent = fs.readFileSync('sw.js', 'utf8');
const newSwContent = swContent.replace(
  /const CACHE_NAME = 'tfm-presentacion-v[^']+'/,
  "const CACHE_NAME = 'tfm-presentacion-v" + data.project.version + "'"
);
fs.writeFileSync('sw.js', newSwContent);

fs.writeFileSync('index.html', html);
console.log('✅ Built index.html (' + (html.length / 1024).toFixed(2) + ' KB)');
console.log('🔖 Version:', data.project.version);
console.log('🔑 Cache hash:', hash);
console.log('💾 Service Worker cache updated');

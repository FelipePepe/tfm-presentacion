#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

interface ProjectData {
  project: {
    name: string;
    version: string;
    lastUpdate: string;
  };
  metrics: {
    totalTests: number;
    backendTests: number;
    frontendTests: number;
    backendCoverage: string;
    frontendCoverage: string;
    globalCoverage: string;
    bugs: number;
    vulnerabilities: number;
    lastADR: number;
  };
  releases: {
    current: string;
    stable: string[];
    inProgress: string | null;
  };
  api: {
    version: string;
    endpoints: number;
  };
  author: {
    name: string;
    master: string;
    school: string;
    date: string;
  };
  urls: {
    frontend: string;
    backend: string;
    swagger: string;
    github: string;
    slides: string;
  };
}

const CONFIG_PATH = path.join(__dirname, '../config/data.json');
const SLIDES_DIR = path.join(__dirname, '../slides');
const OUTPUT_PATH = path.join(__dirname, '../index.html');
const TEMPLATE_START = path.join(__dirname, '../templates/header.html');
const TEMPLATE_END = path.join(__dirname, '../templates/footer.html');

function loadData(): ProjectData {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function loadSlides(): string[] {
  const files = fs.readdirSync(SLIDES_DIR)
    .filter(f => f.endsWith('.html'))
    .sort();
  
  return files.map(file => {
    let content = fs.readFileSync(path.join(SLIDES_DIR, file), 'utf8');
    return content;
  });
}

function replacePlaceholders(content: string, data: ProjectData): string {
  // Replace all {{variable}} placeholders
  return content
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
}

function generateHash(content: string): string {
  return crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
}

function build() {
  console.log('🔨 Building presentation...');
  
  const data = loadData();
  const slides = loadSlides();
  
  console.log(`📊 Loaded ${slides.length} slides`);
  
  // Read templates
  const header = fs.readFileSync(TEMPLATE_START, 'utf8');
  const footer = fs.readFileSync(TEMPLATE_END, 'utf8');
  
  // Build complete HTML
  const slidesContent = slides.join('\n\n');
  let html = header + '\n' + slidesContent + '\n' + footer;
  
  // Replace placeholders
  html = replacePlaceholders(html, data);
  
  // Generate hash for cache busting
  const hash = generateHash(html);
  const buildInfo = `\n<!-- Build: ${new Date().toISOString()} | Hash: ${hash} | Version: ${data.project.version} -->`;
  
  html = html.replace('</head>', `  ${buildInfo}\n  </head>`);
  
  // Write output
  fs.writeFileSync(OUTPUT_PATH, html);
  
  console.log(`✅ Built index.html (${(html.length / 1024).toFixed(2)} KB)`);
  console.log(`🔖 Version: ${data.project.version}`);
  console.log(`🔑 Cache hash: ${hash}`);
}

build();

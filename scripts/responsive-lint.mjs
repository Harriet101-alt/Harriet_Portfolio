import { existsSync, readFileSync } from 'node:fs';
import { extname, relative } from 'node:path';

const root = process.cwd();
const inputFiles = process.argv.slice(2);
const allowLargeFixedLayout = new Set([
  'src/components/FlipJournal.tsx',
]);

const defaultFiles = [
  'index.html',
  'src/App.css',
  'src/index.css',
  'src/App.tsx',
];

const files = (inputFiles.length > 0 ? inputFiles : defaultFiles)
  .map((file) => file.replace(`${root}/`, ''))
  .filter((file) => existsSync(file))
  .filter((file) => ['.css', '.tsx', '.ts', '.html'].includes(extname(file)));

const errors = [];
const warnings = [];

const appCss = existsSync('src/App.css') ? readFileSync('src/App.css', 'utf8') : '';
const indexHtml = existsSync('index.html') ? readFileSync('index.html', 'utf8') : '';

if (!/<meta\s+name=["']viewport["'][^>]*width=device-width[^>]*initial-scale=1\.0/.test(indexHtml)) {
  errors.push('index.html: missing responsive viewport meta tag.');
}

if (!/img,\s*\n?picture,\s*\n?video,\s*\n?canvas,\s*\n?svg\s*\{[\s\S]*max-width:\s*100%/.test(appCss)) {
  errors.push('src/App.css: missing global max-width: 100% media constraint.');
}

if (!/img,\s*\n?video\s*\{[\s\S]*height:\s*auto/.test(appCss)) {
  errors.push('src/App.css: missing global height: auto media constraint for raster media.');
}

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const rel = relative(root, file);
  const lintPath = rel.startsWith('..') ? file : rel;
  const skipLargeFixedLayout = allowLargeFixedLayout.has(lintPath);

  if (skipLargeFixedLayout) continue;

  const lines = source.split('\n');
  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const arbitraryFixed = [...line.matchAll(/(?<!-)\b(?:w|min-w)-\[(\d+)px\]/g)];
    for (const match of arbitraryFixed) {
      const value = Number(match[1]);
      if (value > 480) {
        errors.push(`${lintPath}:${lineNumber}: fixed Tailwind width ${match[0]} exceeds the 480px mobile threshold.`);
      }
    }

    const inlineMinWidth = line.match(/\bminWidth:\s*['"](\d+)px['"]/);
    if (inlineMinWidth && Number(inlineMinWidth[1]) > 480) {
      errors.push(`${lintPath}:${lineNumber}: inline minWidth ${inlineMinWidth[1]}px will force mobile overflow.`);
    }

    const inlineWidth = line.match(/\bwidth:\s*['"](\d+)px['"]/);
    if (inlineWidth && Number(inlineWidth[1]) > 768 && !/\bmaxWidth\b/.test(line)) {
      errors.push(`${lintPath}:${lineNumber}: inline width ${inlineWidth[1]}px should be fluid or clamped.`);
    }

    const inlineHeight = line.match(/\bheight:\s*['"](\d+)px['"]/);
    if (inlineHeight && Number(inlineHeight[1]) > 768 && !/\bmaxHeight\b/.test(line)) {
      errors.push(`${lintPath}:${lineNumber}: inline height ${inlineHeight[1]}px should be fluid or clamped.`);
    }

    const largeFontPx = line.match(/\bfontSize:\s*['"](\d+)px['"]/);
    if (largeFontPx && Number(largeFontPx[1]) > 24) {
      warnings.push(`${lintPath}:${lineNumber}: fontSize ${largeFontPx[1]}px should usually be clamp() or rem unless decorative.`);
    }
  });
}

if (warnings.length > 0) {
  console.warn(`Responsive lint warnings:\n${warnings.map((warning) => `- ${warning}`).join('\n')}`);
}

if (errors.length > 0) {
  console.error(`Responsive lint failed:\n${errors.map((error) => `- ${error}`).join('\n')}`);
  process.exit(1);
}

console.log('Responsive lint passed.');

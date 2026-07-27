import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', msg => console.log('CONSOLE:', msg.text()));
page.on('pageerror', err => console.log('PAGEERROR:', err.message));
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.locator('#flip-journal').scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
const nextBtn = page.getByRole('button', { name: 'Next page' }).first();
await nextBtn.click({ force: true });
await page.waitForTimeout(1000);
const html = await page.evaluate(() => {
  const textPages = document.querySelectorAll('[style*="height: 100%"]');
  const fj = document.querySelector('#flip-journal');
  // find the left page slot text
  const bodyEls = Array.from(fj.querySelectorAll('p'));
  return bodyEls.map(p => p.textContent).filter(Boolean);
});
console.log('paragraphs found:', JSON.stringify(html, null, 2));
await browser.close();

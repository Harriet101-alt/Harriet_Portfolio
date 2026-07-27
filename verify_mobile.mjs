import { chromium } from 'playwright';
const url = 'http://localhost:5173/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('#flip-journal').scrollIntoViewIfNeeded();
await page.waitForTimeout(500);
await page.screenshot({ path: '/Users/fletch02/portfolio-template.worktrees/Harriet_Portfolio/m_spread0.png' });

const nextBtn = page.getByRole('button', { name: 'Next page' }).first();
await nextBtn.click({ force: true });
await page.waitForTimeout(1000);
await page.screenshot({ path: '/Users/fletch02/portfolio-template.worktrees/Harriet_Portfolio/m_spread1_collapsed.png' });

// tap the "Read the story" toggle
const toggle = page.getByRole('button', { name: /Read the story/ }).first();
await toggle.click();
await page.waitForTimeout(400);
await page.screenshot({ path: '/Users/fletch02/portfolio-template.worktrees/Harriet_Portfolio/m_spread1_expanded.png' });

// tap right page area (not on the toggle) to turn forward
await page.mouse.click(340, 500);
await page.waitForTimeout(1000);
await page.screenshot({ path: '/Users/fletch02/portfolio-template.worktrees/Harriet_Portfolio/m_spread2_after_tap.png' });

// tap left page area to go back
await page.mouse.click(50, 500);
await page.waitForTimeout(1000);
await page.screenshot({ path: '/Users/fletch02/portfolio-template.worktrees/Harriet_Portfolio/m_spread1_after_backtap.png' });

await browser.close();

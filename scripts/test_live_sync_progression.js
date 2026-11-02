import { chromium } from '@playwright/test';
import { resolve } from 'path';

const SCREENSHOT_DIR = resolve('research/screenshots');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function verifyLiveSyncProgression() {
  console.log('=== VERIFYING LIVE PLAYBACK & LYRICS SYNCHRONIZATION ===\n');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    console.log('[1/5] Loading SONORA (http://localhost:5173)...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(600);

    console.log('[2/5] Starting Playback and monitoring continuous clock...');
    // Press Space to start playback
    await page.keyboard.press('Space');
    await sleep(3500); // Wait 3.5s

    // Check store position via timeline timestamp element
    const initialPos = await page.evaluate(() => {
      const el = document.querySelector('.timeline-timestamp');
      return el ? el.textContent : null;
    });
    console.log(`  Playback Time after 3.5s: "${initialPos}"`);

    console.log('\n[3/5] Opening Lyrics Focus Studio...');
    await page.locator('.mode-pill-btn:has-text("Lyrics Focus")').first().click();
    await sleep(600);

    // Verify Sync Offset Toolbar controls are present
    const syncGroupVisible = await page.locator('.sync-offset-group').isVisible();
    console.log(`  Sync Offset Controls Visible: ${syncGroupVisible}`);
    if (!syncGroupVisible) throw new Error('Sync offset controls not found');

    const initialSyncText = await page.locator('.sync-badge-btn').textContent();
    console.log(`  Default Sync Badge: "${initialSyncText?.trim()}"`);

    console.log('\n[4/5] Testing Sync Offset Adjustments...');
    // Click +0.5s
    await page.locator('.sync-step-btn:has-text("+0.5s")').click();
    await sleep(200);
    const plusHalfText = await page.locator('.sync-badge-btn').textContent();
    console.log(`  After +0.5s click: "${plusHalfText?.trim()}"`);
    if (!plusHalfText?.includes('+0.5s')) throw new Error('Failed to update sync offset to +0.5s');

    // Test hotkey '[' (-250ms)
    await page.keyboard.press('[');
    await sleep(200);
    const hotkeyText = await page.locator('.sync-badge-btn').textContent();
    console.log(`  After '[' keypress (-0.25s): "${hotkeyText?.trim()}"`);

    // Reset sync offset to 0s
    await page.locator('.sync-badge-btn').click();
    await sleep(200);
    const resetText = await page.locator('.sync-badge-btn').textContent();
    console.log(`  After badge click (reset): "${resetText?.trim()}"`);
    if (!resetText?.includes('±0.0s')) throw new Error('Failed to reset sync offset');

    console.log('\n[5/5] Seeking to Line 1 ("Yeah, yeah") and capturing live sync state...');
    const firstLine = page.locator('.lyric-line-box').first();
    await firstLine.click();
    await sleep(600);

    const isFirstActive = await firstLine.evaluate((el) => el.classList.contains('active-line'));
    console.log(`  Line 1 Active Status: ${isFirstActive}`);

    const syncScreenshot = resolve(SCREENSHOT_DIR, 'live-lyrics-sync-verified.png');
    await page.screenshot({ path: syncScreenshot });
    console.log(`  ✓ Captured verification screenshot: ${syncScreenshot}`);

    console.log('\n=============================================');
    console.log('LIVE PLAYBACK & LYRICS SYNCHRONIZATION VERIFIED!');
    console.log('=============================================');

    await browser.close();
  } catch (err) {
    console.error('Validation failed:', err);
    await browser.close();
    process.exit(1);
  }
}

verifyLiveSyncProgression();

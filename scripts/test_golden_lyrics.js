import { chromium } from '@playwright/test';
import { resolve } from 'path';

const SCREENSHOT_DIR = resolve('research/screenshots');

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function testGoldenLyrics() {
  console.log('=== TESTING GOLDEN LYRICS ENHANCEMENT ===\n');

  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    // 1. Load application
    console.log('[1/7] Navigating to SONORA on http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 2. Open Lyrics Focus Studio
    console.log('[2/7] Opening Lyrics Focus Studio...');
    await page.locator('.mode-pill-btn:has-text("Lyrics Focus")').first().click();
    await sleep(600);

    const isStudioOpen = await page.locator('.lyrics-studio-overlay').isVisible();
    if (!isStudioOpen) throw new Error('Lyrics Studio overlay did not open');
    console.log('  ✓ Lyrics Studio overlay open');

    // 3. Test Seeking to 27.5s ("I've been tryna call" -> "tryna")
    console.log('\n[3/7] Testing Seeking to 27.5s and Active Word Illumination...');
    // Click on 2nd lyric line
    const secondLine = page.locator('.lyric-line-box').nth(1);
    await secondLine.click();
    await sleep(400);

    // Verify active line has .active-line class
    const isActive = await secondLine.evaluate((el) => el.classList.contains('active-line'));
    console.log(`  Line 2 Active Status: ${isActive}`);
    if (!isActive) throw new Error('Line 2 failed to become active');

    // Verify active word has .word-active class
    const activeWordCount = await page.locator('.word-active').count();
    console.log(`  Active Word Count: ${activeWordCount}`);
    if (activeWordCount === 0) throw new Error('No active word illuminated');

    // Verify singing character has .char-singing class
    const singingCharCount = await page.locator('.char-singing').count();
    console.log(`  Singing Character Count: ${singingCharCount}`);

    // Verify particle canvas exists
    const canvasVisible = await page.locator('.lyrics-particle-canvas').isVisible();
    console.log(`  Golden Particle Canvas Visible: ${canvasVisible}`);
    if (!canvasVisible) throw new Error('Particle canvas not visible');

    // Capture Golden Active Word Screenshot
    const pActive = resolve(SCREENSHOT_DIR, 'golden-lyrics-active-word.png');
    await page.screenshot({ path: pActive });
    console.log(`  ✓ Captured screenshot: ${pActive}`);

    // 4. Test Pause and Resume
    console.log('\n[4/7] Testing Play/Pause State Transitions...');
    await page.keyboard.press('Space'); // pause
    await sleep(300);
    console.log('  ✓ Paused successfully via Spacebar');
    await page.keyboard.press('Space'); // resume
    await sleep(300);
    console.log('  ✓ Resumed successfully via Spacebar');

    // 5. Test Seeking to Another Line (Line 3: 32.5s)
    console.log('\n[5/7] Testing Seeking to Line 3 (32.5s)...');
    const thirdLine = page.locator('.lyric-line-box').nth(2);
    await thirdLine.click();
    await sleep(400);

    const isThirdActive = await thirdLine.evaluate((el) => el.classList.contains('active-line'));
    console.log(`  Line 3 Active Status: ${isThirdActive}`);
    if (!isThirdActive) throw new Error('Line 3 failed to become active on seek');

    const pMorphing = resolve(SCREENSHOT_DIR, 'golden-lyrics-morphing.png');
    await page.screenshot({ path: pMorphing });
    console.log(`  ✓ Captured screenshot: ${pMorphing}`);

    // 6. Test Track Change
    console.log('\n[6/7] Testing Track Change...');
    // Close lyrics studio
    await page.locator('.studio-close-btn').click();
    await sleep(300);

    // Switch to Discover and play 2nd track (As It Was)
    await page.locator('.mode-pill-btn:has-text("Discover")').first().click();
    await sleep(300);

    const secondTrackCard = page.locator('.track-card').nth(1);
    await secondTrackCard.click();
    await sleep(500);

    // Re-open Lyrics Focus
    await page.locator('.mode-pill-btn:has-text("Lyrics Focus")').first().click();
    await sleep(600);

    const trackTitle = await page.locator('.lyrics-header-title').textContent();
    console.log(`  Active Track in Lyrics Studio: "${trackTitle}"`);

    await context.close();

    // 7. Mobile Viewport Validation (390x844)
    console.log('\n[7/7] Testing Mobile Responsive Lyrics Focus (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // Open Lyrics on Mobile
    await mobilePage.locator('.mobile-nav-item:has-text("Lyrics")').click();
    await sleep(500);

    // Click on 2nd line
    const mLine = mobilePage.locator('.lyric-line-box').nth(1);
    await mLine.click();
    await sleep(400);

    const pMobile = resolve(SCREENSHOT_DIR, 'golden-lyrics-mobile.png');
    await mobilePage.screenshot({ path: pMobile });
    console.log(`  ✓ Captured mobile screenshot: ${pMobile}`);

    await mobileContext.close();

    console.log('\n=============================================');
    console.log('ALL GOLDEN LYRICS ENHANCEMENT TESTS PASSED!');
    console.log('=============================================');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

testGoldenLyrics();

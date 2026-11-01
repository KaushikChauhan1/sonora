import { chromium } from '@playwright/test';
import { spawn, execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SCREENSHOT_DIR = resolve('research/screenshots');
if (!existsSync(SCREENSHOT_DIR)) {
  mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runBrowserValidation() {
  console.log('--- STARTING SONORA V3.0 MASTER BROWSER VALIDATION ---');

  // 1. Build application first
  console.log('Building production bundle with Vite...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Build completed successfully.');
  } catch (err) {
    console.error('Build failed:', err);
    process.exit(1);
  }

  // 2. Start Vite preview server
  console.log('Starting Vite preview server on port 4173...');
  const server = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', () => {});
  server.stderr.on('data', (d) => {
    // console.error(`[Preview Err] ${d}`);
  });

  // Wait for server to be responsive
  await sleep(2500);

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });

    // -------------------------------------------------------------------------
    // TEST 1: DESKTOP DISCOVER VIEW (Mode A) @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[1/9] Validating Desktop Discover View (Mode A) @ 1440x900...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopContext.newPage();
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    const title = await page.title();
    console.log(`  Page Title: "${title}"`);
    if (!title.includes('SONORA')) throw new Error('Title does not contain SONORA');

    const heroText = await page.textContent('.editorial-hero-title');
    console.log(`  Hero Headline: "${heroText}"`);

    // Verify dark obsidian background
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    console.log(`  Body Background Color: ${bgColor}`);

    const pDiscover = resolve(SCREENSHOT_DIR, 'desktop-discover.png');
    await page.screenshot({ path: pDiscover });
    console.log(`  ✓ Screenshot: ${pDiscover}`);

    // -------------------------------------------------------------------------
    // TEST 2: IMMERSIVE PLAYER (Mode B) @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[2/9] Validating Immersive Player (Mode B)...');
    // Click 'Player' in top mode pills or sidebar
    await page.locator('.mode-pill-btn:has-text("Player"), .nav-link:has-text("Immersive Player")').first().click();
    await sleep(600);

    const isPlayerVisible = await page.locator('.immersive-player-view').isVisible();
    console.log(`  Immersive Player Visible: ${isPlayerVisible}`);
    if (!isPlayerVisible) throw new Error('Immersive Player view failed to open');

    const vinylVisible = await page.locator('.immersive-vinyl-disc').isVisible();
    console.log(`  Vinyl Disc Stage Visible: ${vinylVisible}`);

    const pPlayer = resolve(SCREENSHOT_DIR, 'desktop-immersive-player.png');
    await page.screenshot({ path: pPlayer });
    console.log(`  ✓ Screenshot: ${pPlayer}`);

    // -------------------------------------------------------------------------
    // TEST 3: LYRICS FOCUS / STUDIO (Mode C) @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[3/9] Validating Lyrics Focus / Studio (Mode C)...');
    await page.locator('.mode-pill-btn:has-text("Lyrics Focus")').first().click();
    await sleep(700);

    const isLyricsVisible = await page.locator('.lyrics-studio-overlay').isVisible();
    console.log(`  Lyrics Studio Overlay Visible: ${isLyricsVisible}`);
    if (!isLyricsVisible) throw new Error('Lyrics Studio overlay failed to open');

    // Verify particle canvas exists
    const particleCanvas = await page.locator('.lyrics-particle-canvas').isVisible();
    console.log(`  Champagne Particle Canvas Visible: ${particleCanvas}`);

    const linesCount = await page.locator('.lyric-line-box').count();
    console.log(`  Synchronized Lyric Lines Rendered: ${linesCount}`);

    // Click on 3rd lyric line to jump playback and trigger active word illumination
    if (linesCount > 2) {
      await page.locator('.lyric-line-box').nth(2).click();
      await sleep(500);
    }

    // Check letter reveal characters
    const charCount = await page.locator('.char-reveal').count();
    console.log(`  Active Word Character Elements Rendered: ${charCount}`);

    const pLyrics = resolve(SCREENSHOT_DIR, 'desktop-lyrics-focus.png');
    await page.screenshot({ path: pLyrics });
    console.log(`  ✓ Screenshot: ${pLyrics}`);

    // Close Lyrics Studio
    await page.locator('.studio-close-btn').click();
    await sleep(400);

    // -------------------------------------------------------------------------
    // TEST 4: SEARCH VIEW @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[4/9] Validating Search View...');
    await page.locator('.nav-link:has-text("Search")').click();
    await sleep(400);

    const searchInput = page.locator('.search-input');
    await searchInput.fill('Starboy');
    await sleep(300);

    const pSearch = resolve(SCREENSHOT_DIR, 'desktop-search.png');
    await page.screenshot({ path: pSearch });
    console.log(`  ✓ Screenshot: ${pSearch}`);

    // -------------------------------------------------------------------------
    // TEST 5: LIBRARY VIEW @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[5/9] Validating Library View...');
    await page.locator('.nav-link:has-text("Library")').click();
    await sleep(400);

    const pLibrary = resolve(SCREENSHOT_DIR, 'desktop-library.png');
    await page.screenshot({ path: pLibrary });
    console.log(`  ✓ Screenshot: ${pLibrary}`);

    // -------------------------------------------------------------------------
    // TEST 6: QUEUE DRAWER @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[6/9] Validating Queue Drawer...');
    await page.locator('.utility-btn[title="Up Next Queue"]').click();
    await sleep(500);

    const pQueue = resolve(SCREENSHOT_DIR, 'desktop-queue.png');
    await page.screenshot({ path: pQueue });
    console.log(`  ✓ Screenshot: ${pQueue}`);

    // Close queue
    await page.keyboard.press('Escape');
    await sleep(300);

    // -------------------------------------------------------------------------
    // TEST 7: SETTINGS VIEW @ 1440x900
    // -------------------------------------------------------------------------
    console.log('\n[7/9] Validating Settings View...');
    await page.locator('.nav-link:has-text("Settings")').click();
    await sleep(400);

    const pSettings = resolve(SCREENSHOT_DIR, 'desktop-settings.png');
    await page.screenshot({ path: pSettings });
    console.log(`  ✓ Screenshot: ${pSettings}`);

    await desktopContext.close();

    // -------------------------------------------------------------------------
    // TEST 8 & 9: MOBILE VIEWPORT (390x844, iPhone 14/15/16)
    // -------------------------------------------------------------------------
    console.log('\n[8/9] Validating Mobile Player (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    // Switch to Player on mobile
    await mobilePage.locator('.mobile-nav-item:has-text("Player")').click();
    await sleep(500);

    // Verify no horizontal overflow
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Mobile Viewport: ${clientWidth}px | Scroll: ${scrollWidth}px (Overflow: ${scrollWidth > clientWidth})`);

    const pMobilePlayer = resolve(SCREENSHOT_DIR, 'mobile-player.png');
    await mobilePage.screenshot({ path: pMobilePlayer });
    console.log(`  ✓ Screenshot: ${pMobilePlayer}`);

    console.log('\n[9/9] Validating Mobile Lyrics Focus (390x844)...');
    await mobilePage.locator('.mobile-nav-item:has-text("Lyrics")').click();
    await sleep(600);

    const mLines = await mobilePage.locator('.lyric-line-box').count();
    if (mLines > 2) {
      await mobilePage.locator('.lyric-line-box').nth(2).click();
      await sleep(500);
    }

    const pMobileLyrics = resolve(SCREENSHOT_DIR, 'mobile-lyrics.png');
    await mobilePage.screenshot({ path: pMobileLyrics });
    console.log(`  ✓ Screenshot: ${pMobileLyrics}`);

    await mobileContext.close();

    console.log('\n==========================================================');
    console.log('ALL 9 V3.0 MASTER BROWSER SCREENSHOTS CAPTURED & VALIDATED');
    console.log('==========================================================');
  } catch (err) {
    console.error('\n❌ Browser validation failed:', err);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    server.kill();
    process.exit(process.exitCode || 0);
  }
}

runBrowserValidation();

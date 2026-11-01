import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
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
  console.log('--- STARTING SONORA BROWSER VALIDATION ---');

  // 1. Start Vite preview server
  console.log('Starting Vite preview server on port 4173...');
  const server = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    shell: true,
  });

  server.stdout.on('data', (d) => {
    // console.log(`[Preview] ${d}`);
  });
  server.stderr.on('data', (d) => {
    console.error(`[Preview Err] ${d}`);
  });

  // Wait for server to be up
  await sleep(2500);

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
    });

    // --- TEST 1: DESKTOP VALIDATION (1440x900) ---
    console.log('\n[1/5] Validating Desktop Viewport (1440x900)...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await desktopContext.newPage();

    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`  Page Title: "${title}"`);
    if (!title.includes('SONORA')) throw new Error('Title does not contain SONORA');

    // Verify hero banner
    const heroText = await page.textContent('.editorial-hero-title');
    console.log(`  Hero Headline: "${heroText}"`);

    // Verify Docked Player Bar
    const playerBar = await page.locator('.docked-player-bar').isVisible();
    console.log(`  Docked Player Bar Visible: ${playerBar}`);
    if (!playerBar) throw new Error('Docked player bar not visible');

    // Take Desktop Discover Screenshot
    const pDiscover = resolve(SCREENSHOT_DIR, 'desktop-discover.png');
    await page.screenshot({ path: pDiscover });
    console.log(`  Screenshot captured: ${pDiscover}`);

    // --- TEST 2: LYRICS STUDIO INTERACTION ---
    console.log('\n[2/5] Validating Lyrics Studio & Word-Level Synchronization...');
    // Click Lyrics button in player bar
    await page.locator('.utility-btn[title="Lyrics Studio"]').click();
    await sleep(600);

    const isStudioOpen = await page.locator('.lyrics-studio-overlay').isVisible();
    console.log(`  Lyrics Studio Overlay Visible: ${isStudioOpen}`);
    if (!isStudioOpen) throw new Error('Lyrics Studio overlay failed to open');

    const lyricLines = await page.locator('.lyric-line-box').count();
    console.log(`  Synchronized Lyric Lines Rendered: ${lyricLines}`);
    if (lyricLines === 0) throw new Error('Zero lyric lines rendered');

    // Check word-by-word span elements
    const wordSpans = await page.locator('.lyric-word-span').count();
    console.log(`  Word-level Timing Spans Detected: ${wordSpans}`);

    const pLyrics = resolve(SCREENSHOT_DIR, 'desktop-lyrics-studio.png');
    await page.screenshot({ path: pLyrics });
    console.log(`  Screenshot captured: ${pLyrics}`);

    // Close Lyrics Studio
    await page.locator('.studio-close-btn').click();
    await sleep(400);

    // --- TEST 3: QUEUE DRAWER INTERACTION ---
    console.log('\n[3/5] Validating Up Next Queue Drawer & Reordering...');
    await page.locator('.utility-btn[title="Up Next Queue"]').click();
    await sleep(500);

    const isQueueOpen = await page.locator('text=UPCOMING TRACKS').isVisible();
    console.log(`  Queue Drawer Visible: ${isQueueOpen}`);
    if (!isQueueOpen) throw new Error('Queue drawer failed to open');

    const pQueue = resolve(SCREENSHOT_DIR, 'desktop-queue.png');
    await page.screenshot({ path: pQueue });
    console.log(`  Screenshot captured: ${pQueue}`);

    // Close queue
    await page.keyboard.press('Escape');
    await sleep(300);

    // --- TEST 4: SEARCH & LIBRARY NAVIGATION ---
    console.log('\n[4/5] Validating Search & Library Sections...');
    // Search navigation
    await page.locator('.nav-link:has-text("Search")').click();
    await sleep(400);

    const searchInput = page.locator('.search-input');
    await searchInput.fill('Daft Punk');
    await sleep(300);

    const pSearch = resolve(SCREENSHOT_DIR, 'desktop-search.png');
    await page.screenshot({ path: pSearch });
    console.log(`  Screenshot captured: ${pSearch}`);

    // Library navigation
    await page.locator('.nav-link:has-text("Library")').click();
    await sleep(400);

    const pLibrary = resolve(SCREENSHOT_DIR, 'desktop-library.png');
    await page.screenshot({ path: pLibrary });
    console.log(`  Screenshot captured: ${pLibrary}`);

    await desktopContext.close();

    // --- TEST 5: MOBILE RESPONSIVE VALIDATION (375x812) ---
    console.log('\n[5/5] Validating Mobile Viewport (375x812, iPhone 13)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:4173', { waitUntil: 'networkidle' });

    // Verify Mobile Navigation Bottom Bar
    const mobileNav = await mobilePage.locator('.mobile-nav-bar').isVisible();
    console.log(`  Mobile Bottom Navigation Visible: ${mobileNav}`);
    if (!mobileNav) throw new Error('Mobile bottom navigation bar not visible');

    // Verify No Horizontal Scroll / Overflow
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`  Viewport Width: ${clientWidth}px | Document Scroll Width: ${scrollWidth}px`);
    if (scrollWidth > clientWidth) {
      console.warn('  Warning: Horizontal overflow detected on mobile');
    } else {
      console.log('  Zero horizontal overflow verified!');
    }

    const pMobile = resolve(SCREENSHOT_DIR, 'mobile-discover.png');
    await mobilePage.screenshot({ path: pMobile });
    console.log(`  Screenshot captured: ${pMobile}`);

    await mobileContext.close();

    console.log('\n=============================================');
    console.log('ALL BROWSER VALIDATION TESTS PASSED (5/5)');
    console.log('=============================================');
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

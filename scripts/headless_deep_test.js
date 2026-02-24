const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
    const email = process.env.SMOKE_EMAIL;
    const password = process.env.SMOKE_PASSWORD;

    if (!email || !password) {
        console.error('Missing SMOKE_EMAIL or SMOKE_PASSWORD environment variables.');
        process.exit(2);
    }

    const outDir = path.join(__dirname, 'deep_screens');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(60000);
    try {
        try {
            await page.goto('https://gre-vocab-app-phi.vercel.app/', { waitUntil: 'networkidle', timeout: 60000 });
        } catch (e) {
            // Retry with less strict waitUntil
            await page.goto('https://gre-vocab-app-phi.vercel.app/', { waitUntil: 'load', timeout: 60000 });
        }
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Login")');
        await page.waitForSelector('text=Logged in as', { timeout: 20000 });
        await page.screenshot({ path: path.join(outDir, 'logged-in.png'), fullPage: true });

        // Practice Quiz: select first two visible word chips and submit
        await page.click('button:has-text("Practice Quiz")');
        await page.waitForSelector('text=Practice Quiz', { timeout: 8000 });
        // Wait a moment for question words to render
        await sleep(500);
        const wordChips = await page.$$('button span, span');
        // Try to click up to 4 unique word chips (pair them)
        let clicked = 0;
        for (const chip of wordChips) {
            const text = (await chip.innerText()).trim();
            if (!text) continue;
            try { await chip.click({ force: true }); } catch (e) { try { await chip.click(); } catch { } }
            clicked++;
            if (clicked >= 4) break;
        }
        // Click Check/Submit button if present
        try { await page.click('button:has-text("Check")'); } catch { }
        try { await page.click('button:has-text("Submit")'); } catch { }
        await page.screenshot({ path: path.join(outDir, 'after-quiz.png'), fullPage: true });

        // Go to Weak Pairs
        await page.click('button:has-text("Weak Pairs")');
        await page.waitForSelector('text=Weak Pairs', { timeout: 8000 });
        await page.screenshot({ path: path.join(outDir, 'weak-pairs-view.png'), fullPage: true });

        // Perform a search for a known word from greClusters (try "abate" as example)
        const testWord = 'abate';
        await page.fill('input[placeholder*="Search a word"], input[placeholder*="Search"]', testWord);
        await page.click('button:has-text("Search")');
        await page.waitForSelector('text=Meaning:', { timeout: 8000 });
        await page.screenshot({ path: path.join(outDir, 'search-result.png'), fullPage: true });

        // Logout
        try {
            await page.click('button:has-text("Logout")');
            await page.waitForSelector('text=Login to Save Your Progress', { timeout: 8000 });
            await page.screenshot({ path: path.join(outDir, 'after-logout.png'), fullPage: true });
        } catch (e) {
            // ignore
        }

        console.log('deep-test: done');
    } catch (err) {
        console.error('deep-test error:', err.message || err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();

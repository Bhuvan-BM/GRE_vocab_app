const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
    const email = process.env.SMOKE_EMAIL;
    const password = process.env.SMOKE_PASSWORD;

    if (!email || !password) {
        console.error('Missing SMOKE_EMAIL or SMOKE_PASSWORD environment variables.');
        process.exit(2);
    }

    const outDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://gre-vocab-app-phi.vercel.app/', { waitUntil: 'networkidle' });

        // Wait for login form
        await page.waitForSelector('input[type="email"]', { timeout: 15000 });
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        await page.click('button:has-text("Login")');

        // Wait for logged-in indicator
        await page.waitForSelector('text=Logged in as', { timeout: 20000 });
        await page.screenshot({ path: path.join(outDir, 'after-login.png'), fullPage: true });

        const views = [
            { name: 'Visual Tree', check: 'Visual Cluster Tree', file: 'visual-tree.png' },
            { name: 'Practice Quiz', check: 'Practice Quiz', file: 'practice-quiz.png' },
            { name: 'Weak Pairs', check: 'Weak Pairs', file: 'weak-pairs.png' }
        ];

        const results = [];

        for (const v of views) {
            try {
                await page.click(`button:has-text("${v.name}")`);
            } catch (e) {
                // continue — maybe selector not found
            }

            try {
                await page.waitForSelector(`text=${v.check}`, { timeout: 8000 });
                results.push({ view: v.name, status: 'ok' });
            } catch (err) {
                results.push({ view: v.name, status: 'missing' });
            }

            await page.screenshot({ path: path.join(outDir, v.file), fullPage: true });
        }

        console.log(JSON.stringify({ results }, null, 2));
    } catch (err) {
        console.error('Smoke test error:', err.message || err);
        process.exitCode = 1;
    } finally {
        await browser.close();
    }
})();

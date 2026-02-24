const fs = require('fs');

try {
    const j = JSON.parse(fs.readFileSync('src/lib/greClusters.json', 'utf8'));
    const clusters = j.clusters;
    const words = j.words;
    console.log('clusters=', clusters.length, 'words=', words.length);

    const makeWordMap = new Map();
    words.forEach(w => makeWordMap.set(w.text.toLowerCase(), w));

    function getWordInfo(w) {
        return makeWordMap.get(w.toLowerCase()) || null;
    }

    console.log('getWordInfo(acclaim)=', getWordInfo('acclaim'));

    function search(q, limit = 10) {
        const qq = q.toLowerCase();
        return words.filter(w => w.text.toLowerCase().includes(qq)).slice(0, limit);
    }

    console.log('search("ion") sample=', search('ion'));

    function lev(a, b) {
        const m = a.length, n = b.length;
        const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
        for (let i = 0; i <= m; i++) dp[i][0] = i;
        for (let j = 0; j <= n; j++) dp[0][j] = j;
        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            }
        }
        return dp[m][n];
    }

    function buildPairs(maxPairs = 10) {
        const ws = words.map(w => w.text);
        const pairs = [];
        for (let i = 0; i < ws.length; i++) {
            for (let j = i + 1; j < ws.length; j++) {
                const a = ws[i].toLowerCase(), b = ws[j].toLowerCase();
                if (a === b) continue;
                const gA = makeWordMap.get(a).groupId, gB = makeWordMap.get(b).groupId;
                if (gA === gB) continue;
                let k = 0, mn = Math.min(a.length, b.length);
                while (k < mn && a[k] === b[k]) k++;
                const prefixLen = k;
                const dist = lev(a, b);
                if (prefixLen >= 4 || dist <= 1) {
                    pairs.push({ word1: ws[i], word2: ws[j], prefixLen, dist });
                    if (pairs.length >= maxPairs) return pairs;
                }
            }
        }
        return pairs;
    }

    const p = buildPairs(12);
    console.log('weak pair candidates sample:', p);
} catch (err) {
    console.error('smoke test error', err);
    process.exit(1);
}

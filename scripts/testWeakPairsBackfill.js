const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/lib/greClusters.json', 'utf8'));
const words = data.words;

const normalizeKey = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const map = new Map();
words.forEach(w => {
    const k = normalizeKey(w.text);
    if (!map.has(k)) map.set(k, w);
    const exact = (w.text || '').toLowerCase();
    if (!map.has(exact)) map.set(exact, w);
});

const samplePairs = [
    { word1: 'rebuff', word2: 'garrulous' },
    { word1: 'clichéd', word2: 'verbose' },
    { word1: 'acclaim', word2: 'commend' }
];

samplePairs.forEach(p => {
    const w1 = map.get(normalizeKey(p.word1)) || map.get(p.word1.toLowerCase()) || null;
    const w2 = map.get(normalizeKey(p.word2)) || map.get(p.word2.toLowerCase()) || null;
    console.log('Pair:', p.word1, '+', p.word2);
    console.log('  w1 ->', w1 ? `${w1.text} (cluster ${w1.groupId})` : 'NOT FOUND');
    console.log('  w2 ->', w2 ? `${w2.text} (cluster ${w2.groupId})` : 'NOT FOUND');
});

process.exit(0);

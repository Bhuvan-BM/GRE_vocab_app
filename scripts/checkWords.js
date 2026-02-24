const fs = require('fs');

const data = JSON.parse(fs.readFileSync('src/lib/greClusters.json', 'utf8'));
const clusters = data.clusters;

const all = [];
clusters.forEach(c => {
    c.subClusters.forEach(sc => {
        sc.words.forEach(w => all.push({ clusterId: c.id, clusterName: c.name, subCluster: sc.name, raw: w }));
    });
});

const normalize = (s) => s.trim().replace(/[\u2018\u2019\u201c\u201d]/g, '').replace(/\.$/, '');

const seen = new Map();
const problems = [];

all.forEach(item => {
    const norm = normalize(item.raw);
    const key = norm.toLowerCase();
    if (seen.has(key)) {
        seen.set(key, seen.get(key) + 1);
    } else {
        seen.set(key, 1);
    }

    // detect suspicious entries
    if (/\s/.test(norm) || /[^a-zA-Z\-']/i.test(norm)) {
        problems.push({ raw: item.raw, norm, clusterId: item.clusterId, clusterName: item.clusterName, subCluster: item.subCluster });
    }
});

const uniqueCount = seen.size;
const totalCount = all.length;

console.log('Total raw entries:', totalCount);
console.log('Unique normalized words:', uniqueCount);

// list duplicates
const duplicates = Array.from(seen.entries()).filter(([k, v]) => v > 1).map(([k, v]) => ({ word: k, count: v }));
console.log('Duplicates count:', duplicates.length);
if (duplicates.length > 0) console.log('Sample duplicates:', duplicates.slice(0, 30));

console.log('\nProblematic entries (contain spaces or non-letter chars):', problems.length);
if (problems.length > 0) console.log('Sample problems:', problems.slice(0, 50));

// show words that might be missing: entries that include parentheses or colons
const likelyParserErrors = all.filter(i => /[:()]/.test(i.raw)).map(i => ({ raw: i.raw, cluster: i.clusterName, sub: i.subCluster }));
console.log('\nLikely parser-issue lines containing punctuation (: or ( ) ):', likelyParserErrors.length);
if (likelyParserErrors.length > 0) console.log(likelyParserErrors.slice(0, 40));

// Exit 0
process.exit(0);

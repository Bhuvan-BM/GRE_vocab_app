import { GRE_CLUSTERS, GRE_WORDS } from './greClusters';

// Normalize string: remove diacritics and lowercase
const normalizeKey = (s) => {
    if (!s) return '';
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

// Map words to their cluster info for fast lookup using normalized keys
const wordMap = new Map();
GRE_WORDS.forEach(w => {
    const key = normalizeKey(w.text);
    // store the canonical info; if duplicates, keep first
    if (!wordMap.has(key)) wordMap.set(key, w);
    // also store exact lowercased key for backwards exact-match
    const exact = (w.text || '').toLowerCase();
    if (!wordMap.has(exact)) wordMap.set(exact, w);
});

export const getClusterById = (id) => {
    return GRE_CLUSTERS.find(c => c.id === id) || null;
};

export const getClustersForWord = (word) => {
    if (!word) return [];
    const lower = word.toLowerCase();
    const info = wordMap.get(lower);
    if (!info) return [];
    const cluster = getClusterById(info.groupId);
    return cluster ? [{ cluster, subClusterName: info.subCluster }] : [];
};

export const getWordInfo = (word) => {
    if (!word) return null;
    const lower = word.toLowerCase();
    const norm = normalizeKey(word);
    const info = wordMap.get(norm) || wordMap.get(lower);
    if (!info) return null;

    const cluster = GRE_CLUSTERS.find(c => c.id === info.groupId) || null;
    const sub = cluster ? cluster.subClusters.find(sc => sc.name === info.subCluster) : null;

    const synonyms = sub ? sub.words.filter(w => w.toLowerCase() !== lower) : [];

    return {
        id: info.id,
        text: info.text,
        groupId: info.groupId,
        groupName: info.groupName,
        subCluster: info.subCluster,
        meaning: sub ? sub.name : info.subCluster,
        synonyms,
        cluster: cluster ? `Cluster ${cluster.id}: ${cluster.name}` : info.groupName
    };
};

export const searchWords = (query, limit = 20) => {
    if (!query) return [];
    const q = normalizeKey(query);
    const results = GRE_WORDS.filter(w => normalizeKey(w.text).includes(q));
    return results.slice(0, limit);
};

// Simple Levenshtein distance for small candidate generation
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
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

// Build weak pair candidates using simple heuristics (prefix or edit distance)
export const buildWeakPairCandidates = (maxPairs = 300) => {
    const words = GRE_WORDS.map(w => w.text);
    const pairs = [];
    const seen = new Set();

    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            const a = words[i];
            const b = words[j];
            const la = a.toLowerCase();
            const lb = b.toLowerCase();
            if (la === lb) continue;

            const sameCluster = (wordMap.get(la)?.groupId === wordMap.get(lb)?.groupId);
            if (sameCluster) continue; // we want confusable across clusters

            const prefixLen = (function () {
                let k = 0;
                const min = Math.min(la.length, lb.length);
                while (k < min && la[k] === lb[k]) k++;
                return k;
            })();

            const dist = levenshtein(la, lb);

            if (prefixLen >= 4 || dist <= 1) {
                const key = [a, b].sort().join('|');
                if (!seen.has(key)) {
                    seen.add(key);
                    pairs.push({ word1: a, word2: b, prefixLen, dist });
                    if (pairs.length >= maxPairs) return pairs;
                }
            }
        }
    }

    return pairs;
};

export default {
    getClusterById,
    getClustersForWord,
    getWordInfo,
    searchWords,
    buildWeakPairCandidates
};

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'C:\\Users\\bhuva\\Downloads\\GRE_Master_Vocabulary_CORRECTED.md';
const outJson = path.join(__dirname, '..', 'src', 'lib', 'greClusters.json');
const outJs = path.join(__dirname, '..', 'src', 'lib', 'greClusters.js');

function splitIgnoringCommisInParentheses(str) {
    const parts = [];
    let current = '';
    let inParens = 0;
    for (let char of str) {
        if (char === '(') inParens++;
        if (char === ')') inParens--;
        if (char === ',' && inParens === 0) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

function parse(md) {
    const clusters = [];

    // Split by group headers (lines starting with '##')
    const groupParts = md.split(/^##\s+/m).map(s => s.trim()).filter(Boolean);

    groupParts.forEach(part => {
        const lines = part.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return;

        const header = lines[0];
        const m = header.match(/^Group\s*(\d+)\s*:\s*(.+)$/i);
        let idRaw = null;
        let name = header;
        if (m) {
            idRaw = parseInt(m[1], 10);
            name = m[2].trim();
        }

        const subClusters = [];
        const subRegex = /^\*\*(.+?)\*\*\s*[:\-–—]*\s*(.+)$/;

        lines.slice(1).forEach(l => {
            const cleanLine = l.replace(/\u00A0/g, ' ').trim();
            const sm = cleanLine.match(subRegex);

            if (sm) {
                let subName = sm[1].trim();
                subName = subName.replace(/[:\s]+$/g, '').trim();

                // Split words by comma, but IGNORE commas inside parentheses
                const rawWords = splitIgnoringCommisInParentheses(sm[2]);
                const words = [];
                const wordData = [];

                rawWords.forEach(rawWord => {
                    // Extract word and meaning: "word *(meaning)*" or "word (meaning)"
                    // Also handle some words having '*' around them
                    let text = rawWord;
                    let meaning = null;

                    // Match something like "canonize *(meaning)*" or "canonize (meaning)"
                    const mMatch = text.match(/^([^*]+)\s*\*?\(([^)]+)\)\*?$/);
                    if (mMatch) {
                        text = mMatch[1].trim();
                        meaning = mMatch[2].trim();
                    }

                    // Clean word text from '*'
                    text = text.replace(/^\*+|\*+$/g, '').trim();

                    if (text) {
                        words.push(text);
                        wordData.push({ text, meaning });
                    }
                });

                if (words.length > 0) {
                    subClusters.push({ name: subName, words, wordData });
                }
            }
        });

        if (subClusters.length > 0) {
            clusters.push({
                id: idRaw !== null ? idRaw : clusters.length + 1,
                name,
                subClusters
            });
        }
    });

    return clusters;
}

function buildDerivedWordList(clusters) {
    const words = [];
    let counter = 1;

    clusters.forEach(cluster => {
        cluster.subClusters.forEach(sub => {
            sub.wordData.forEach(w => {
                words.push({
                    id: `word-${counter++}`,
                    text: w.text,
                    meaning: w.meaning || null,
                    groupId: cluster.id,
                    groupName: cluster.name,
                    subCluster: sub.name
                });
            });
        });
    });

    return words;
}

try {
    if (!fs.existsSync(inputPath)) {
        console.error('Input file not found:', inputPath);
        process.exit(1);
    }
    const md = fs.readFileSync(inputPath, 'utf8');
    const clusters = parse(md);

    // Clean up internal wordData before writing to file to keep same structure as before
    const cleanClusters = clusters.map(c => ({
        ...c,
        subClusters: c.subClusters.map(sc => ({
            name: sc.name,
            words: sc.words
        }))
    }));

    const flatWords = buildDerivedWordList(clusters);

    // Write JSON
    fs.mkdirSync(path.dirname(outJson), { recursive: true });
    fs.writeFileSync(outJson, JSON.stringify({ clusters: cleanClusters, words: flatWords }, null, 2), 'utf8');
    console.log('Wrote', outJson);

    // Write JS module
    const jsContent = `// Auto-generated from ${path.basename(inputPath)}\nexport const GRE_CLUSTERS = ${JSON.stringify(cleanClusters, null, 2)};\nexport const GRE_WORDS = ${JSON.stringify(flatWords, null, 2)};\nexport default GRE_CLUSTERS;\n`;
    fs.writeFileSync(outJs, jsContent, 'utf8');
    console.log('Wrote', outJs);
} catch (err) {
    console.error('Error parsing or writing files:', err);
    process.exit(1);
}

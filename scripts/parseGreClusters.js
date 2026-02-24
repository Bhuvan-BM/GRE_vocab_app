const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2] || 'c:\\Users\\bhuva\\Downloads\\GRE_Clusters_All_Words_Final.md';
const outJson = path.join(__dirname, '..', 'src', 'lib', 'greClusters.json');
const outJs = path.join(__dirname, '..', 'src', 'lib', 'greClusters.js');

function parse(md) {
  const clusters = [];

  // Split by group headers (lines starting with '##')
  const groupParts = md.split(/^##\s+/m).map(s => s.trim()).filter(Boolean);

  groupParts.forEach(part => {
    // First line is like "Group 1: Praise, Approval & Acclaim"
    const lines = part.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const header = lines[0];
    // Try to extract id and name
    const m = header.match(/^Group\s*(\d+)\s*:\s*(.+)$/i);
    let idRaw = null;
    let name = header;
    if (m) {
      idRaw = parseInt(m[1], 10);
      name = m[2].trim();
    } else {
      // fallback: use header whole as name and auto id
      name = header;
    }

    const subClusters = [];

    // Find bold subcluster lines like **Sub Name:** word, word, word
    // Be permissive: allow the colon inside or outside the bold markers
    const subRegex = /^\*\*(.+?)\*\*\s*[:\-–—]*\s*(.+)$/;

    lines.slice(1).forEach(l => {
      // Clean common stray characters
      const cleanLine = l.replace(/\u00A0/g, ' ').trim();
      const sm = cleanLine.match(subRegex);
      if (sm) {
        let subName = sm[1].trim();
        // Remove any trailing colons that were accidentally included
        subName = subName.replace(/[:\s]+$/g, '').trim();

        // Split words by comma, remove parentheses and extra chars
        const words = sm[2]
          .split(',')
          .map(w => w.trim())
          .filter(Boolean)
          .map(w => w.replace(/[\u2018\u2019\u201c\u201d]/g, '').replace(/^\*+|\*+$/g, '').replace(/\.$/, ''));

        if (words.length > 0) {
          subClusters.push({ name: subName, words });
        }
      } else {
        // Also allow lines that are just a sequence of words without bold label
        const maybeWords = cleanLine.split(',').map(w => w.trim()).filter(Boolean).map(w => w.replace(/^\*+|\*+$/g, ''));
        if (maybeWords.length > 2 && maybeWords.every(w => /^[^\d]+$/.test(w))) {
          subClusters.push({ name: 'misc', words: maybeWords });
        }
      }
    });

    const cluster = {
      id: idRaw !== null ? idRaw : clusters.length + 1,
      name,
      subClusters
    };

    // Only add if we found any subClusters or words
    if (cluster.subClusters && cluster.subClusters.length > 0) {
      clusters.push(cluster);
    }
  });

  return clusters;
}

function buildDerivedWordList(clusters) {
  const words = [];
  let counter = 1;

  clusters.forEach(cluster => {
    cluster.subClusters.forEach(sub => {
      sub.words.forEach(word => {
        words.push({ id: `word-${counter++}`, text: word, groupId: cluster.id, groupName: cluster.name, subCluster: sub.name });
      });
    });
  });

  return words;
}

try {
  const md = fs.readFileSync(inputPath, 'utf8');
  const clusters = parse(md);
  const flatWords = buildDerivedWordList(clusters);

  // Write JSON
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.writeFileSync(outJson, JSON.stringify({ clusters, words: flatWords }, null, 2), 'utf8');
  console.log('Wrote', outJson);

  // Write JS module
  const jsContent = `// Auto-generated from ${path.basename(inputPath)}\nexport const GRE_CLUSTERS = ${JSON.stringify(clusters, null, 2)};\nexport const GRE_WORDS = ${JSON.stringify(flatWords, null, 2)};\nexport default GRE_CLUSTERS;\n`;
  fs.writeFileSync(outJs, jsContent, 'utf8');
  console.log('Wrote', outJs);
} catch (err) {
  console.error('Error parsing or writing files:', err);
  process.exit(1);
}

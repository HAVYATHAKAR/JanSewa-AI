/**
 * Shared data loader and RAG engine for Vercel serverless functions.
 * Caches schemes and index in module scope to persist across warm invocations.
 */
const fs = require('fs');
const path = require('path');

// =========== RAG Engine (inline from server/rag.js) ===========

const STOPWORDS = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'it', 'that',
    'this', 'be', 'are', 'was', 'were', 'been', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
    'might', 'can', 'shall', 'not', 'no', 'so', 'if', 'than', 'too',
    'very', 'just', 'about', 'up', 'out', 'all', 'any', 'each', 'every',
    'both', 'few', 'more', 'most', 'other', 'some', 'such', 'only',
    'own', 'same', 'also', 'how', 'what', 'when', 'where', 'who',
    'per', 'under', 'above', 'between', 'through',
]);

function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
}

function removeStopwords(tokens) {
    return tokens.filter(t => !STOPWORDS.has(t));
}

function buildIndex(schemes) {
    const docFreq = {};
    const docs = [];

    for (const scheme of schemes) {
        const text = [
            scheme.name || '', scheme.description || '', scheme.category || '',
            scheme.eligibility || '', scheme.target || '', scheme.state || '',
            ...(scheme.benefits || []), ...(scheme.documents || []),
        ].join(' ');

        const tokens = removeStopwords(tokenize(text));
        const tf = {};
        for (const token of tokens) { tf[token] = (tf[token] || 0) + 1; }
        const maxTf = Math.max(...Object.values(tf), 1);
        for (const token of Object.keys(tf)) { tf[token] = tf[token] / maxTf; }

        docs.push({ scheme, tf, tokens: new Set(tokens) });
        for (const token of new Set(tokens)) { docFreq[token] = (docFreq[token] || 0) + 1; }
    }

    const N = docs.length;
    const idf = {};
    for (const [word, freq] of Object.entries(docFreq)) { idf[word] = Math.log(1 + N / freq); }

    return { docs, idf, totalDocs: N };
}

function search(query, index, topK = 20) {
    const queryTokens = removeStopwords(tokenize(query));
    if (queryTokens.length === 0) return [];

    const results = [];
    for (const doc of index.docs) {
        let score = 0;
        let matchedTokens = 0;

        for (const token of queryTokens) {
            if (doc.tf[token]) {
                score += doc.tf[token] * (index.idf[token] || 1);
                matchedTokens++;
            }
            for (const docToken of doc.tokens) {
                if (docToken.startsWith(token) || token.startsWith(docToken)) {
                    score += 0.3 * (index.idf[docToken] || 1);
                }
            }
        }

        if (matchedTokens > 0) { score *= (1 + matchedTokens / queryTokens.length); }
        const nameLower = (doc.scheme.name || '').toLowerCase();
        if (queryTokens.some(t => nameLower.includes(t))) { score *= 1.5; }

        if (score > 0) { results.push({ scheme: doc.scheme, score: Math.round(score * 100) / 100 }); }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}

function filterSchemes(schemes, { category, target, state } = {}) {
    return schemes.filter(s => {
        if (category && category !== 'All' && s.category !== category) return false;
        if (target && target !== 'All' && s.target !== target) return false;
        if (state && state !== 'All India' && s.state !== state && s.state !== 'All India') return false;
        return true;
    });
}

function extractFilters(schemes) {
    const categories = new Set();
    const targets = new Set();
    const states = new Set();
    for (const s of schemes) {
        if (s.category) categories.add(s.category);
        if (s.target) targets.add(s.target);
        if (s.state) states.add(s.state);
    }
    return {
        categories: ['All', ...Array.from(categories).sort()],
        targets: ['All', ...Array.from(targets).sort()],
        states: ['All India', ...Array.from(states).filter(s => s !== 'All India').sort()],
    };
}

// =========== Data Loader (cached across warm invocations) ===========

let _schemes = null;
let _ragIndex = null;

function getData() {
    if (_schemes && _ragIndex) return { schemes: _schemes, ragIndex: _ragIndex };

    // In Vercel, __dirname is the api/ folder. schemes.json is at server/data/schemes.json
    const dataPath = path.join(__dirname, '..', 'server', 'data', 'schemes.json');

    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        _schemes = JSON.parse(raw);
    } catch (err) {
        console.error('Failed to load schemes.json:', err.message);
        _schemes = [];
    }

    _ragIndex = buildIndex(_schemes);
    return { schemes: _schemes, ragIndex: _ragIndex };
}

module.exports = { getData, search, filterSchemes, extractFilters };

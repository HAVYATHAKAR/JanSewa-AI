/**
 * RAG (Retrieval-Augmented Generation) Search Engine
 * Uses TF-IDF keyword scoring for scheme retrieval
 * No external API dependencies
 */

/** Tokenize text: lowercase, remove punctuation, split by whitespace */
function tokenize(text) {
    if (!text) return [];
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 1);
}

/** Stopwords to ignore */
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

/** Remove stopwords from token list */
function removeStopwords(tokens) {
    return tokens.filter(t => !STOPWORDS.has(t));
}

/** Build TF-IDF index from schemes */
function buildIndex(schemes) {
    const docFreq = {};  // word -> number of docs containing it
    const docs = [];

    for (const scheme of schemes) {
        // Combine all searchable text
        const text = [
            scheme.name || '',
            scheme.description || '',
            scheme.category || '',
            scheme.eligibility || '',
            scheme.target || '',
            scheme.state || '',
            ...(scheme.benefits || []),
            ...(scheme.documents || []),
        ].join(' ');

        const tokens = removeStopwords(tokenize(text));
        const tf = {};

        for (const token of tokens) {
            tf[token] = (tf[token] || 0) + 1;
        }

        // Normalize TF by document length
        const maxTf = Math.max(...Object.values(tf), 1);
        for (const token of Object.keys(tf)) {
            tf[token] = tf[token] / maxTf;
        }

        docs.push({ scheme, tf, tokens: new Set(tokens) });

        // Count document frequency
        for (const token of new Set(tokens)) {
            docFreq[token] = (docFreq[token] || 0) + 1;
        }
    }

    const N = docs.length;
    const idf = {};
    for (const [word, freq] of Object.entries(docFreq)) {
        idf[word] = Math.log(1 + N / freq);
    }

    return { docs, idf, totalDocs: N };
}

/**
 * Search schemes using TF-IDF scoring
 * @param {string} query - User search query
 * @param {object} index - Pre-built TF-IDF index
 * @param {number} topK - Number of results to return
 * @returns {Array} Ranked schemes with scores
 */
function search(query, index, topK = 20) {
    const queryTokens = removeStopwords(tokenize(query));
    if (queryTokens.length === 0) return [];

    const results = [];

    for (const doc of index.docs) {
        let score = 0;
        let matchedTokens = 0;

        for (const token of queryTokens) {
            if (doc.tf[token]) {
                const tfidf = doc.tf[token] * (index.idf[token] || 1);
                score += tfidf;
                matchedTokens++;
            }

            // Partial match bonus (prefix matching)
            for (const docToken of doc.tokens) {
                if (docToken.startsWith(token) || token.startsWith(docToken)) {
                    score += 0.3 * (index.idf[docToken] || 1);
                }
            }
        }

        // Boost score if more query terms matched
        if (matchedTokens > 0) {
            const coverage = matchedTokens / queryTokens.length;
            score *= (1 + coverage);
        }

        // Name match bonus (high boost if query matches scheme name)
        const nameLower = (doc.scheme.name || '').toLowerCase();
        if (queryTokens.some(t => nameLower.includes(t))) {
            score *= 1.5;
        }

        if (score > 0) {
            results.push({ scheme: doc.scheme, score: Math.round(score * 100) / 100 });
        }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
}

/**
 * Filter schemes by criteria
 */
function filterSchemes(schemes, { category, target, state, income } = {}) {
    return schemes.filter(s => {
        if (category && category !== 'All' && s.category !== category) return false;
        if (target && target !== 'All' && s.target !== target) return false;
        if (state && state !== 'All India' && s.state !== state && s.state !== 'All India') return false;
        return true;
    });
}

/**
 * Extract unique categories and target groups from schemes
 */
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

module.exports = { buildIndex, search, filterSchemes, extractFilters, tokenize };

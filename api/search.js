const { getData, search } = require('./_data');

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { q, category, target, limit = 20 } = req.query;
    const { schemes, ragIndex } = getData();

    if (!q || q.trim().length === 0) {
        return res.json({
            success: true,
            query: '',
            results: schemes.slice(0, parseInt(limit)),
            total: schemes.length,
        });
    }

    let results = search(q, ragIndex, 50);

    if (category && category !== 'All') {
        results = results.filter(r => r.scheme.category === category);
    }
    if (target && target !== 'All') {
        results = results.filter(r => r.scheme.target === target);
    }

    results = results.slice(0, parseInt(limit));

    res.json({
        success: true,
        query: q,
        results: results.map(r => ({ ...r.scheme, relevanceScore: r.score })),
        total: results.length,
    });
};

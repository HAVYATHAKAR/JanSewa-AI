const { getData, filterSchemes, extractFilters } = require('./_data');

module.exports = function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { category, target, state, page = 1, limit = 50 } = req.query;
    const { schemes } = getData();

    let results = filterSchemes(schemes, { category, target, state });
    const total = results.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const start = (pageNum - 1) * limitNum;
    results = results.slice(start, start + limitNum);

    res.json({
        success: true,
        total,
        page: pageNum,
        limit: limitNum,
        schemes: results,
        filters: extractFilters(schemes),
    });
};

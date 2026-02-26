const { getData, extractFilters } = require('./_data');

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { schemes } = getData();

    res.json({
        success: true,
        ...extractFilters(schemes),
        totalSchemes: schemes.length,
    });
};

const { getData } = require('./_data');

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { schemes, ragIndex } = getData();

    res.json({
        status: 'ok',
        schemesLoaded: schemes.length,
        indexReady: ragIndex !== null,
        aiReady: !!process.env.GEMINI_API_KEY,
        timestamp: new Date().toISOString(),
    });
};

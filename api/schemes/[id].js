const { getData } = require('./_data');

module.exports = function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') return res.status(200).end();

    const { id } = req.query;
    const { schemes } = getData();

    const scheme = schemes.find(s => s.id === id || s.id === parseInt(id));
    if (!scheme) {
        return res.status(404).json({ success: false, error: 'Scheme not found' });
    }
    res.json({ success: true, scheme });
};

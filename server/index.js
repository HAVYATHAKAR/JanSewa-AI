require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { loadSchemes, scrapeSchemes } = require('./scraper');
const { buildIndex, search, filterSchemes, extractFilters } = require('./rag');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve Vite-built frontend static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Initialize Gemini client (only if API key is present)
const gemini = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

// In-memory state
let schemes = [];
let ragIndex = null;

/**
 * Initialize: load schemes and build search index
 */
async function initialize() {
    console.log('[Server] Initializing...');
    schemes = await loadSchemes();
    ragIndex = buildIndex(schemes);
    console.log(`[Server] Ready with ${schemes.length} schemes, index built`);
}

// ==================== API Routes ====================

/**
 * GET /api/schemes — List all schemes with optional filters
 * Query params: category, target, state, page, limit
 */
app.get('/api/schemes', (req, res) => {
    const { category, target, state, page = 1, limit = 50 } = req.query;

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
});

/**
 * GET /api/schemes/:id — Get single scheme by ID
 */
app.get('/api/schemes/:id', (req, res) => {
    const scheme = schemes.find(s => s.id === req.params.id || s.id === parseInt(req.params.id));
    if (!scheme) {
        return res.status(404).json({ success: false, error: 'Scheme not found' });
    }
    res.json({ success: true, scheme });
});

/**
 * GET /api/search — RAG-based semantic search
 * Query params: q (search query), category, target, limit
 */
app.get('/api/search', (req, res) => {
    const { q, category, target, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
        return res.json({
            success: true,
            query: '',
            results: schemes.slice(0, parseInt(limit)),
            total: schemes.length,
        });
    }

    let results = search(q, ragIndex, 50);

    // Apply filters to search results
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
});

/**
 * GET /api/filters — Get available filter options
 */
app.get('/api/filters', (req, res) => {
    res.json({
        success: true,
        ...extractFilters(schemes),
        totalSchemes: schemes.length,
    });
});

/**
 * POST /api/scrape — Trigger a fresh scrape
 */
app.post('/api/scrape', async (req, res) => {
    try {
        console.log('[API] Manual scrape triggered');
        schemes = await scrapeSchemes();
        ragIndex = buildIndex(schemes);
        res.json({ success: true, message: `Scraped ${schemes.length} schemes`, count: schemes.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * POST /api/chat — RAG-augmented AI chat with Gemini streaming
 * Body: { message: string, history: [{ role, content }] }
 * Response: Server-Sent Events stream
 */
app.post('/api/chat', async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    if (!gemini) {
        return res.status(503).json({
            success: false,
            error: 'AI chat is not configured. Please add your GEMINI_API_KEY to server/.env and restart the server.',
        });
    }

    try {
        // 1. RAG: Search for relevant schemes
        let contextBlock = '';
        if (ragIndex) {
            const ragResults = search(message, ragIndex, 5);
            if (ragResults.length > 0) {
                contextBlock = '\n\nRelevant Government Schemes from Database:\n' +
                    ragResults.map((r, i) => {
                        const s = r.scheme;
                        return `${i + 1}. **${s.name}**\n` +
                            `   - Category: ${s.category || 'N/A'}\n` +
                            `   - Eligibility: ${s.eligibility || 'N/A'}\n` +
                            `   - Target: ${s.target || 'N/A'}\n` +
                            `   - Description: ${s.description || 'N/A'}\n` +
                            `   - Benefits: ${(s.benefits || []).join(', ') || 'N/A'}\n` +
                            `   - How to Apply: ${s.howToApply || 'Visit the official portal'}\n` +
                            `   - Documents: ${(s.documents || []).join(', ') || 'N/A'}`;
                    }).join('\n');
            }
        }

        // 2. Build system instruction
        const systemInstruction = `You are JanSeva AI, a helpful and knowledgeable civic services assistant for Indian citizens.
Your role is to help citizens:
- Discover government welfare schemes they may be eligible for
- Understand eligibility criteria and application processes
- Draft civic complaints about infrastructure, sanitation, and other issues
- Provide guidance on government services

Guidelines:
- Be warm, respectful, and use simple language accessible to all citizens
- When discussing schemes, reference specific details from the database context provided
- If asked about a scheme not in your context, say you'll help search and suggest using the JanKhabar section
- For complaint-related questions, help draft formal but clear descriptions
- Keep responses concise but informative
- Use Hindi words naturally where appropriate (e.g., Namaste, Yojana, Nidhi)
- Always provide actionable next steps when possible
${contextBlock}`;

        // 3. Initialize Gemini model with system instruction
        const model = gemini.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: systemInstruction,
        });

        // 4. Build Gemini chat history (map assistant -> model role)
        const geminiHistory = history.slice(-10).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });

        // 5. Stream response via SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const result = await chat.sendMessageStream(message);

        for await (const chunk of result.stream) {
            const content = chunk.text();
            if (content) {
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        console.error('[Chat Error]', err.message);

        // Parse a clean error message
        let cleanError = 'Something went wrong. Please try again.';
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            cleanError = 'Rate limit reached. Please wait a moment and try again.';
        } else if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
            cleanError = 'Invalid API key. Please check your GEMINI_API_KEY in server/.env.';
        } else if (msg.includes('SAFETY')) {
            cleanError = 'The response was blocked by safety filters. Try rephrasing your question.';
        }

        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: cleanError })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ success: false, error: cleanError });
        }
    }
});

/**
 * GET /api/health — Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        schemesLoaded: schemes.length,
        indexReady: ragIndex !== null,
        aiReady: gemini !== null,
        timestamp: new Date().toISOString(),
    });
});

// Catch-all: serve React app for non-API routes (must be after all API routes)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// ==================== Start ====================
initialize().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🏛  JanSeva AI Backend running on http://localhost:${PORT}`);
        console.log(`   📊 ${schemes.length} schemes loaded`);
        console.log(`   🔎 RAG search index ready`);
        console.log(`   🤖 AI Chat: ${gemini ? 'Ready (Gemini)' : '⚠ Not configured — set GEMINI_API_KEY in .env'}`);
        console.log(`\n   API Endpoints:`);
        console.log(`   GET  /api/schemes      — List schemes`);
        console.log(`   GET  /api/schemes/:id  — Scheme details`);
        console.log(`   GET  /api/search?q=... — RAG search`);
        console.log(`   GET  /api/filters      — Filter options`);
        console.log(`   POST /api/chat         — AI chat (RAG + Gemini)`);
        console.log(`   POST /api/scrape       — Trigger scrape`);
        console.log(`   GET  /api/health       — Health check\n`);
    });
});

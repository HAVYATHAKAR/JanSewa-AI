require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const { BedrockRuntimeClient, ConverseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
const { loadSchemes, scrapeSchemes } = require('./scraper');
const { buildIndex, search, filterSchemes, extractFilters } = require('./rag');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve Vite-built frontend static files
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Initialize Amazon Bedrock client using the default credential provider chain.
// Credentials are auto-discovered from: AWS CLI profile (~/.aws/credentials),
// IAM roles (EC2/Lambda/ECS), SSO, or environment variables.
const bedrockClient = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || 'us-east-1',
});

const BEDROCK_MODEL_ID = process.env.BEDROCK_MODEL_ID || 'amazon.titan-text-express-v1';

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
 * POST /api/chat — RAG-augmented AI chat with Amazon Bedrock streaming
 * Body: { message: string, history: [{ role, content }] }
 * Response: Server-Sent Events stream
 */
app.post('/api/chat', async (req, res) => {
    const { message, history = [] } = req.body;

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Message is required' });
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

        // 2. Build system prompt
        const systemPrompt = `You are JanSeva AI, a helpful and knowledgeable civic services assistant for Indian citizens.
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

        // 3. Build Bedrock conversation history
        const bedrockHistory = history.slice(-10).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: [{ text: msg.content }],
        }));

        // Add the current user message
        bedrockHistory.push({
            role: 'user',
            content: [{ text: message }],
        });

        // 4. Create Bedrock ConverseStream command
        const command = new ConverseStreamCommand({
            modelId: BEDROCK_MODEL_ID,
            messages: bedrockHistory,
            system: [{ text: systemPrompt }],
            inferenceConfig: { maxTokens: 1024, temperature: 0.7, topP: 0.9 },
        });

        // 5. Stream response via SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');

        const response = await bedrockClient.send(command);

        for await (const item of response.stream) {
            if (item.contentBlockDelta) {
                const content = item.contentBlockDelta.delta?.text;
                if (content) {
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
            }
        }

        res.write('data: [DONE]\n\n');
        res.end();
    } catch (err) {
        console.error('[Chat Error]', err.message);

        // Parse a clean error message
        let cleanError = 'Something went wrong. Please try again.';
        const errName = err.name || '';
        const msg = err.message || '';
        if (errName === 'ThrottlingException' || msg.includes('throttl')) {
            cleanError = 'Rate limit reached. Please wait a moment and try again.';
        } else if (errName === 'AccessDeniedException' || msg.includes('Access Denied')) {
            cleanError = 'Access denied. Please check your AWS credentials and Bedrock model access.';
        } else if (errName === 'ValidationException') {
            cleanError = 'Invalid request. The model may not support this input format.';
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
        aiReady: true,
        modelId: BEDROCK_MODEL_ID,
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
        console.log(`   🤖 AI Chat: Ready (Bedrock: ${BEDROCK_MODEL_ID}, credentials: default chain)`);
        console.log(`\n   API Endpoints:`);
        console.log(`   GET  /api/schemes      — List schemes`);
        console.log(`   GET  /api/schemes/:id  — Scheme details`);
        console.log(`   GET  /api/search?q=... — RAG search`);
        console.log(`   GET  /api/filters      — Filter options`);
        console.log(`   POST /api/chat         — AI chat (RAG + Bedrock)`);
        console.log(`   POST /api/scrape       — Trigger scrape`);
        console.log(`   GET  /api/health       — Health check\n`);
    });
});

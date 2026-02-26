const { getData, search } = require('./_data');

module.exports = async function handler(req, res) {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, history = [] } = req.body || {};

    if (!message || message.trim().length === 0) {
        return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        return res.status(503).json({
            success: false,
            error: 'AI chat is not configured. Set GEMINI_API_KEY in Vercel environment variables.',
        });
    }

    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const gemini = new GoogleGenerativeAI(apiKey);
        const { ragIndex } = getData();

        // RAG: Search for relevant schemes
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

        const model = gemini.getGenerativeModel({
            model: 'gemini-2.0-flash-lite',
            systemInstruction: systemInstruction,
        });

        const geminiHistory = history.slice(-10).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });

        // Stream response via SSE
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

        let cleanError = 'Something went wrong. Please try again.';
        const msg = err.message || '';
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
            cleanError = 'Rate limit reached. Please wait a moment and try again.';
        } else if (msg.includes('API_KEY_INVALID') || msg.includes('401')) {
            cleanError = 'Invalid API key. Please check your GEMINI_API_KEY.';
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
};

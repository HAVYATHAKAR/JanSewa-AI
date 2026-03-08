/**
 * Vercel Serverless Function: POST /api/chat
 * RAG-augmented AI chat with Amazon Bedrock streaming
 */
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

    try {
        const { BedrockRuntimeClient, ConverseStreamCommand } = require('@aws-sdk/client-bedrock-runtime');
        // Uses default credential provider chain (AWS CLI, IAM roles, SSO, env vars)
        const bedrockClient = new BedrockRuntimeClient({
            region: process.env.AWS_REGION || 'us-east-1',
        });
        const modelId = process.env.BEDROCK_MODEL_ID || 'amazon.titan-text-express-v1';
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

        // Build Bedrock conversation history
        const bedrockHistory = history.slice(-10).map(msg => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: [{ text: msg.content }],
        }));

        // Add current user message
        bedrockHistory.push({
            role: 'user',
            content: [{ text: message }],
        });

        const command = new ConverseStreamCommand({
            modelId,
            messages: bedrockHistory,
            system: [{ text: systemPrompt }],
            inferenceConfig: { maxTokens: 1024, temperature: 0.7, topP: 0.9 },
        });

        // Stream response via SSE
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
};

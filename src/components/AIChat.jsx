import { useState, useRef, useEffect } from 'react';
import { useLang } from '../context/LanguageContext';
import './AIChat.css';

export default function AIChat({ isOpen, onClose }) {
    const { t } = useLang();
    const [messages, setMessages] = useState([
        { type: 'bot', text: t('aiChatGreeting') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getHistory = () => {
        return messages
            .filter((_, i) => i > 0)
            .map(m => ({
                role: m.type === 'bot' ? 'assistant' : 'user',
                content: m.text,
            }));
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text || isLoading) return;

        const userMsg = { type: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        setMessages(prev => [...prev, { type: 'bot', text: '', streaming: true }]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: getHistory(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error || `Server error (${response.status})`;
                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                        type: 'bot',
                        text: `⚠️ ${errorMsg}`,
                        isError: true,
                    };
                    return updated;
                });
                setIsLoading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.error) {
                                fullText += `\n⚠️ ${parsed.error}`;
                            } else if (parsed.content) {
                                fullText += parsed.content;
                            }
                        } catch {
                            // Skip malformed JSON
                        }

                        setMessages(prev => {
                            const updated = [...prev];
                            updated[updated.length - 1] = {
                                type: 'bot',
                                text: fullText,
                                streaming: true,
                            };
                            return updated;
                        });
                    }
                }
            }

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    type: 'bot',
                    text: fullText || 'I couldn\'t generate a response. Please try again.',
                    streaming: false,
                };
                return updated;
            });
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    type: 'bot',
                    text: `⚠️ ${t('connectError')}`,
                    isError: true,
                };
                return updated;
            });
        }

        setIsLoading(false);
    };

    const handlePromptClick = (prompt) => {
        setInput(prompt);
    };

    const prompts = [t('aiPrompt1'), t('aiPrompt2'), t('aiPrompt3'), t('aiPrompt4')];

    return (
        <>
            <div className={`ai-chat-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
            <div className={`ai-chat-panel ${isOpen ? 'open' : ''}`}>
                <div className="ai-chat-header">
                    <div className="ai-chat-header-left">
                        <div className="ai-avatar">🤖</div>
                        <div>
                            <h3>{t('aiChatTitle')}</h3>
                            <p>● {t('aiChatOnline')}</p>
                        </div>
                    </div>
                    <button className="ai-chat-close" onClick={onClose}>✕</button>
                </div>

                <div className="ai-chat-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`ai-message ${msg.type} ${msg.isError ? 'error' : ''}`}>
                            <div className="msg-avatar">
                                {msg.type === 'bot' ? '🤖' : '👤'}
                            </div>
                            <div className="msg-bubble">
                                {msg.text}
                                {msg.streaming && <span className="typing-cursor">▊</span>}
                            </div>
                        </div>
                    ))}

                    {isLoading && messages[messages.length - 1]?.text === '' && (
                        <div className="ai-message bot">
                            <div className="msg-avatar">🤖</div>
                            <div className="msg-bubble typing-indicator">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {!isLoading && messages.length <= 1 && (
                    <div className="ai-suggested-prompts">
                        {prompts.map((prompt, i) => (
                            <button key={i} onClick={() => handlePromptClick(prompt)}>
                                {prompt}
                            </button>
                        ))}
                    </div>
                )}

                <div className="ai-chat-input-area">
                    <input
                        type="text"
                        placeholder={t('aiChatPlaceholder')}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        disabled={isLoading}
                    />
                    <button
                        className="send-btn"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                    >
                        {isLoading ? '⏳' : '➤'}
                    </button>
                </div>
            </div>
        </>
    );
}

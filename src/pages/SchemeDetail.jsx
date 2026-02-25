import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './SchemeDetail.css';

export default function SchemeDetail({ onOpenAI }) {
    const { id } = useParams();
    const [scheme, setScheme] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScheme();
    }, [id]);

    const fetchScheme = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/schemes/${id}`);
            const data = await res.json();
            if (data.success) {
                setScheme(data.scheme);
            } else {
                setError('Scheme not found');
            }
        } catch (err) {
            setError('Failed to load scheme details');
            console.error(err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="scheme-detail-page" style={{ textAlign: 'center', padding: '4rem' }}>
                <div style={{ fontSize: '2.5rem', animation: 'pulse 1.5s ease-in-out infinite' }}>📋</div>
                <p style={{ color: 'var(--text-tertiary)', marginTop: '1rem' }}>Loading scheme details...</p>
            </div>
        );
    }

    if (error || !scheme) {
        return (
            <div className="scheme-detail-page" style={{ textAlign: 'center', padding: '4rem' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😕</p>
                <p style={{ color: 'var(--text-tertiary)' }}>{error || 'Scheme not found'}</p>
                <Link to="/jankhabar" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>← Back to Schemes</Link>
            </div>
        );
    }

    return (
        <div className="scheme-detail-page">
            <Link to="/jankhabar" className="scheme-detail-back">← Back to Schemes</Link>

            <div className="scheme-detail-hero">
                <h1>{scheme.name}</h1>
                <div className="detail-tags">
                    <span className="detail-tag">{scheme.category}</span>
                    <span className="detail-tag">{scheme.target}</span>
                    <span className="detail-tag">{scheme.state || 'All India'}</span>
                </div>
            </div>

            <div className="scheme-detail-content">
                <div className="scheme-sections">
                    <div className="card scheme-section">
                        <h2>📋 Overview</h2>
                        <p>{scheme.description}</p>
                    </div>

                    {scheme.benefits && scheme.benefits.length > 0 && (
                        <div className="card scheme-section">
                            <h2>🎁 Benefits</h2>
                            <ul>
                                {scheme.benefits.map((b, i) => <li key={i}>{b}</li>)}
                            </ul>
                        </div>
                    )}

                    {scheme.eligibility && (
                        <div className="card scheme-section">
                            <h2>✅ Eligibility Criteria</h2>
                            {typeof scheme.eligibility === 'string' ? (
                                <p>{scheme.eligibility}</p>
                            ) : (
                                <ul>
                                    {scheme.eligibility.map((e, i) => <li key={i}>{e}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {scheme.documents && scheme.documents.length > 0 && (
                        <div className="card scheme-section">
                            <h2>📄 Required Documents</h2>
                            <ul>
                                {scheme.documents.map((d, i) => <li key={i}>{d}</li>)}
                            </ul>
                        </div>
                    )}

                    {scheme.steps && scheme.steps.length > 0 && (
                        <div className="card scheme-section">
                            <h2>📝 Application Steps</h2>
                            <ul className="scheme-steps">
                                {scheme.steps.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    )}

                    {scheme.sourceUrl && (
                        <div className="card scheme-section">
                            <h2>🔗 Official Source</h2>
                            <p>
                                <a href={scheme.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>
                                    {scheme.sourceUrl} ↗
                                </a>
                            </p>
                        </div>
                    )}
                </div>

                <div className="scheme-sidebar">
                    <div className="card scheme-apply-card">
                        <h3>Ready to Apply?</h3>
                        <p>Check your eligibility and start the application process.</p>
                        {scheme.sourceUrl ? (
                            <a href={scheme.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Apply Now →
                            </a>
                        ) : (
                            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>Apply Now →</button>
                        )}
                        <button className="btn btn-outline" onClick={onOpenAI} style={{ width: '100%', marginTop: 'var(--space-3)' }}>
                            🤖 Ask AI about this scheme
                        </button>
                    </div>

                    <div className="scheme-deadline-card">
                        <div className="deadline-icon">⏰</div>
                        <h4>Application Deadline</h4>
                        <p>{scheme.deadline || 'Check official website'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

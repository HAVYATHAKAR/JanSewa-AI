import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './JanKhabar.css';

export default function JanKhabar({ onOpenAI }) {
    const { t } = useLang();
    const [schemes, setSchemes] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [target, setTarget] = useState('All');
    const [saved, setSaved] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState(['All']);
    const [targetGroups, setTargetGroups] = useState(['All']);
    const [totalSchemes, setTotalSchemes] = useState(0);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchSchemes();
        fetchFilters();
    }, []);

    useEffect(() => {
        if (!isSearching) {
            fetchSchemes();
        }
    }, [category, target]);

    const fetchFilters = async () => {
        try {
            const res = await fetch('/api/filters');
            const data = await res.json();
            if (data.success) {
                setCategories(data.categories || ['All']);
                setTargetGroups(data.targets || ['All']);
            }
        } catch (err) {
            console.error('Failed to fetch filters:', err);
        }
    };

    const fetchSchemes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (category !== 'All') params.set('category', category);
            if (target !== 'All') params.set('target', target);

            const res = await fetch(`/api/schemes?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSchemes(data.schemes);
                setTotalSchemes(data.total);
            }
        } catch (err) {
            console.error('Failed to fetch schemes:', err);
        }
        setLoading(false);
    };

    const handleSearch = async () => {
        if (!search.trim()) {
            setIsSearching(false);
            fetchSchemes();
            return;
        }
        setIsSearching(true);
        setLoading(true);
        try {
            const params = new URLSearchParams({ q: search });
            if (category !== 'All') params.set('category', category);
            if (target !== 'All') params.set('target', target);

            const res = await fetch(`/api/search?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setSchemes(data.results);
                setTotalSchemes(data.total);
            }
        } catch (err) {
            console.error('Search failed:', err);
        }
        setLoading(false);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleSearchClear = () => {
        setSearch('');
        setIsSearching(false);
        fetchSchemes();
    };

    const toggleSave = (id) => {
        setSaved(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    return (
        <div className="jankhabar-page">
            <div className="jankhabar-header">
                <h1>🔎 {t('jankhabarTitle')}</h1>
                <p>{t('jankhabarDesc')}</p>
            </div>

            <div className="scheme-search-bar">
                <input
                    type="text"
                    placeholder={t('searchPlaceholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                />
                {isSearching && (
                    <button className="search-btn" onClick={handleSearchClear} style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', boxShadow: 'none' }}>
                        ✕
                    </button>
                )}
                <button className="search-btn" onClick={handleSearch}>
                    🔎 {t('search')}
                </button>
            </div>

            {isSearching && (
                <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(59,130,246,0.04))',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-4)',
                    border: '1px solid rgba(139,92,246,0.15)',
                    fontSize: 'var(--fs-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-purple)' }}>🤖 AI Search</span>
                    <span>Results ranked by relevance for: <strong>"{search}"</strong></span>
                </div>
            )}

            <div className="jankhabar-layout">
                {/* Filter Panel */}
                <div className="card filter-panel">
                    <h3>⚙ {t('filters')}</h3>

                    <div className="filter-group">
                        <label>{t('category')}</label>
                        <select value={category} onChange={e => { setCategory(e.target.value); setIsSearching(false); }}>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('incomeLevel')}</label>
                        <select>
                            <option>{t('allLevels')}</option>
                            <option>Below ₹1 Lakh</option>
                            <option>₹1-3 Lakh</option>
                            <option>₹3-5 Lakh</option>
                            <option>Above ₹5 Lakh</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('stateRegion')}</label>
                        <select>
                            <option>{t('allIndia')}</option>
                            <option>Delhi</option>
                            <option>Maharashtra</option>
                            <option>Karnataka</option>
                            <option>Tamil Nadu</option>
                            <option>Uttar Pradesh</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>{t('targetGroup')}</label>
                        <div className="filter-tags">
                            {targetGroups.map(tg => (
                                <button
                                    key={tg}
                                    className={`filter-tag ${target === tg ? 'active' : ''}`}
                                    onClick={() => { setTarget(tg); setIsSearching(false); }}
                                >
                                    {tg}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button className="filter-reset" onClick={() => { setCategory('All'); setTarget('All'); handleSearchClear(); }}>
                        {t('resetFilters')}
                    </button>
                </div>

                {/* Results */}
                <div className="schemes-grid">
                    <div className="results-count">
                        {loading ? '...' : `${t('showing')} ${schemes.length} ${t('of')} ${totalSchemes} ${t('schemes')}`}
                    </div>

                    {loading && (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <div style={{ fontSize: '2rem', animation: 'pulse 1.5s ease-in-out infinite' }}>🔎</div>
                        </div>
                    )}

                    {!loading && schemes.map((scheme, index) => (
                        <div key={scheme.id || index} className="card scheme-card" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="scheme-card-header">
                                <h3>{scheme.name}</h3>
                                <button
                                    className={`scheme-card-save ${saved.has(scheme.id) ? 'saved' : ''}`}
                                    onClick={() => toggleSave(scheme.id)}
                                    aria-label="Save scheme"
                                >
                                    {saved.has(scheme.id) ? '★' : '☆'}
                                </button>
                            </div>
                            <p>{scheme.description}</p>
                            <div className="scheme-card-tags">
                                <span className="scheme-tag category">{scheme.category}</span>
                                <span className="scheme-tag eligible">✓ {scheme.eligibility}</span>
                            </div>
                            <div className="scheme-card-actions">
                                <Link to={`/jankhabar/${scheme.id}`} className="btn btn-primary">{t('viewDetails')}</Link>
                                <button className="btn btn-outline" onClick={onOpenAI}>{t('askAITitle')}</button>
                            </div>
                        </div>
                    ))}

                    {!loading && schemes.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                            <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</p>
                            <p>{t('noComplaints')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useComplaints } from '../context/ComplaintContext';
import { useLang } from '../context/LanguageContext';
import './TrackComplaints.css';

export default function TrackComplaints() {
    const { complaints } = useComplaints();
    const { t } = useLang();
    const [activeFilter, setActiveFilter] = useState('All');
    const [selected, setSelected] = useState(null);

    const filterLabels = {
        'All': t('all'),
        'Filed': t('filed'),
        'In Progress': t('inProgress'),
        'Resolved': t('resolved'),
    };

    const filters = ['All', 'Filed', 'In Progress', 'Resolved'];

    const filtered = complaints.filter(c => {
        if (activeFilter === 'All') return true;
        return c.statusLabel === activeFilter;
    });

    return (
        <div className="track-page">
            <div className="track-header">
                <h1>{t('trackTitle')}</h1>
                <p>{t('trackDesc')}</p>
            </div>

            <div className="track-filters">
                {filters.map(f => (
                    <button
                        key={f}
                        className={`track-filter-btn ${activeFilter === f ? 'active' : ''}`}
                        onClick={() => setActiveFilter(f)}
                    >
                        {filterLabels[f]}
                        {f !== 'All' && (
                            <span style={{
                                marginLeft: '6px',
                                fontSize: 'var(--fs-xs)',
                                background: activeFilter === f ? 'rgba(255,255,255,0.3)' : 'var(--surface-hover)',
                                borderRadius: '10px',
                                padding: '1px 7px',
                            }}>
                                {complaints.filter(c => c.statusLabel === f).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                    <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📭</p>
                    <p>{t('noComplaints')}</p>
                </div>
            )}

            <div className="complaints-list">
                {filtered.map(complaint => (
                    <div
                        key={complaint.id}
                        className="card complaint-item"
                        onClick={() => setSelected(complaint)}
                    >
                        <div className="complaint-thumb">{complaint.icon}</div>
                        <div className="complaint-info">
                            <h3>{complaint.title}</h3>
                            <div className="complaint-meta">
                                <span className="complaint-id">#{complaint.id}</span>
                                <span>📁 {complaint.category}</span>
                                <span>📅 {complaint.date}</span>
                            </div>
                        </div>
                        <div className="complaint-status-area">
                            <span className={`badge badge-${complaint.status}`}>
                                {complaint.statusLabel}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="complaint-detail-overlay" onClick={() => setSelected(null)}>
                    <div className="complaint-detail-modal" onClick={e => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h2>{selected.title}</h2>
                            <button className="detail-modal-close" onClick={() => setSelected(null)}>✕</button>
                        </div>
                        <div className="detail-modal-body">
                            <div className="detail-info-grid">
                                <div className="detail-info-item">
                                    <label>{t('complaintId')}</label>
                                    <p>#{selected.id}</p>
                                </div>
                                <div className="detail-info-item">
                                    <label>{t('status')}</label>
                                    <p><span className={`badge badge-${selected.status}`}>{selected.statusLabel}</span></p>
                                </div>
                                <div className="detail-info-item">
                                    <label>{t('category')}</label>
                                    <p>{selected.category}</p>
                                </div>
                                <div className="detail-info-item">
                                    <label>{t('location')}</label>
                                    <p>{selected.location}</p>
                                </div>
                                <div className="detail-info-item">
                                    <label>{t('assignedAuthority')}</label>
                                    <p>{selected.authority}</p>
                                </div>
                                <div className="detail-info-item">
                                    <label>{t('filedOn')}</label>
                                    <p>{selected.date}</p>
                                </div>
                            </div>

                            {selected.description && (
                                <div style={{ marginBottom: 'var(--space-6)' }}>
                                    <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                                        {t('description')}
                                    </h3>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{selected.description}</p>
                                </div>
                            )}

                            <h3 style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
                                {t('progressTimeline')}
                            </h3>
                            <div className="complaint-timeline">
                                {selected.timeline.map((tl, i) => (
                                    <div key={i} className={`timeline-item ${tl.done ? 'done' : ''} ${tl.current ? 'current' : ''}`}>
                                        <div className="timeline-dot" />
                                        <h4>{tl.label}</h4>
                                        <p>{tl.date}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

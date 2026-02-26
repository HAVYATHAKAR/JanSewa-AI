import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import './Home.css';

export default function Home({ onOpenAI }) {
    const { t } = useLang();

    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">{t('heroBadge')}</div>
                    <h1>{t('heroTitle')}</h1>
                    <p>{t('heroDesc')}</p>
                    <div className="hero-actions">
                        <Link to="/jankhabar" className="hero-cta hero-cta-primary">
                            {t('discoverSchemes')}
                        </Link>
                        <Link to="/jansamasya" className="hero-cta hero-cta-secondary">
                            {t('reportIssue')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
                <div className="section-header">
                    <h2>{t('quickActions')}</h2>
                </div>
                <div className="quick-actions-grid">
                    <Link to="/jankhabar" className="card quick-action-card">
                        <div className="quick-action-icon eligibility">✅</div>
                        <h3>{t('checkEligibility')}</h3>
                        <p>{t('checkEligibilityDesc')}</p>
                    </Link>
                    <div className="card quick-action-card" onClick={onOpenAI} role="button" tabIndex={0}>
                        <div className="quick-action-icon ai">🤖</div>
                        <h3>{t('askAITitle')}</h3>
                        <p>{t('askAIDesc')}</p>
                    </div>
                    <Link to="/track" className="card quick-action-card">
                        <div className="quick-action-icon track">📊</div>
                        <h3>{t('trackComplaint')}</h3>
                        <p>{t('trackComplaintDesc')}</p>
                    </Link>
                </div>
            </section>

            {/* Recent Activity + Announcements Grid */}
            <section className="recent-activity-section">
                <div className="home-grid">
                    <div className="card activity-card">
                        <h3>{t('recentActivity')}</h3>
                        <div className="activity-item">
                            <div className="activity-icon scheme">📗</div>
                            <div className="activity-text">
                                <h4>{t('savedPMKisan')}</h4>
                                <p>{t('hoursAgo')(2)}</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon complaint">🚧</div>
                            <div className="activity-text">
                                <h4>{t('complaintPothole')}</h4>
                                <p>{t('statusInProgress')} • {t('daysAgo')(1)}</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon scheme">📗</div>
                            <div className="activity-text">
                                <h4>{t('viewedAtal')}</h4>
                                <p>{t('daysAgo')(3)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="card announce-card">
                        <h3>{t('announcements')}</h3>
                        <div className="announce-item">
                            <span className="announce-tag">{t('newScheme')}</span>
                            <h4>{t('vishwakarmaTitle')}</h4>
                            <p>{t('vishwakarmaDesc')}</p>
                        </div>
                        <div className="announce-item">
                            <span className="announce-tag">{t('deadline')}</span>
                            <h4>{t('scholarshipTitle')}</h4>
                            <p>{t('scholarshipDesc')}</p>
                        </div>
                        <div className="announce-item">
                            <span className="announce-tag">{t('update')}</span>
                            <h4>{t('fasterResolution')}</h4>
                            <p>{t('fasterResolutionDesc')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-row">
                <div className="card stat-card">
                    <div className="stat-value">2,500+</div>
                    <div className="stat-label">{t('govtSchemes')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">1.2M</div>
                    <div className="stat-label">{t('citizensHelped')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">89%</div>
                    <div className="stat-label">{t('issuesResolved')}</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">28</div>
                    <div className="stat-label">{t('statesCovered')}</div>
                </div>
            </section>
        </div>
    );
}

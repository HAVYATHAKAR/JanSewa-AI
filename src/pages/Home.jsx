import { Link } from 'react-router-dom';
import './Home.css';

export default function Home({ onOpenAI }) {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">🇮🇳 Empowering Citizens with Technology</div>
                    <h1>Find Government Schemes or Report Civic Issues Easily</h1>
                    <p>
                        Your single digital gateway to discover welfare schemes, understand eligibility,
                        and report local civic problems — all in one place.
                    </p>
                    <div className="hero-actions">
                        <Link to="/jankhabar" className="hero-cta hero-cta-primary">
                            🔎 Discover Schemes
                        </Link>
                        <Link to="/jansamasya" className="hero-cta hero-cta-secondary">
                            🛠 Report Issue
                        </Link>
                    </div>
                </div>
            </section>

            {/* Quick Actions */}
            <section className="quick-actions-section">
                <div className="section-header">
                    <h2>Quick Actions</h2>
                </div>
                <div className="quick-actions-grid">
                    <Link to="/jankhabar" className="card quick-action-card">
                        <div className="quick-action-icon eligibility">✅</div>
                        <h3>Check Eligibility</h3>
                        <p>See which schemes you qualify for based on your profile</p>
                    </Link>
                    <div className="card quick-action-card" onClick={onOpenAI} role="button" tabIndex={0}>
                        <div className="quick-action-icon ai">🤖</div>
                        <h3>Ask AI</h3>
                        <p>Get instant answers about schemes & services</p>
                    </div>
                    <Link to="/track" className="card quick-action-card">
                        <div className="quick-action-icon track">📊</div>
                        <h3>Track Complaint</h3>
                        <p>Check the status of your submitted complaints</p>
                    </Link>
                </div>
            </section>

            {/* Recent Activity + Announcements Grid */}
            <section className="recent-activity-section">
                <div className="home-grid">
                    <div className="card activity-card">
                        <h3>📋 Recent Activity</h3>
                        <div className="activity-item">
                            <div className="activity-icon scheme">📗</div>
                            <div className="activity-text">
                                <h4>Saved: PM Kisan Samman Nidhi</h4>
                                <p>2 hours ago</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon complaint">🚧</div>
                            <div className="activity-text">
                                <h4>Complaint #4521 — Pothole on MG Road</h4>
                                <p>Status: In Progress • 1 day ago</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon scheme">📗</div>
                            <div className="activity-text">
                                <h4>Viewed: Atal Pension Yojana</h4>
                                <p>3 days ago</p>
                            </div>
                        </div>
                    </div>

                    <div className="card announce-card">
                        <h3>📢 Announcements</h3>
                        <div className="announce-item">
                            <span className="announce-tag">New Scheme</span>
                            <h4>PM Vishwakarma Yojana Launched</h4>
                            <p>Support for traditional artisans and craftspeople. Apply before March 31.</p>
                        </div>
                        <div className="announce-item">
                            <span className="announce-tag">Deadline</span>
                            <h4>Scholarship Applications Closing Soon</h4>
                            <p>National Merit Scholarship deadline: February 28, 2026.</p>
                        </div>
                        <div className="announce-item">
                            <span className="announce-tag">Update</span>
                            <h4>Faster Complaint Resolution</h4>
                            <p>Average resolution time reduced to 5 days across all categories.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-row">
                <div className="card stat-card">
                    <div className="stat-value">2,500+</div>
                    <div className="stat-label">Government Schemes</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">1.2M</div>
                    <div className="stat-label">Citizens Helped</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">89%</div>
                    <div className="stat-label">Issues Resolved</div>
                </div>
                <div className="card stat-card">
                    <div className="stat-value">28</div>
                    <div className="stat-label">States Covered</div>
                </div>
            </section>
        </div>
    );
}
